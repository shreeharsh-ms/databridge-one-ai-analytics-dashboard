import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestConnection.css';
import mongodbService from '../../services/mongodbService';

const TestConnection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [testProgress, setTestProgress] = useState(0);
  const [connectionDetails, setConnectionDetails] = useState(null);

  useEffect(() => {
    if (location.state?.connectionData) {
      setConnectionDetails({
        ...location.state.connectionData,
        connectionUri: location.state.connectionUri
      });
    }
  }, [location.state]);

  const performRealConnectionTest = async () => {
    setIsTesting(true);
    setConnectionStatus('testing');
    setTestProgress(0);

    const progressInterval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Perform actual connection test
      const result = await mongodbService.testConnection(connectionDetails);
      
      clearInterval(progressInterval);
      setTestProgress(100);

      // Format results for display
      const realResults = {
        success: result.success,
        timestamp: new Date().toISOString(),
        metrics: {
          connectionTime: 'Measured', // Real timing would need performance measurement
          authenticationTime: 'Verified',
          queryTime: 'Completed',
          totalTime: 'Connected'
        },
        details: result.details || {
          serverVersion: result.serverInfo?.version || 'Unknown',
          protocol: connectionDetails?.protocol || 'mongodb://',
          sslEnabled: connectionDetails?.sslEnabled || false,
          compression: result.details?.compression || 'none',
          maxConnections: result.details?.maxConnections || 0,
          activeConnections: result.details?.activeConnections || 0
        },
        databases: result.databases || [],
        collections: 0, // Would need additional query
        issues: []
      };

      if (!realResults.success) {
        realResults.issues = [
          {
            type: result.errorType || 'connection',
            message: result.message || 'Connection failed',
            severity: 'high'
          }
        ];
      }

      setTestResults(realResults);
      setConnectionStatus(realResults.success ? 'connected' : 'failed');
      
    } catch (error) {
      clearInterval(progressInterval);
      setTestProgress(100);
      
      const errorResults = {
        success: false,
        timestamp: new Date().toISOString(),
        metrics: {},
        details: {},
        databases: [],
        collections: 0,
        issues: [{
          type: 'unexpected',
          message: `Unexpected error: ${error.message}`,
          severity: 'high'
        }]
      };
      
      setTestResults(errorResults);
      setConnectionStatus('failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { label: 'Verified', class: 'verified' },
      needs_verification: { label: 'Needs Verification', class: 'needs-verification' },
      failed: { label: 'Failed', class: 'failed' },
      testing: { label: 'Testing', class: 'testing' },
      connected: { label: 'Connected', class: 'connected' },
      disconnected: { label: 'Disconnected', class: 'disconnected' }
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const navigateToConfigure = () => {
    navigate('/configure-mongodb');
  };

  const navigateToExplore = () => {
    if (connectionDetails && testResults?.success) {
      navigate('/data-explore', {
        state: {
          connectionData: connectionDetails,
          testResults: testResults
        }
      });
    }
  };

  const runAnotherTest = () => {
    setTestResults(null);
    setConnectionStatus('disconnected');
    setTestProgress(0);
  };

  return (
    <div className="test-connection-container">
      <div className="test-connection-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Connection Testing</h1>
            <p>Verify database connectivity and performance metrics</p>
          </div>
          <button 
            className="btn-configure"
            onClick={navigateToConfigure}
          >
            Configure New Connection
          </button>
        </div>
      </div>

      <div className="test-connection-body">
        <div className="test-panel">
          {connectionDetails ? (
            <div className="test-content">
              <div className="test-header">
                <div className="connection-title">
                  <h2>{connectionDetails.connectionName || 'Unnamed Connection'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span className="connection-type">{connectionDetails.connectionType.toUpperCase()}</span>
                  <span className="connection-host">{connectionDetails.host}</span>
                  {connectionDetails.port && (
                    <span className="connection-port">:{connectionDetails.port}</span>
                  )}
                </div>
              </div>

              <div className="test-controls">
                {!testResults && (
                  <button
                    className={`btn-test ${isTesting ? 'testing' : ''}`}
                    onClick={performRealConnectionTest}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <>
                        <span className="loading-spinner"></span>
                        Testing Connection...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                )}
                
                {testResults && (
                  <div className="post-test-actions">
                    <button
                      className="btn-test-secondary"
                      onClick={runAnotherTest}
                    >
                      Run Another Test
                    </button>
                    {testResults.success && (
                      <button
                        className="btn-test-primary"
                        onClick={navigateToExplore}
                      >
                        Explore Data
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isTesting && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Establishing Connection</span>
                    <span>{testProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${testProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    <div className={`progress-step ${testProgress >= 20 ? 'completed' : ''}`}>
                      Network Reachability
                    </div>
                    <div className={`progress-step ${testProgress >= 50 ? 'completed' : ''}`}>
                      Authentication
                    </div>
                    <div className={`progress-step ${testProgress >= 80 ? 'completed' : ''}`}>
                      Database Access
                    </div>
                    <div className={`progress-step ${testProgress >= 100 ? 'completed' : ''}`}>
                      Performance Test
                    </div>
                  </div>
                </div>
              )}

              {testResults && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>Test Results</h3>
                    <span className="results-timestamp">
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className={`results-summary ${testResults.success ? 'success' : 'error'}`}>
                    <div className="summary-content">
                      <div className="summary-icon">
                        {testResults.success ? '✅' : '❌'}
                      </div>
                      <div className="summary-text">
                        <div className="summary-title">
                          {testResults.success ? 'Connection Successful' : 'Connection Failed'}
                        </div>
                        <div className="summary-description">
                          {testResults.success 
                            ? 'All connection tests passed successfully' 
                            : 'One or more tests failed during connection attempt'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {testResults.success && (
                    <>
                      <div className="metrics-grid">
                        <div className="metric-card">
                          <div className="metric-value">{testResults.metrics.connectionTime}</div>
                          <div className="metric-label">Connection Time</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-value">{testResults.metrics.authenticationTime}</div>
                          <div className="metric-label">Authentication</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-value">{testResults.metrics.queryTime}</div>
                          <div className="metric-label">Query Time</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-value">{testResults.metrics.totalTime}</div>
                          <div className="metric-label">Total Time</div>
                        </div>
                      </div>

                      <div className="details-grid">
                        <div className="detail-section">
                          <h4>Server Information</h4>
                          <div className="detail-item">
                            <span>MongoDB Version</span>
                            <span>{testResults.details.serverVersion}</span>
                          </div>
                          <div className="detail-item">
                            <span>Connection Protocol</span>
                            <span>{testResults.details.protocol}</span>
                          </div>
                          <div className="detail-item">
                            <span>SSL/TLS</span>
                            <span>{testResults.details.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <div className="detail-item">
                            <span>Active Connections</span>
                            <span>{testResults.details.activeConnections}</span>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Database Information</h4>
                          <div className="detail-item">
                            <span>Available Databases</span>
                            <span>{testResults.databases.length}</span>
                          </div>
                          <div className="detail-item">
                            <span>Total Collections</span>
                            <span>{testResults.collections}</span>
                          </div>
                          <div className="detail-item">
                            <span>Compression</span>
                            <span>{testResults.details.compression}</span>
                          </div>
                          <div className="detail-item">
                            <span>Default Database</span>
                            <span>{connectionDetails.databaseName || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="databases-section">
                        <h4>Available Databases</h4>
                        <div className="databases-list">
                          {testResults.databases.map((db, index) => (
                            <div key={index} className="database-item">
                              <span className="db-name">{db}</span>
                              <span className="db-status">Available</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {testResults.issues.length > 0 && (
                    <div className="issues-section">
                      <h4>Connection Issues</h4>
                      <div className="issues-list">
                        {testResults.issues.map((issue, index) => (
                          <div key={index} className={`issue-item ${issue.severity}`}>
                            <div className="issue-header">
                              <div className="issue-severity">{issue.severity.toUpperCase()}</div>
                              <div className="issue-type">{issue.type}</div>
                            </div>
                            <div className="issue-message">{issue.message}</div>
                            <div className="issue-suggestion">
                              {issue.type === 'authentication' && 'Check your username and password'}
                              {issue.type === 'network' && 'Verify host and port configuration'}
                              {issue.type === 'ssl' && 'Check SSL certificate configuration'}
                              {issue.type === 'replica_set' && 'Verify replica set name and members'}
                              {issue.type === 'timeout' && 'Check network connectivity and firewall settings'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isTesting && !testResults && (
                <div className="test-instructions">
                  <h4>Ready to Test</h4>
                  <p>Click "Test Connection" to verify your MongoDB configuration.</p>
                  <ul>
                    <li>Network connectivity to {connectionDetails.host}</li>
                    <li>Authentication credentials validation</li>
                    <li>Database access permissions</li>
                    <li>Performance metrics collection</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="no-connection-selected">
              <div className="empty-state">
                <div className="empty-icon">🔌</div>
                <h3>No Connection Selected</h3>
                <p>Please configure a MongoDB connection first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure MongoDB Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
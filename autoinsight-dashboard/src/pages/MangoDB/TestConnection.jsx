import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestConnection.css';

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

  const simulateConnectionTest = async () => {
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

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(progressInterval);
    setTestProgress(100);

    const mockResults = {
      success: Math.random() > 0.3,
      timestamp: new Date().toISOString(),
      metrics: {
        connectionTime: '125ms',
        authenticationTime: '45ms',
        queryTime: '28ms',
        totalTime: '198ms'
      },
      details: {
        serverVersion: '6.0.5',
        protocol: connectionDetails?.protocol || 'mongodb://',
        sslEnabled: connectionDetails?.sslEnabled || true,
        compression: 'zstd'
      },
      databases: ['admin', 'config', 'local', connectionDetails?.databaseName || 'test'],
      collections: 12,
      issues: []
    };

    if (!mockResults.success) {
      mockResults.issues = [
        {
          type: 'authentication',
          message: 'Invalid credentials provided',
          severity: 'high'
        }
      ];
    }

    setTestResults(mockResults);
    setIsTesting(false);
    setConnectionStatus(mockResults.success ? 'connected' : 'failed');
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
    navigate('/configure');
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
                  <h2>{connectionDetails.connectionName || 'Current Configuration'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span>{connectionDetails.connectionType.toUpperCase()} • {connectionDetails.host}</span>
                </div>
              </div>

              <div className="test-controls">
                <button
                  className={`btn-test ${isTesting ? 'testing' : ''}`}
                  onClick={simulateConnectionTest}
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

                  {testResults.success && (
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
                  )}

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
                    </div>
                  </div>

                  {testResults.issues.length > 0 && (
                    <div className="issues-section">
                      <h4>Connection Issues</h4>
                      {testResults.issues.map((issue, index) => (
                        <div key={index} className={`issue-item ${issue.severity}`}>
                          <div className="issue-severity">{issue.severity.toUpperCase()}</div>
                          <div className="issue-message">{issue.message}</div>
                          <div className="issue-type">{issue.type}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-connection-selected">
              <div className="empty-state">
                <h3>No Connection Data</h3>
                <p>Configure a connection first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure Connection
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
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestPostgreSQLConnection.css';

const TestPostgreSQLConnection = () => {
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
        connectionUri: location.state.connectionUri,
        databaseType: location.state.databaseType || 'postgresql'
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
        connectionTime: '89ms',
        authenticationTime: '32ms',
        queryTime: '15ms',
        totalTime: '136ms'
      },
      details: {
        serverVersion: '15.3',
        protocol: 'PostgreSQL',
        sslEnabled: connectionDetails?.sslEnabled || true,
        sslMode: connectionDetails?.sslMode || 'require',
        encoding: 'UTF8'
      },
      databases: [connectionDetails?.databaseName || 'postgres', 'template1', 'template0'],
      schemas: ['public', 'information_schema', 'pg_catalog'],
      tables: 24,
      issues: []
    };

    if (!mockResults.success) {
      mockResults.issues = [
        {
          type: 'authentication',
          message: 'Password authentication failed for user',
          severity: 'high'
        },
        {
          type: 'network',
          message: 'Connection refused - server not listening on specified port',
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
    navigate('/configure-postgresql');
  };

  return (
    <div className="postgresql-test-container">
      <div className="test-connection-header">
        <div className="header-content">
          <div className="header-main">
            <h1>PostgreSQL Connection Testing</h1>
            <p>Verify PostgreSQL database connectivity and performance metrics</p>
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
                  <h2>{connectionDetails.connectionName || 'PostgreSQL Configuration'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span>{connectionDetails.host}:{connectionDetails.port} • {connectionDetails.databaseName}</span>
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
                      Testing PostgreSQL Connection...
                    </>
                  ) : (
                    'Test PostgreSQL Connection'
                  )}
                </button>
              </div>

              {isTesting && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Establishing PostgreSQL Connection</span>
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
                      Network Connectivity
                    </div>
                    <div className={`progress-step ${testProgress >= 50 ? 'completed' : ''}`}>
                      PostgreSQL Handshake
                    </div>
                    <div className={`progress-step ${testProgress >= 80 ? 'completed' : ''}`}>
                      Authentication
                    </div>
                    <div className={`progress-step ${testProgress >= 100 ? 'completed' : ''}`}>
                      Database Access
                    </div>
                  </div>
                </div>
              )}

              {testResults && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>PostgreSQL Test Results</h3>
                    <span className="results-timestamp">
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className={`results-summary ${testResults.success ? 'success' : 'error'}`}>
                    <div className="summary-content">
                      <div className="summary-title">
                        {testResults.success ? 'PostgreSQL Connection Successful' : 'PostgreSQL Connection Failed'}
                      </div>
                      <div className="summary-description">
                        {testResults.success 
                          ? 'All PostgreSQL connection tests passed successfully' 
                          : 'One or more tests failed during PostgreSQL connection attempt'
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
                        <span>PostgreSQL Version</span>
                        <span>{testResults.details.serverVersion}</span>
                      </div>
                      <div className="detail-item">
                        <span>Protocol</span>
                        <span>{testResults.details.protocol}</span>
                      </div>
                      <div className="detail-item">
                        <span>SSL/TLS</span>
                        <span>{testResults.details.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      {testResults.details.sslEnabled && (
                        <div className="detail-item">
                          <span>SSL Mode</span>
                          <span>{testResults.details.sslMode}</span>
                        </div>
                      )}
                    </div>

                    <div className="detail-section">
                      <h4>Database Information</h4>
                      <div className="detail-item">
                        <span>Current Database</span>
                        <span>{connectionDetails.databaseName}</span>
                      </div>
                      <div className="detail-item">
                        <span>Available Databases</span>
                        <span>{testResults.databases.length}</span>
                      </div>
                      <div className="detail-item">
                        <span>Schemas</span>
                        <span>{testResults.schemas.length}</span>
                      </div>
                      <div className="detail-item">
                        <span>Total Tables</span>
                        <span>{testResults.tables}</span>
                      </div>
                    </div>
                  </div>

                  {testResults.issues.length > 0 && (
                    <div className="issues-section">
                      <h4>PostgreSQL Connection Issues</h4>
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
                <h3>No PostgreSQL Connection Data</h3>
                <p>Configure a PostgreSQL connection first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure PostgreSQL Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPostgreSQLConnection;
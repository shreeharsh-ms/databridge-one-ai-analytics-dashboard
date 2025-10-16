import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestOracleConnection.css';

const TestOracleConnection = () => {
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
        databaseType: location.state.databaseType || 'oracle'
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
        connectionTime: '112ms',
        authenticationTime: '67ms',
        queryTime: '23ms',
        totalTime: '202ms'
      },
      details: {
        serverVersion: 'Oracle Database 19c Enterprise Edition',
        oracleVersion: '19.0.0.0.0',
        protocol: connectionDetails?.sslEnabled ? 'TCPS' : 'TCP',
        sslEnabled: connectionDetails?.sslEnabled || false,
        characterSet: 'AL32UTF8',
        nlsLanguage: 'AMERICAN_AMERICA.UTF8'
      },
      databaseInfo: {
        instanceName: connectionDetails?.sid || 'ORCL',
        serviceName: connectionDetails?.serviceName || 'orcl.localdomain',
        hostName: connectionDetails?.host,
        tablespaces: ['SYSTEM', 'SYSAUX', 'TEMP', 'USERS'],
        schemas: ['SYS', 'SYSTEM', 'SCOTT']
      },
      sessions: 45,
      issues: []
    };

    if (!mockResults.success) {
      mockResults.issues = [
        {
          type: 'authentication',
          message: 'ORA-01017: invalid username/password; logon denied',
          severity: 'high'
        },
        {
          type: 'network',
          message: 'ORA-12541: TNS:no listener',
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
    navigate('/configure-oracle');
  };

  return (
    <div className="oracle-test-container">
      <div className="test-connection-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Oracle Database Connection Testing</h1>
            <p>Verify Oracle Database connectivity and performance metrics</p>
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
                  <h2>{connectionDetails.connectionName || 'Oracle Database Configuration'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span>
                    {connectionDetails.host}:{connectionDetails.port} • 
                    {connectionDetails.identifierType === 'sid' ? 
                      ` SID: ${connectionDetails.sid}` : 
                      ` Service: ${connectionDetails.serviceName}`
                    }
                  </span>
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
                      Testing Oracle Connection...
                    </>
                  ) : (
                    'Test Oracle Connection'
                  )}
                </button>
              </div>

              {isTesting && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Establishing Oracle Database Connection</span>
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
                      TNS Listener
                    </div>
                    <div className={`progress-step ${testProgress >= 50 ? 'completed' : ''}`}>
                      Oracle Handshake
                    </div>
                    <div className={`progress-step ${testProgress >= 80 ? 'completed' : ''}`}>
                      Authentication
                    </div>
                    <div className={`progress-step ${testProgress >= 100 ? 'completed' : ''}`}>
                      Session Setup
                    </div>
                  </div>
                </div>
              )}

              {testResults && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>Oracle Database Test Results</h3>
                    <span className="results-timestamp">
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className={`results-summary ${testResults.success ? 'success' : 'error'}`}>
                    <div className="summary-content">
                      <div className="summary-title">
                        {testResults.success ? 'Oracle Connection Successful' : 'Oracle Connection Failed'}
                      </div>
                      <div className="summary-description">
                        {testResults.success 
                          ? 'Oracle Database connection established successfully' 
                          : 'Failed to establish connection to Oracle Database'
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
                        <span>Oracle Version</span>
                        <span>{testResults.details.oracleVersion}</span>
                      </div>
                      <div className="detail-item">
                        <span>Edition</span>
                        <span>{testResults.details.serverVersion}</span>
                      </div>
                      <div className="detail-item">
                        <span>Protocol</span>
                        <span>{testResults.details.protocol}</span>
                      </div>
                      <div className="detail-item">
                        <span>Character Set</span>
                        <span>{testResults.details.characterSet}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Database Information</h4>
                      <div className="detail-item">
                        <span>Instance Name</span>
                        <span>{testResults.databaseInfo.instanceName}</span>
                      </div>
                      <div className="detail-item">
                        <span>Service Name</span>
                        <span>{testResults.databaseInfo.serviceName}</span>
                      </div>
                      <div className="detail-item">
                        <span>Active Sessions</span>
                        <span>{testResults.sessions}</span>
                      </div>
                      <div className="detail-item">
                        <span>Tablespaces</span>
                        <span>{testResults.databaseInfo.tablespaces.length}</span>
                      </div>
                    </div>
                  </div>

                  {testResults.success && (
                    <div className="additional-info">
                      <div className="info-section">
                        <h4>Available Tablespaces</h4>
                        <div className="info-list">
                          {testResults.databaseInfo.tablespaces.map((tablespace, index) => (
                            <span key={index} className="info-item">{tablespace}</span>
                          ))}
                        </div>
                      </div>
                      <div className="info-section">
                        <h4>System Schemas</h4>
                        <div className="info-list">
                          {testResults.databaseInfo.schemas.map((schema, index) => (
                            <span key={index} className="info-item">{schema}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {testResults.issues.length > 0 && (
                    <div className="issues-section">
                      <h4>Oracle Connection Issues</h4>
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
                <h3>No Oracle Connection Data</h3>
                <p>Configure an Oracle Database connection first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure Oracle Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestOracleConnection;
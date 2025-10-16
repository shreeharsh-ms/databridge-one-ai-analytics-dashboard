import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestMySQL.css';

const TestMySQL = () => {
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

  const simulateMySQLTest = async () => {
    setIsTesting(true);
    setConnectionStatus('testing');
    setTestProgress(0);

    const progressInterval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(progressInterval);
    setTestProgress(100);

    const mockResults = {
      success: Math.random() > 0.3,
      timestamp: new Date().toISOString(),
      metrics: {
        connectionTime: '45ms',
        authenticationTime: '28ms',
        queryTime: '12ms',
        totalTime: '85ms'
      },
      details: {
        serverVersion: '8.0.35',
        sslEnabled: connectionDetails?.enableSSL || false,
        charset: connectionDetails?.charset || 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        protocol: 'TCP/IP'
      },
      databaseInfo: {
        tableCount: 12,
        viewCount: 3,
        totalSize: '64.8 MB',
        sampleTables: [
          { name: 'users', rows: 1250, size: '2.1 MB', engine: 'InnoDB' },
          { name: 'orders', rows: 8450, size: '15.8 MB', engine: 'InnoDB' },
          { name: 'products', rows: 320, size: '1.2 MB', engine: 'InnoDB' },
          { name: 'categories', rows: 45, size: '0.3 MB', engine: 'InnoDB' },
          { name: 'logs', rows: 12500, size: '45.2 MB', engine: 'InnoDB' }
        ]
      },
      issues: []
    };

    if (!mockResults.success) {
      mockResults.issues = [
        {
          type: 'authentication',
          message: 'Access denied for user. Check username and password',
          severity: 'high'
        },
        {
          type: 'network',
          message: 'Unable to connect to MySQL server on specified host and port',
          severity: 'high'
        }
      ];
    } else {
      // Add warnings even for successful tests
      if (!mockResults.details.sslEnabled) {
        mockResults.issues.push({
          type: 'security',
          message: 'SSL encryption is not enabled for this connection',
          severity: 'medium'
        });
      }
      
      if (mockResults.metrics.totalTime > '500ms') {
        mockResults.issues.push({
          type: 'performance',
          message: 'Connection time exceeds 500ms threshold',
          severity: 'low'
        });
      }
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
    navigate('/configure-mysql');
  };

  const saveConnection = () => {
    console.log('Saving MySQL connection:', { ...connectionDetails, testResults });
    alert('MySQL connection has been saved successfully.');
    navigate('/mysql-connections');
  };

  return (
    <div className="test-mysql-container">
      <div className="test-mysql-header">
        <div className="header-content">
          <div className="header-main">
            <h1>MySQL Connection Testing</h1>
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

      <div className="test-mysql-body">
        <div className="test-panel">
          {connectionDetails ? (
            <div className="test-content">
              <div className="test-header">
                <div className="connection-title">
                  <h2>{connectionDetails.connectionName || 'Current MySQL Database'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span>{connectionDetails.host}:{connectionDetails.port} • {connectionDetails.database}</span>
                </div>
              </div>

              <div className="test-controls">
                <button
                  className={`btn-test ${isTesting ? 'testing' : ''}`}
                  onClick={simulateMySQLTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Testing MySQL Connection...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              </div>

              {isTesting && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Establishing Database Connection</span>
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
                    <div className={`progress-step ${testProgress >= 40 ? 'completed' : ''}`}>
                      Authentication
                    </div>
                    <div className={`progress-step ${testProgress >= 60 ? 'completed' : ''}`}>
                      Database Access
                    </div>
                    <div className={`progress-step ${testProgress >= 80 ? 'completed' : ''}`}>
                      Query Execution
                    </div>
                    <div className={`progress-step ${testProgress >= 100 ? 'completed' : ''}`}>
                      Schema Analysis
                    </div>
                  </div>
                </div>
              )}

              {testResults && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>MySQL Test Results</h3>
                    <span className="results-timestamp">
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className={`results-summary ${testResults.success ? 'success' : 'error'}`}>
                    <div className="summary-content">
                      <div className="summary-title">
                        {testResults.success ? 'MySQL Connection Successful' : 'MySQL Connection Failed'}
                      </div>
                      <div className="summary-description">
                        {testResults.success 
                          ? 'Database is accessible and responding correctly' 
                          : 'Database is unreachable or authentication failed'
                        }
                      </div>
                    </div>
                  </div>

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

                  <div className="connection-preview">
                    <div className="preview-header">
                      <h4>Connection String</h4>
                      <button 
                        className="copy-button"
                        onClick={() => navigator.clipboard.writeText(connectionDetails.connectionUri)}
                      >
                        Copy
                      </button>
                    </div>
                    <div className="connection-preview-content">
                      <code>{connectionDetails.connectionUri}</code>
                    </div>
                  </div>

                  <div className="details-grid">
                    <div className="detail-section">
                      <h4>Server Information</h4>
                      <div className="detail-item">
                        <span>MySQL Version</span>
                        <span>{testResults.details.serverVersion}</span>
                      </div>
                      <div className="detail-item">
                        <span>SSL/TLS</span>
                        <span>{testResults.details.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="detail-item">
                        <span>Character Set</span>
                        <span>{testResults.details.charset}</span>
                      </div>
                      <div className="detail-item">
                        <span>Collation</span>
                        <span>{testResults.details.collation}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Database Information</h4>
                      <div className="detail-item">
                        <span>Total Tables</span>
                        <span>{testResults.databaseInfo.tableCount}</span>
                      </div>
                      <div className="detail-item">
                        <span>Total Views</span>
                        <span>{testResults.databaseInfo.viewCount}</span>
                      </div>
                      <div className="detail-item">
                        <span>Database Size</span>
                        <span>{testResults.databaseInfo.totalSize}</span>
                      </div>
                      <div className="detail-item">
                        <span>Connection Protocol</span>
                        <span>{testResults.details.protocol}</span>
                      </div>
                    </div>
                  </div>

                  {testResults.databaseInfo.sampleTables.length > 0 && (
                    <div className="tables-section">
                      <h4>Sample Tables</h4>
                      <div className="tables-preview">
                        <table>
                          <thead>
                            <tr>
                              <th>Table Name</th>
                              <th>Rows</th>
                              <th>Size</th>
                              <th>Engine</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testResults.databaseInfo.sampleTables.map((table, index) => (
                              <tr key={index}>
                                <td className="table-name">{table.name}</td>
                                <td className="table-rows">{table.rows.toLocaleString()}</td>
                                <td className="table-size">{table.size}</td>
                                <td className="table-engine">{table.engine}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {testResults.issues.length > 0 && (
                    <div className="issues-section">
                      <h4>Connection Issues & Warnings</h4>
                      {testResults.issues.map((issue, index) => (
                        <div key={index} className={`issue-item ${issue.severity}`}>
                          <div className="issue-severity">{issue.severity.toUpperCase()}</div>
                          <div className="issue-message">{issue.message}</div>
                          <div className="issue-type">{issue.type.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={simulateMySQLTest}
                    >
                      Retest Connection
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={navigateToConfigure}
                    >
                      Back to Configure
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={saveConnection}
                      disabled={!testResults?.success}
                    >
                      Save Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-connection-selected">
              <div className="empty-state">
                <h3>No MySQL Connection Selected</h3>
                <p>Configure a MySQL connection first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure MySQL Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestMySQL;
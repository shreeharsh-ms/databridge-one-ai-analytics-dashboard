
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestApiConnection.css';

const TestApiConnection = () => {
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

  const simulateApiTest = async () => {
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
        responseTime: '142ms',
        statusCode: 200,
        contentLength: '2.4KB',
        server: 'nginx/1.18.0'
      },
      details: {
        method: connectionDetails?.httpMethod || 'GET',
        url: connectionDetails?.endpointUrl || 'https://api.company.com/v1/data',
        authType: connectionDetails?.authType || 'API Key',
        contentType: 'application/json',
        encoding: 'gzip'
      },
      responsePreview: {
        data: [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            status: "active",
            created_at: "2024-01-15T10:30:00Z"
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            status: "pending",
            created_at: "2024-01-16T14:20:00Z"
          },
          {
            id: 3,
            name: "Bob Johnson",
            email: "bob@example.com",
            status: "active",
            created_at: "2024-01-17T09:15:00Z"
          }
        ],
        total: 3,
        page: 1,
        pageSize: 10,
        hasMore: false
      },
      schema: {
        detected: true,
        fields: [
          { name: 'id', type: 'integer', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'status', type: 'string', required: false },
          { name: 'created_at', type: 'datetime', required: false }
        ]
      },
      issues: []
    };

    if (!mockResults.success) {
      mockResults.metrics.statusCode = 401;
      mockResults.issues = [
        {
          type: 'authentication',
          message: 'Invalid API key provided',
          severity: 'high'
        },
        {
          type: 'authorization',
          message: 'Insufficient permissions for this endpoint',
          severity: 'high'
        }
      ];
    } else {
      // Add warnings even for successful tests
      if (mockResults.metrics.responseTime > '500ms') {
        mockResults.issues.push({
          type: 'performance',
          message: 'Response time exceeds 500ms threshold',
          severity: 'medium'
        });
      }
      
      if (!mockResults.details.contentType.includes('json')) {
        mockResults.issues.push({
          type: 'format',
          message: 'Response content type is not JSON',
          severity: 'medium'
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

  const getStatusCodeClass = (code) => {
    if (code >= 200 && code < 300) return 'status-success';
    if (code >= 300 && code < 400) return 'status-warning';
    if (code >= 400 && code < 500) return 'status-client-error';
    if (code >= 500) return 'status-server-error';
    return 'status-unknown';
  };

  const navigateToConfigure = () => {
    navigate('/configure-api');
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="test-apiconnection-container">
      <div className="test-apiconnection-header">
        <div className="header-content">
          <div className="header-main">
            <h1>API Connection Testing</h1>
            <p>Verify API endpoint accessibility, authentication, and response format</p>
          </div>
          <button 
            className="btn-configure"
            onClick={navigateToConfigure}
          >
            Configure New API
          </button>
        </div>
      </div>

      <div className="test-apiconnection-body">
        <div className="test-panel">
          {connectionDetails ? (
            <div className="test-content">
              <div className="test-header">
                <div className="connection-title">
                  <h2>{connectionDetails.connectionName || 'Current API Endpoint'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span>{connectionDetails.httpMethod} • {connectionDetails.endpointUrl}</span>
                </div>
              </div>

              <div className="test-controls">
                <button
                  className={`btn-test ${isTesting ? 'testing' : ''}`}
                  onClick={simulateApiTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Testing API Connection...
                    </>
                  ) : (
                    'Test API Connection'
                  )}
                </button>
              </div>

              {isTesting && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Testing API Endpoint</span>
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
                      Resolving Endpoint
                    </div>
                    <div className={`progress-step ${testProgress >= 40 ? 'completed' : ''}`}>
                      Authenticating
                    </div>
                    <div className={`progress-step ${testProgress >= 60 ? 'completed' : ''}`}>
                      Sending Request
                    </div>
                    <div className={`progress-step ${testProgress >= 80 ? 'completed' : ''}`}>
                      Parsing Response
                    </div>
                    <div className={`progress-step ${testProgress >= 100 ? 'completed' : ''}`}>
                      Validating Format
                    </div>
                  </div>
                </div>
              )}

              {testResults && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>API Test Results</h3>
                    <span className="results-timestamp">
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className={`results-summary ${testResults.success ? 'success' : 'error'}`}>
                    <div className="summary-content">
                      <div className="summary-title">
                        {testResults.success ? 'API Connection Successful' : 'API Connection Failed'}
                      </div>
                      <div className="summary-description">
                        {testResults.success 
                          ? 'Endpoint is accessible and responding correctly' 
                          : 'Endpoint is unreachable or returned an error'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className={`metric-value ${getStatusCodeClass(testResults.metrics.statusCode)}`}>
                        {testResults.metrics.statusCode}
                      </div>
                      <div className="metric-label">Status Code</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{testResults.metrics.responseTime}</div>
                      <div className="metric-label">Response Time</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{testResults.metrics.contentLength}</div>
                      <div className="metric-label">Payload Size</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{testResults.details.contentType}</div>
                      <div className="metric-label">Content Type</div>
                    </div>
                  </div>

                  <div className="details-grid">
                    <div className="detail-section">
                      <h4>Request Details</h4>
                      <div className="detail-item">
                        <span>HTTP Method</span>
                        <span>{testResults.details.method}</span>
                      </div>
                      <div className="detail-item">
                        <span>Authentication</span>
                        <span>{testResults.details.authType}</span>
                      </div>
                      <div className="detail-item">
                        <span>Server</span>
                        <span>{testResults.metrics.server}</span>
                      </div>
                      <div className="detail-item">
                        <span>Encoding</span>
                        <span>{testResults.details.encoding}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Endpoint Information</h4>
                      <div className="detail-item">
                        <span>URL</span>
                        <span className="url-display">{testResults.details.url}</span>
                      </div>
                      <div className="detail-item">
                        <span>Connection Type</span>
                        <span>{connectionDetails?.connectionType || 'REST'}</span>
                      </div>
                      <div className="detail-item">
                        <span>Test Timestamp</span>
                        <span>{new Date(testResults.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {testResults.schema.detected && (
                    <div className="schema-section">
                      <h4>Detected Response Schema</h4>
                      <div className="schema-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Field Name</th>
                              <th>Data Type</th>
                              <th>Required</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testResults.schema.fields.map((field, index) => (
                              <tr key={index}>
                                <td className="field-name">{field.name}</td>
                                <td className="field-type">{field.type}</td>
                                <td className="field-required">
                                  {field.required ? (
                                    <span className="required-true">Yes</span>
                                  ) : (
                                    <span className="required-false">No</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="response-preview-section">
                    <div className="preview-header">
                      <h4>Response Preview</h4>
                      <button 
                        className="copy-button"
                        onClick={() => navigator.clipboard.writeText(formatJson(testResults.responsePreview))}
                      >
                        Copy JSON
                      </button>
                    </div>
                    <div className="response-preview">
                      <pre className="json-preview">
                        {formatJson(testResults.responsePreview)}
                      </pre>
                    </div>
                  </div>

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
                </div>
              )}
            </div>
          ) : (
            <div className="no-connection-selected">
              <div className="empty-state">
                <h3>No API Connection Selected</h3>
                <p>Configure an API connection first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure API Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestApiConnection;
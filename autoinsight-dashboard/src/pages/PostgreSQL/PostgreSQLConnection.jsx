import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostgreSQLConnection.css';

const PostgreSQLConnection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    connectionName: '',
    host: 'localhost',
    port: '5432',
    databaseName: '',
    username: '',
    password: '',
    sslEnabled: true,
    sslMode: 'require',
    additionalOptions: 'connect_timeout=10',
    saveCredentials: false
  });

  const [connectionUri, setConnectionUri] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    generateConnectionUri();
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateConnectionUri = () => {
    const {
      host,
      port,
      databaseName,
      username,
      password,
      sslEnabled,
      sslMode,
      additionalOptions
    } = formData;

    let uri = 'postgresql://';

    // Add authentication
    if (username && password) {
      uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    } else if (username) {
      uri += `${encodeURIComponent(username)}@`;
    }

    // Add host and port
    uri += host;
    if (port) {
      uri += `:${port}`;
    }

    // Add database name
    if (databaseName) {
      uri += `/${databaseName}`;
    }

    // Build query parameters
    const queryParams = [];

    if (sslEnabled) {
      queryParams.push(`sslmode=${sslMode}`);
    }

    if (additionalOptions) {
      queryParams.push(additionalOptions);
    }

    // Add query parameters
    if (queryParams.length > 0) {
      uri += `?${queryParams.join('&')}`;
    }

    setConnectionUri(uri);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3;
    setTestResult({
      success,
      message: success 
        ? 'PostgreSQL connection established successfully. All parameters are valid.' 
        : 'Connection failed. Please verify your credentials and network configuration.'
    });
    setIsTesting(false);
  };

  const navigateToTestPage = () => {
    navigate('/test-postgresql', { 
      state: { 
        connectionData: formData,
        connectionUri: connectionUri,
        databaseType: 'postgresql'
      } 
    });
  };

  const resetForm = () => {
    setFormData({
      connectionName: '',
      host: 'localhost',
      port: '5432',
      databaseName: '',
      username: '',
      password: '',
      sslEnabled: true,
      sslMode: 'require',
      additionalOptions: 'connect_timeout=10',
      saveCredentials: false
    });
    setTestResult(null);
  };

  return (
    <div className="postgresql-connection-container">
      <div className="connection-header">
        <div className="header-content">
          <h1>PostgreSQL Connection Configuration</h1>
          <p>Configure and manage PostgreSQL database connection parameters</p>
        </div>
      </div>

      <div className="connection-body">
        <div className="form-container">
          <div className="form-tabs">
            <button 
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Configuration
            </button>
            <button 
              className={`tab ${activeTab === 'authentication' ? 'active' : ''}`}
              onClick={() => setActiveTab('authentication')}
            >
              Authentication
            </button>
            <button 
              className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced Settings
            </button>
            <button 
              className={`tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              Review & Test
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Basic Configuration</h2>
                  <p className="section-description">
                    Configure the fundamental connection parameters for your PostgreSQL instance.
                  </p>

                  <div className="input-group">
                    <label>Connection Name</label>
                    <input
                      type="text"
                      placeholder="Production Database"
                      value={formData.connectionName}
                      onChange={(e) => handleInputChange('connectionName', e.target.value)}
                    />
                    <div className="input-description">
                      A descriptive name for this connection profile
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Host</label>
                      <input
                        type="text"
                        placeholder="localhost"
                        value={formData.host}
                        onChange={(e) => handleInputChange('host', e.target.value)}
                      />
                      <div className="input-description">
                        PostgreSQL server hostname or IP address
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Port</label>
                      <input
                        type="number"
                        placeholder="5432"
                        value={formData.port}
                        onChange={(e) => handleInputChange('port', e.target.value)}
                      />
                      <div className="input-description">
                        PostgreSQL default port is 5432
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Database Name</label>
                    <input
                      type="text"
                      placeholder="myapp"
                      value={formData.databaseName}
                      onChange={(e) => handleInputChange('databaseName', e.target.value)}
                    />
                    <div className="input-description">
                      The database to connect to
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Authentication</h2>
                  <p className="section-description">
                    Configure database authentication credentials.
                  </p>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Username</label>
                      <input
                        type="text"
                        placeholder="postgres"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                      <div className="input-description">
                        PostgreSQL database user
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                      <div className="input-description">
                        User authentication password
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Advanced Settings</h2>
                  <p className="section-description">
                    Configure advanced PostgreSQL connection parameters and security options.
                  </p>

                  <div className="security-section">
                    <h3>SSL/TLS Configuration</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.sslEnabled}
                          onChange={(e) => handleInputChange('sslEnabled', e.target.checked)}
                        />
                        <span className="toggle-label">Enable SSL/TLS Encryption</span>
                      </label>
                    </div>

                    {formData.sslEnabled && (
                      <div className="input-group">
                        <label>SSL Mode</label>
                        <select
                          value={formData.sslMode}
                          onChange={(e) => handleInputChange('sslMode', e.target.value)}
                        >
                          <option value="disable">Disable</option>
                          <option value="allow">Allow</option>
                          <option value="prefer">Prefer</option>
                          <option value="require">Require</option>
                          <option value="verify-ca">Verify CA</option>
                          <option value="verify-full">Verify Full</option>
                        </select>
                        <div className="input-description">
                          SSL verification mode for secure connections
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Additional Connection Parameters</label>
                    <input
                      type="text"
                      placeholder="connect_timeout=10"
                      value={formData.additionalOptions}
                      onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                    />
                    <div className="input-description">
                      Additional PostgreSQL connection parameters as key=value pairs
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Review & Test Connection</h2>
                  <p className="section-description">
                    Verify your configuration and test the PostgreSQL database connection.
                  </p>

                  <div className="review-section">
                    <div className="config-summary">
                      <h3>Configuration Summary</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Connection Name:</span>
                          <span className="summary-value">{formData.connectionName || 'Unnamed'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Host:</span>
                          <span className="summary-value">{formData.host}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Port:</span>
                          <span className="summary-value">{formData.port}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Database:</span>
                          <span className="summary-value">{formData.databaseName || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Username:</span>
                          <span className="summary-value">{formData.username || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">SSL/TLS:</span>
                          <span className="summary-value">{formData.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        {formData.sslEnabled && (
                          <div className="summary-item">
                            <span className="summary-label">SSL Mode:</span>
                            <span className="summary-value">{formData.sslMode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="uri-section">
                      <div className="uri-header">
                        <h3>PostgreSQL Connection String</h3>
                        <button 
                          className="copy-button"
                          onClick={() => navigator.clipboard.writeText(connectionUri)}
                        >
                          Copy URI
                        </button>
                      </div>
                      <div className="uri-display">
                        <code>{connectionUri}</code>
                      </div>
                    </div>

                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        <div className="result-content">
                          <div className="result-title">
                            {testResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
                          </div>
                          <div className="result-message">{testResult.message}</div>
                        </div>
                      </div>
                    )}

                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        Reset Configuration
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={testConnection}
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
                      <button 
                        className="btn btn-success"
                        onClick={navigateToTestPage}
                      >
                        Go to Test Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostgreSQLConnection;
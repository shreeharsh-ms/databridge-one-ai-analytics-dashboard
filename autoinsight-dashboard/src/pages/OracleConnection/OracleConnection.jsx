import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OracleConnection.css';

const OracleConnection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    connectionName: '',
    host: 'localhost',
    port: '1521',
    identifierType: 'sid',
    sid: '',
    serviceName: '',
    username: '',
    password: '',
    sslEnabled: false,
    additionalOptions: 'expire_time=10',
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
      identifierType,
      sid,
      serviceName,
      username,
      password,
      sslEnabled,
      additionalOptions
    } = formData;

    let uri = sslEnabled ? 'oracle+tcp://' : 'oracle://';

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

    // Add database identifier
    if (identifierType === 'sid' && sid) {
      uri += `/${sid}`;
    } else {
      uri += '/';
    }

    // Build query parameters
    const queryParams = [];

    if (identifierType === 'service' && serviceName) {
      queryParams.push(`service_name=${serviceName}`);
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
        ? 'Oracle Database connection established successfully. All parameters are valid.' 
        : 'Connection failed. Please verify your credentials and network configuration.'
    });
    setIsTesting(false);
  };

  const navigateToTestPage = () => {
    navigate('/test-oracle', { 
      state: { 
        connectionData: formData,
        connectionUri: connectionUri,
        databaseType: 'oracle'
      } 
    });
  };

  const resetForm = () => {
    setFormData({
      connectionName: '',
      host: 'localhost',
      port: '1521',
      identifierType: 'sid',
      sid: '',
      serviceName: '',
      username: '',
      password: '',
      sslEnabled: false,
      additionalOptions: 'expire_time=10',
      saveCredentials: false
    });
    setTestResult(null);
  };

  return (
    <div className="oracle-connection-container">
      <div className="connection-header">
        <div className="header-content">
          <h1>Oracle Database Connection Configuration</h1>
          <p>Configure and manage Oracle Database connection parameters</p>
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
                    Configure the fundamental connection parameters for your Oracle Database instance.
                  </p>

                  <div className="input-group">
                    <label>Connection Name</label>
                    <input
                      type="text"
                      placeholder="Oracle Production Database"
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
                        Oracle Database server hostname or IP address
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Port</label>
                      <input
                        type="number"
                        placeholder="1521"
                        value={formData.port}
                        onChange={(e) => handleInputChange('port', e.target.value)}
                      />
                      <div className="input-description">
                        Oracle Database default port is 1521
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Database Identifier Type</label>
                    <select
                      value={formData.identifierType}
                      onChange={(e) => handleInputChange('identifierType', e.target.value)}
                    >
                      <option value="sid">SID (System Identifier)</option>
                      <option value="service">Service Name</option>
                    </select>
                    <div className="input-description">
                      Choose how to identify the Oracle Database instance
                    </div>
                  </div>

                  {formData.identifierType === 'sid' ? (
                    <div className="input-group">
                      <label>SID</label>
                      <input
                        type="text"
                        placeholder="ORCLCDB"
                        value={formData.sid}
                        onChange={(e) => handleInputChange('sid', e.target.value)}
                      />
                      <div className="input-description">
                        Oracle System Identifier (e.g., ORCL, XE, ORCLCDB)
                      </div>
                    </div>
                  ) : (
                    <div className="input-group">
                      <label>Service Name</label>
                      <input
                        type="text"
                        placeholder="orclpdb1.localdomain"
                        value={formData.serviceName}
                        onChange={(e) => handleInputChange('serviceName', e.target.value)}
                      />
                      <div className="input-description">
                        Oracle Service Name for multi-tenant databases
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Authentication</h2>
                  <p className="section-description">
                    Configure Oracle Database authentication credentials.
                  </p>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Username</label>
                      <input
                        type="text"
                        placeholder="SYSTEM"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                      <div className="input-description">
                        Oracle Database user with appropriate privileges
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
                    Configure advanced Oracle Database connection parameters and security options.
                  </p>

                  <div className="security-section">
                    <h3>Security Configuration</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.sslEnabled}
                          onChange={(e) => handleInputChange('sslEnabled', e.target.checked)}
                        />
                        <span className="toggle-label">Enable SSL/TLS Encryption (TCPS)</span>
                      </label>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Additional Connection Parameters</label>
                    <input
                      type="text"
                      placeholder="expire_time=10&pool_min=1"
                      value={formData.additionalOptions}
                      onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                    />
                    <div className="input-description">
                      Additional Oracle connection parameters as key=value pairs
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
                    Verify your configuration and test the Oracle Database connection.
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
                          <span className="summary-label">Identifier Type:</span>
                          <span className="summary-value">
                            {formData.identifierType === 'sid' ? 'SID' : 'Service Name'}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">
                            {formData.identifierType === 'sid' ? 'SID:' : 'Service Name:'}
                          </span>
                          <span className="summary-value">
                            {formData.identifierType === 'sid' ? formData.sid : formData.serviceName}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Username:</span>
                          <span className="summary-value">{formData.username || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">SSL/TLS:</span>
                          <span className="summary-value">{formData.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="uri-section">
                      <div className="uri-header">
                        <h3>Oracle Database Connection String</h3>
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

export default OracleConnection;
import React, { useState, useEffect } from 'react';
import './MongoDBConnection.css';
import { useNavigate } from 'react-router-dom';



const MongoDBConnection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    connectionType: 'local',
    connectionName: '',
    host: 'localhost',
    port: '27017',
    databaseName: '',
    authRequired: false,
    username: '',
    password: '',
    authSource: 'admin',
    protocol: 'mongodb://',
    sslEnabled: true,
    replicaSetName: '',
    additionalOptions: 'retryWrites=true&w=majority',
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
      protocol,
      host,
      port,
      databaseName,
      authRequired,
      username,
      password,
      authSource,
      replicaSetName,
      additionalOptions
    } = formData;

    let uri = protocol;

    if (authRequired && username && password) {
      uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }

    uri += host;

    if (protocol === 'mongodb://' && port) {
      uri += `:${port}`;
    }

    if (databaseName) {
      uri += `/${databaseName}`;
    } else {
      uri += '/';
    }

    const queryParams = [];

    if (authRequired && authSource) {
      queryParams.push(`authSource=${authSource}`);
    }

    if (replicaSetName) {
      queryParams.push(`replicaSet=${replicaSetName}`);
    }

    if (additionalOptions) {
      queryParams.push(additionalOptions);
    }

    if (queryParams.length > 0) {
      uri += `?${queryParams.join('&')}`;
    }

    setConnectionUri(uri);
  };

const testConnection = async () => {
  setIsTesting(true);
  setTestResult(null);

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = Math.random() > 0.3;
  setTestResult({
    success,
    message: success 
      ? 'Connection established successfully. All parameters are valid.' 
      : 'Connection failed. Please verify your credentials and network configuration.'
  });
  setIsTesting(false);

  // ✅ Navigate to test page after simulating connection
  navigate('/test-mongodb', {
    state: {
      connectionData: formData,
      connectionUri
    }
  });
};
  const saveConnection = () => {
    console.log('Saving connection:', { ...formData, connectionUri });
    alert('Connection profile has been saved successfully.');
  };

  const resetForm = () => {
    setFormData({
      connectionType: 'local',
      connectionName: '',
      host: 'localhost',
      port: '27017',
      databaseName: '',
      authRequired: false,
      username: '',
      password: '',
      authSource: 'admin',
      protocol: 'mongodb://',
      sslEnabled: true,
      replicaSetName: '',
      additionalOptions: 'retryWrites=true&w=majority',
      saveCredentials: false
    });
    setTestResult(null);
  };

  return (
    <div className="mongo-connection-container">
      <div className="connection-header">
        <div className="header-content">
          <h1>MongoDB Connection Configuration</h1>
          <p>Configure and manage database connection parameters</p>
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
                    Configure the fundamental connection parameters for your MongoDB instance.
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
                      <label>Connection Type</label>
                      <select
                        value={formData.connectionType}
                        onChange={(e) => handleInputChange('connectionType', e.target.value)}
                      >
                        <option value="local">Local Development</option>
                        <option value="atlas">MongoDB Atlas</option>
                        <option value="custom">Custom Configuration</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Protocol</label>
                      <select
                        value={formData.protocol}
                        onChange={(e) => handleInputChange('protocol', e.target.value)}
                      >
                        <option value="mongodb://">mongodb://</option>
                        <option value="mongodb+srv://">mongodb+srv://</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>
                        {formData.protocol === 'mongodb+srv://' ? 'Cluster Hostname' : 'Host'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          formData.protocol === 'mongodb+srv://' 
                            ? 'cluster0.abcd.mongodb.net' 
                            : 'localhost'
                        }
                        value={formData.host}
                        onChange={(e) => handleInputChange('host', e.target.value)}
                      />
                    </div>

                    {formData.protocol === 'mongodb://' && (
                      <div className="input-group">
                        <label>Port</label>
                        <input
                          type="number"
                          placeholder="27017"
                          value={formData.port}
                          onChange={(e) => handleInputChange('port', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Default Database</label>
                    <input
                      type="text"
                      placeholder="myapp"
                      value={formData.databaseName}
                      onChange={(e) => handleInputChange('databaseName', e.target.value)}
                    />
                    <div className="input-description">
                      The database to connect to initially
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
                    Configure database authentication and security settings.
                  </p>

                  <div className="toggle-group">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={formData.authRequired}
                        onChange={(e) => handleInputChange('authRequired', e.target.checked)}
                      />
                      <span className="toggle-label">Enable Authentication</span>
                    </label>
                  </div>

                  {formData.authRequired && (
                    <div className="form-row">
                      <div className="input-group">
                        <label>Username</label>
                        <input
                          type="text"
                          placeholder="admin"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>Password</label>
                        <input
                          type="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {formData.authRequired && (
                    <div className="input-group">
                      <label>Authentication Database</label>
                      <input
                        type="text"
                        placeholder="admin"
                        value={formData.authSource}
                        onChange={(e) => handleInputChange('authSource', e.target.value)}
                      />
                      <div className="input-description">
                        Database where user credentials are stored
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Advanced Settings</h2>
                  <p className="section-description">
                    Configure advanced connection parameters and security options.
                  </p>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Replica Set Name</label>
                      <input
                        type="text"
                        placeholder="rs0"
                        value={formData.replicaSetName}
                        onChange={(e) => handleInputChange('replicaSetName', e.target.value)}
                      />
                    </div>
                    
                    <div className="input-group">
                      <label>Connection Options</label>
                      <input
                        type="text"
                        placeholder="retryWrites=true&w=majority"
                        value={formData.additionalOptions}
                        onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="security-section">
                    <h3>Security Settings</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.sslEnabled}
                          onChange={(e) => handleInputChange('sslEnabled', e.target.checked)}
                        />
                        <span className="toggle-label">Enable TLS/SSL Encryption</span>
                      </label>
                      
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.saveCredentials}
                          onChange={(e) => handleInputChange('saveCredentials', e.target.checked)}
                        />
                        <span className="toggle-label">Save Connection Profile</span>
                      </label>
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
                    Verify your configuration and test the database connection.
                  </p>

                  <div className="review-section">
                    <div className="config-summary">
                      <h3>Configuration Summary</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Connection Type:</span>
                          <span className="summary-value">{formData.connectionType}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Host:</span>
                          <span className="summary-value">{formData.host}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Database:</span>
                          <span className="summary-value">{formData.databaseName || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Authentication:</span>
                          <span className="summary-value">{formData.authRequired ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="uri-section">
                      <div className="uri-header">
                        <h3>Connection String</h3>
                        <button 
                          className="copy-button"
                          onClick={() => navigator.clipboard.writeText(connectionUri)}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="uri-display">
                        <code>{connectionUri}</code>
                      </div>
                    </div>

                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        <div className="result-message">
                          {testResult.message}
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
                        {isTesting ? 'Testing Connection...' : 'Test Connection'}
                      </button>
                      <button 
                        className="btn btn-success"
                        onClick={saveConnection}
                      >
                        Save Configuration
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

export default MongoDBConnection;
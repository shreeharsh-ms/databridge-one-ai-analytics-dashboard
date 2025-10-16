import React, { useState, useEffect } from 'react';
import './MySQLConfiguration.css';
import { useNavigate } from 'react-router-dom';

const MySQLConfiguration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    connectionName: '',
    host: 'localhost',
    port: '3306',
    database: '',
    username: '',
    password: '',
    saveCredentials: false,
    enableSSL: false,
    sslCa: '',
    sslCert: '',
    sslKey: '',
    enableSSHTunnel: false,
    sshHost: '',
    sshPort: '22',
    sshUsername: '',
    sshPrivateKey: '',
    timeout: 30,
    charset: 'utf8mb4',
    timezone: 'UTC',
    connectionPooling: {
      enabled: true,
      maxConnections: 10,
      minConnections: 2
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      backoff: 'exponential'
    },
    additionalOptions: ''
  });

  const [connectionString, setConnectionString] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);

  useEffect(() => {
    generateConnectionString();
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const generateConnectionString = () => {
    const { host, port, database, username, enableSSL, charset, timezone } = formData;
    
    let connectionStr = `mysql://${username}:***@${host}:${port}`;
    
    if (database) {
      connectionStr += `/${database}`;
    }
    
    const params = [];
    if (enableSSL) params.push('ssl=true');
    if (charset) params.push(`charset=${charset}`);
    if (timezone) params.push(`timezone=${timezone}`);
    
    if (params.length > 0) {
      connectionStr += `?${params.join('&')}`;
    }
    
    setConnectionString(connectionStr);
  };

  const testConnection = () => {
    navigate('/test-mysql', {
      state: {
        connectionData: formData,
        connectionString
      }
    });
  };

  const saveConnection = () => {
    console.log('Saving MySQL connection:', { ...formData, connectionString });
    alert('MySQL connection profile has been saved successfully.');
    navigate('/mysql-connections');
  };

  const resetForm = () => {
    setFormData({
      connectionName: '',
      host: 'localhost',
      port: '3306',
      database: '',
      username: '',
      password: '',
      saveCredentials: false,
      enableSSL: false,
      sslCa: '',
      sslCert: '',
      sslKey: '',
      enableSSHTunnel: false,
      sshHost: '',
      sshPort: '22',
      sshUsername: '',
      sshPrivateKey: '',
      timeout: 30,
      charset: 'utf8mb4',
      timezone: 'UTC',
      connectionPooling: {
        enabled: true,
        maxConnections: 10,
        minConnections: 2
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        backoff: 'exponential'
      },
      additionalOptions: ''
    });
    setTestResult(null);
    setAvailableTables([]);
  };

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange(field, e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const simulateTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.3;
    setTestResult({
      success,
      message: success 
        ? 'MySQL connection established successfully. Database is accessible.' 
        : 'Connection failed. Please verify your credentials and network configuration.'
    });

    if (success) {
      setAvailableTables([
        { name: 'users', rows: 1250, size: '2.1 MB' },
        { name: 'orders', rows: 8450, size: '15.8 MB' },
        { name: 'products', rows: 320, size: '1.2 MB' },
        { name: 'categories', rows: 45, size: '0.3 MB' },
        { name: 'logs', rows: 12500, size: '45.2 MB' }
      ]);
    }

    setIsTesting(false);
  };

  return (
    <div className="mysql-configuration-container">
      <div className="configuration-header">
        <button 
          className="back-button"
          onClick={() => navigate('/mysql-connections')}
        >
          ← Back to MySQL Connections
        </button>

        <div className="header-title">
          <h1>MySQL Database Configuration</h1>
          <p>Configure and manage secure MySQL database connections</p>
        </div>
      </div>

      <div className="configuration-body">
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
              Authentication & SSL
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
                    Configure the fundamental parameters for your MySQL database connection.
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
                      A descriptive name for this database connection profile
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Host</label>
                      <input
                        type="text"
                        placeholder="localhost or db.company.com"
                        value={formData.host}
                        onChange={(e) => handleInputChange('host', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Port</label>
                      <input
                        type="number"
                        placeholder="3306"
                        value={formData.port}
                        onChange={(e) => handleInputChange('port', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Database Name</label>
                    <input
                      type="text"
                      placeholder="myapp"
                      value={formData.database}
                      onChange={(e) => handleInputChange('database', e.target.value)}
                    />
                    <div className="input-description">
                      The specific database to connect to
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="admin"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                    <div className="input-description">
                      MySQL user with appropriate permissions
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Authentication & Security</h2>
                  <p className="section-description">
                    Configure authentication and secure connection settings.
                  </p>

                  <div className="auth-section">
                    <h3>Password Authentication</h3>
                    <div className="input-group">
                      <label>Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter database password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                        <button 
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.saveCredentials}
                          onChange={(e) => handleInputChange('saveCredentials', e.target.checked)}
                        />
                        <span className="toggle-label">Save Credentials Securely</span>
                      </label>
                    </div>
                  </div>

                  <div className="ssl-section">
                    <h3>SSL/TLS Configuration</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.enableSSL}
                          onChange={(e) => handleInputChange('enableSSL', e.target.checked)}
                        />
                        <span className="toggle-label">Enable SSL Encryption</span>
                      </label>
                    </div>

                    {formData.enableSSL && (
                      <div className="ssl-files-section">
                        <div className="input-group">
                          <label>SSL CA Certificate</label>
                          <input
                            type="file"
                            accept=".pem,.crt,.cer"
                            onChange={(e) => handleFileUpload('sslCa', e)}
                          />
                          {formData.sslCa && (
                            <div className="file-info">
                              <span>CA certificate loaded</span>
                            </div>
                          )}
                        </div>

                        <div className="input-group">
                          <label>Client Certificate</label>
                          <input
                            type="file"
                            accept=".pem,.crt,.cer"
                            onChange={(e) => handleFileUpload('sslCert', e)}
                          />
                          {formData.sslCert && (
                            <div className="file-info">
                              <span>Client certificate loaded</span>
                            </div>
                          )}
                        </div>

                        <div className="input-group">
                          <label>Client Private Key</label>
                          <input
                            type="file"
                            accept=".pem,.key"
                            onChange={(e) => handleFileUpload('sslKey', e)}
                          />
                          {formData.sslKey && (
                            <div className="file-info">
                              <span>Private key loaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ssh-section">
                    <h3>SSH Tunnel (Optional)</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.enableSSHTunnel}
                          onChange={(e) => handleInputChange('enableSSHTunnel', e.target.checked)}
                        />
                        <span className="toggle-label">Enable SSH Tunnel</span>
                      </label>
                    </div>

                    {formData.enableSSHTunnel && (
                      <div className="ssh-config-section">
                        <div className="form-row">
                          <div className="input-group">
                            <label>SSH Host</label>
                            <input
                              type="text"
                              placeholder="ssh.company.com"
                              value={formData.sshHost}
                              onChange={(e) => handleInputChange('sshHost', e.target.value)}
                            />
                          </div>
                          <div className="input-group">
                            <label>SSH Port</label>
                            <input
                              type="number"
                              placeholder="22"
                              value={formData.sshPort}
                              onChange={(e) => handleInputChange('sshPort', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label>SSH Username</label>
                          <input
                            type="text"
                            placeholder="ssh-user"
                            value={formData.sshUsername}
                            onChange={(e) => handleInputChange('sshUsername', e.target.value)}
                          />
                        </div>

                        <div className="input-group">
                          <label>SSH Private Key</label>
                          <input
                            type="file"
                            accept=".pem,.ppk"
                            onChange={(e) => handleFileUpload('sshPrivateKey', e)}
                          />
                          {formData.sshPrivateKey && (
                            <div className="file-info">
                              <span>Private key loaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Advanced Settings</h2>
                  <p className="section-description">
                    Configure advanced database connection parameters and performance settings.
                  </p>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Connection Timeout (seconds)</label>
                      <input
                        type="number"
                        placeholder="30"
                        value={formData.timeout}
                        onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Character Set</label>
                      <select
                        value={formData.charset}
                        onChange={(e) => handleInputChange('charset', e.target.value)}
                      >
                        <option value="utf8mb4">UTF8MB4</option>
                        <option value="utf8">UTF8</option>
                        <option value="latin1">Latin1</option>
                        <option value="ascii">ASCII</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="SYSTEM">System Time</option>
                      <option value="+00:00">GMT</option>
                      <option value="-05:00">EST</option>
                      <option value="-08:00">PST</option>
                    </select>
                  </div>

                  <div className="connection-pooling-section">
                    <h3>Connection Pooling</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.connectionPooling.enabled}
                          onChange={(e) => handleNestedInputChange('connectionPooling', 'enabled', e.target.checked)}
                        />
                        <span className="toggle-label">Enable Connection Pooling</span>
                      </label>
                    </div>

                    {formData.connectionPooling.enabled && (
                      <div className="form-row">
                        <div className="input-group">
                          <label>Maximum Connections</label>
                          <input
                            type="number"
                            placeholder="10"
                            value={formData.connectionPooling.maxConnections}
                            onChange={(e) => handleNestedInputChange('connectionPooling', 'maxConnections', parseInt(e.target.value) || 10)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Minimum Connections</label>
                          <input
                            type="number"
                            placeholder="2"
                            value={formData.connectionPooling.minConnections}
                            onChange={(e) => handleNestedInputChange('connectionPooling', 'minConnections', parseInt(e.target.value) || 2)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="retry-policy-section">
                    <h3>Retry Policy</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.retryPolicy.enabled}
                          onChange={(e) => handleNestedInputChange('retryPolicy', 'enabled', e.target.checked)}
                        />
                        <span className="toggle-label">Enable Automatic Retry</span>
                      </label>
                    </div>

                    {formData.retryPolicy.enabled && (
                      <div className="form-row">
                        <div className="input-group">
                          <label>Max Retry Attempts</label>
                          <input
                            type="number"
                            placeholder="3"
                            value={formData.retryPolicy.maxRetries}
                            onChange={(e) => handleNestedInputChange('retryPolicy', 'maxRetries', parseInt(e.target.value) || 3)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Backoff Strategy</label>
                          <select
                            value={formData.retryPolicy.backoff}
                            onChange={(e) => handleNestedInputChange('retryPolicy', 'backoff', e.target.value)}
                          >
                            <option value="exponential">Exponential</option>
                            <option value="linear">Linear</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Additional Connection Options</label>
                    <textarea
                      placeholder="connectTimeout=10000&compress=true"
                      value={formData.additionalOptions}
                      onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                      rows="3"
                    />
                    <div className="input-description">
                      MySQL connection parameters as key=value pairs
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
                          <span className="summary-label">Connection Name:</span>
                          <span className="summary-value">{formData.connectionName || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Host:</span>
                          <span className="summary-value">{formData.host}:{formData.port}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Database:</span>
                          <span className="summary-value">{formData.database || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Username:</span>
                          <span className="summary-value">{formData.username || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">SSL Enabled:</span>
                          <span className="summary-value">{formData.enableSSL ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">SSH Tunnel:</span>
                          <span className="summary-value">{formData.enableSSHTunnel ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Charset:</span>
                          <span className="summary-value">{formData.charset}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Connection Pooling:</span>
                          <span className="summary-value">{formData.connectionPooling.enabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="uri-section">
                      <div className="uri-header">
                        <h3>Connection String</h3>
                        <button 
                          className="copy-button"
                          onClick={() => navigator.clipboard.writeText(connectionString)}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="uri-display">
                        <code>{connectionString}</code>
                      </div>
                    </div>

                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        <div className="result-message">
                          {testResult.message}
                        </div>
                      </div>
                    )}

                    {availableTables.length > 0 && (
                      <div className="tables-preview">
                        <h3>Available Tables</h3>
                        <div className="tables-list">
                          {availableTables.map((table, index) => (
                            <div key={index} className="table-item">
                              <div className="table-name">{table.name}</div>
                              <div className="table-stats">
                                <span className="table-rows">{table.rows.toLocaleString()} rows</span>
                                <span className="table-size">{table.size}</span>
                              </div>
                            </div>
                          ))}
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
                      >
                        Test Connection
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

export default MySQLConfiguration;
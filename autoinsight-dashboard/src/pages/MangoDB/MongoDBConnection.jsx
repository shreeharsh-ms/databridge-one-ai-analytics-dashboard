import React, { useState, useEffect } from 'react';
import './MongoDBConnection.css';
import { useNavigate } from 'react-router-dom';
import mongodbService from '../../services/mongodbService';

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
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  useEffect(() => {
    console.log('🔧 MongoDBConnection Component Mounted');
    generateConnectionUri();
    loadVaultConfiguration();
  }, []);

  useEffect(() => {
    generateConnectionUri();
  }, [formData]);

  const loadVaultConfiguration = async () => {
    // Only load from Vault if no custom configuration exists
    if (!formData.connectionName && formData.host === 'localhost') {
      setIsLoadingVault(true);
      try {
        const vaultUri = await mongodbService.getVaultMongoURI();
        if (vaultUri) {
          console.log("🔑 MongoDB URI fetched from Vault:", vaultUri);
          
          // Parse the Vault URI to extract connection details
          const uriParts = vaultUri.match(/^(mongodb(?:\+srv)?):\/\/(?:([^:]+):([^@]+)@)?([^\/?]+)(?:\/([^?]*))?(?:\?(.*))?$/);
          
          if (uriParts) {
            const [, protocol, username, password, host, database, options] = uriParts;
            
            setFormData(prev => ({
              ...prev,
              protocol: protocol === 'mongodb+srv' ? 'mongodb+srv://' : 'mongodb://',
              host: host,
              databaseName: database || '',
              authRequired: !!(username && password),
              username: username || '',
              password: password || '',
              connectionName: 'Vault Configuration',
              connectionType: 'custom'
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load Vault configuration:', error);
      } finally {
        setIsLoadingVault(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 Form Field Changed: ${field} =`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateConnectionUri = () => {
    console.log('🔗 Generating Connection URI...');
    console.log('📋 Current Form Data:', formData);
    
    const uri = mongodbService.generateConnectionUri(formData);
    console.log('🔗 Generated URI (Raw):', uri);
    console.log('🔗 Generated URI (Masked):', mongodbService.maskSensitiveData(uri));
    
    setConnectionUri(uri);
  };

  const testConnection = async () => {
    console.log('🧪 Starting Connection Test...');
    console.log('📋 Test Configuration:', formData);
    console.log('🔗 Final Connection URI:', connectionUri);
    console.log('🔗 Final Connection URI (Masked):', mongodbService.maskSensitiveData(connectionUri));
    
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🚀 Calling mongodbService.testConnection()...');
      const result = await mongodbService.testConnection(formData);
      
      console.log('✅ Connection Test Result Received:', result);
      
      setTestResult({
        success: result.success,
        message: result.message,
        connectionId: result.connectionId,
        serverInfo: result.serverInfo,
        databases: result.databases,
        error: result.error,
        errorType: result.errorType,
        errors: result.errors
      });

      if (result.success) {
        console.log('🎉 Connection Successful!');
        console.log('📊 Server Info:', result.serverInfo);
        console.log('🗄️ Databases Found:', result.databases);
        console.log('🆔 Connection ID:', result.connectionId);
        
        // Navigate to test page with actual connection data
        setTimeout(() => {
          console.log('🔄 Navigating to Test Page...');
          navigate('/test-mongodb', {
            state: {
              connectionData: formData,
              connectionUri: result.connectionUri,
              connectionId: result.connectionId,
              serverInfo: result.serverInfo,
              databases: result.databases
            }
          });
        }, 1000);
      } else {
        console.log('❌ Connection Failed:', result.message);
        console.log('🚨 Error Type:', result.errorType);
        console.log('📝 Error Details:', result.error);
      }
    } catch (error) {
      console.error('💥 Unexpected Error in testConnection:', error);
      setTestResult({
        success: false,
        message: 'Connection test failed unexpectedly',
        error: error.message
      });
    } finally {
      console.log('🏁 Connection Test Completed');
      setIsTesting(false);
    }
  };

  const saveConnection = async () => {
    if (!formData.connectionName.trim()) {
      alert('Please provide a connection name before saving.');
      return;
    }

    setIsSaving(true);
    console.log('💾 Starting Save Connection...');

    try {
      // Pass both config and connectionUri to ensure it's available
      const result = await mongodbService.saveConnection(formData, connectionUri);
      console.log('✅ Save Result:', result);

      if (result.success) {
        console.log('✅ Connection Saved Successfully!');
        alert('Connection profile saved successfully!');
        
        // Show success in test result area
        setTestResult({
          success: true,
          message: `Connection saved successfully! ${result.message}`,
          connectionId: result.localConnectionId
        });
      } else {
        console.error('❌ Save failed:', result.message);
        alert(`Failed to save connection: ${result.message}`);
        
        setTestResult({
          success: false,
          message: `Save failed: ${result.message}`,
          error: result.error
        });
      }
    } catch (error) {
      console.error('💥 Unexpected error during save:', error);
      alert('An unexpected error occurred while saving the connection.');
      
      setTestResult({
        success: false,
        message: 'Save failed unexpectedly',
        error: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    console.log('🔄 Resetting Form to Default Values');
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
    console.log('✅ Form Reset Complete');
  };

  const handleTabChange = (tab) => {
    console.log(`📑 Tab Changed: ${activeTab} → ${tab}`);
    setActiveTab(tab);
  };

  const loadFromVault = async () => {
    setIsLoadingVault(true);
    try {
      await loadVaultConfiguration();
    } finally {
      setIsLoadingVault(false);
    }
  };

  return (
    <div className="mongo-connection-container">
      <div className="connection-header">
        <div className="header-content">
          <h1>MongoDB Connection Configuration</h1>
          <p>Configure and manage database connection parameters</p>
          <div className="vault-section">
            <button 
              className="btn btn-vault"
              onClick={loadFromVault}
              disabled={isLoadingVault}
            >
              {isLoadingVault ? 'Loading from Vault...' : 'Load from Vault'}
            </button>
            {isLoadingVault && (
              <div className="vault-loading">
                🔑 Loading configuration from Vault...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="connection-body">
        <div className="form-container">
          <div className="form-tabs">
            <button 
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => handleTabChange('basic')}
            >
              Basic Configuration
            </button>
            <button 
              className={`tab ${activeTab === 'authentication' ? 'active' : ''}`}
              onClick={() => handleTabChange('authentication')}
            >
              Authentication
            </button>
            <button 
              className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => handleTabChange('advanced')}
            >
              Advanced Settings
            </button>
            <button 
              className={`tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => handleTabChange('review')}
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
                    <label>Connection Name *</label>
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
                        {formData.protocol === 'mongodb+srv://' ? 'Cluster Hostname *' : 'Host *'}
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
                        <label>Port *</label>
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
                      The database to connect to initially (optional)
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
                        onChange={(e) => {
                          console.log(`🔐 Authentication ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                          handleInputChange('authRequired', e.target.checked);
                        }}
                      />
                      <span className="toggle-label">Enable Authentication</span>
                    </label>
                  </div>

                  {formData.authRequired && (
                    <>
                      <div className="form-row">
                        <div className="input-group">
                          <label>Username *</label>
                          <input
                            type="text"
                            placeholder="admin"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                          />
                        </div>
                        
                        <div className="input-group">
                          <label>Password *</label>
                          <input
                            type="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => {
                              console.log('🔑 Password field updated (length):', e.target.value.length);
                              handleInputChange('password', e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Authentication Database</label>
                        <input
                          type="text"
                          placeholder="admin"
                          value={formData.authSource}
                          onChange={(e) => handleInputChange('authSource', e.target.value)}
                        />
                        <div className="input-description">
                          Database where user credentials are stored (default: admin)
                        </div>
                      </div>
                    </>
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
                      <div className="input-description">
                        Additional connection string options
                      </div>
                    </div>
                  </div>

                  <div className="security-section">
                    <h3>Security Settings</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.sslEnabled}
                          onChange={(e) => {
                            console.log(`🔒 SSL/TLS ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                            handleInputChange('sslEnabled', e.target.checked);
                          }}
                        />
                        <span className="toggle-label">Enable TLS/SSL Encryption</span>
                      </label>
                      
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.saveCredentials}
                          onChange={(e) => {
                            console.log(`💾 Save Credentials ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                            handleInputChange('saveCredentials', e.target.checked);
                          }}
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
                        {formData.protocol === 'mongodb://' && (
                          <div className="summary-item">
                            <span className="summary-label">Port:</span>
                            <span className="summary-value">{formData.port}</span>
                          </div>
                        )}
                        <div className="summary-item">
                          <span className="summary-label">Database:</span>
                          <span className="summary-value">{formData.databaseName || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Authentication:</span>
                          <span className="summary-value">{formData.authRequired ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">SSL/TLS:</span>
                          <span className="summary-value">{formData.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Replica Set:</span>
                          <span className="summary-value">{formData.replicaSetName || 'Not configured'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="uri-section">
                      <div className="uri-header">
                        <h3>Connection String</h3>
                        <button 
                          className="copy-button"
                          onClick={() => {
                            console.log('📋 Copying URI to clipboard:', mongodbService.maskSensitiveData(connectionUri));
                            navigator.clipboard.writeText(connectionUri);
                            alert('Connection string copied to clipboard!');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="uri-display">
                        <code>{mongodbService.maskSensitiveData(connectionUri)}</code>
                      </div>
                    </div>

                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        <div className="result-header">
                          <strong>{testResult.success ? '✅ Success' : '❌ Error'}</strong>
                        </div>
                        <div className="result-message">
                          {testResult.message}
                          {testResult.error && (
                            <div className="error-details">
                              <strong>Error Details:</strong> {testResult.error}
                            </div>
                          )}
                          {testResult.errors && testResult.errors.length > 0 && (
                            <div className="validation-errors">
                              <strong>Validation Errors:</strong>
                              <ul>
                                {testResult.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
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
                        disabled={!formData.connectionName.trim() || isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
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
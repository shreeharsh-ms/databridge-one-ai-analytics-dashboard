import React, { useState, useEffect } from 'react';
import './ApiEndpointConfiguration.css';
import { useNavigate } from 'react-router-dom';

const ApiEndpointConfiguration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    connectionName: '',
    endpointUrl: '',
    connectionType: 'REST',
    httpMethod: 'GET',
    defaultQueryParams: '',
    tags: [],
    timeout: 30,
    authType: 'None',
    apiKey: '',
    oauth2: {
      clientId: '',
      clientSecret: '',
      tokenUrl: '',
      scopes: []
    },
    jwt: {
      secret: '',
      headerPrefix: 'Bearer'
    },
    saveCredentials: false,
    headers: [{ key: '', value: '' }],
    retryPolicy: {
      retries: 3,
      backoff: 'exponential'
    },
    sslVerify: true,
    logging: false,
    additionalOptions: ''
  });

  const [connectionString, setConnectionString] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [sampleResponse, setSampleResponse] = useState(null);

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

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...formData.headers];
    updatedHeaders[index][field] = value;
    handleInputChange('headers', updatedHeaders);
  };

  const addHeader = () => {
    handleInputChange('headers', [...formData.headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    const updatedHeaders = formData.headers.filter((_, i) => i !== index);
    handleInputChange('headers', updatedHeaders);
  };

  const generateConnectionString = () => {
    const { endpointUrl, defaultQueryParams, httpMethod } = formData;
    
    let connectionStr = `${httpMethod} ${endpointUrl}`;
    
    if (defaultQueryParams) {
      connectionStr += `${endpointUrl.includes('?') ? '&' : '?'}${defaultQueryParams}`;
    }
    
    setConnectionString(connectionStr);
  };

const testConnection = () => {
  navigate('/test-apiconnection', {
    state: {
      connectionData: formData,
      connectionString
    }
  });
};


  const saveConnection = () => {
    console.log('Saving API connection:', { ...formData, connectionString });
    alert('API connection profile has been saved successfully.');
    navigate('/api-connections');
  };

  const resetForm = () => {
    setFormData({
      connectionName: '',
      endpointUrl: '',
      connectionType: 'REST',
      httpMethod: 'GET',
      defaultQueryParams: '',
      tags: [],
      timeout: 30,
      authType: 'None',
      apiKey: '',
      oauth2: {
        clientId: '',
        clientSecret: '',
        tokenUrl: '',
        scopes: []
      },
      jwt: {
        secret: '',
        headerPrefix: 'Bearer'
      },
      saveCredentials: false,
      headers: [{ key: '', value: '' }],
      retryPolicy: {
        retries: 3,
        backoff: 'exponential'
      },
      sslVerify: true,
      logging: false,
      additionalOptions: ''
    });
    setTestResult(null);
    setSampleResponse(null);
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="api-configuration-container">
<div className="configuration-header">
  <button 
    className="back-button"
    onClick={() => navigate('/api-connections')}
  >
    ← Back to API Connections
  </button>

  <div className="header-title">
    <h1>API Endpoint Configuration</h1>
    <p>Configure and manage API connections for your dashboard</p>
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
                    Configure the fundamental parameters for your API endpoint connection.
                  </p>

                  <div className="input-group">
                    <label>Connection Name</label>
                    <input
                      type="text"
                      placeholder="Payments API"
                      value={formData.connectionName}
                      onChange={(e) => handleInputChange('connectionName', e.target.value)}
                    />
                    <div className="input-description">
                      A descriptive name for this API connection profile
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Endpoint URL</label>
                    <input
                      type="url"
                      placeholder="https://api.company.com/v1/payments"
                      value={formData.endpointUrl}
                      onChange={(e) => handleInputChange('endpointUrl', e.target.value)}
                    />
                    <div className="input-description">
                      Full URL of the API endpoint including protocol and path
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Connection Type</label>
                      <select
                        value={formData.connectionType}
                        onChange={(e) => handleInputChange('connectionType', e.target.value)}
                      >
                        <option value="REST">REST API</option>
                        <option value="GraphQL">GraphQL</option>
                        <option value="SOAP">SOAP</option>
                      </select>
                    </div>

                    {formData.connectionType === 'REST' && (
                      <div className="input-group">
                        <label>HTTP Method</label>
                        <select
                          value={formData.httpMethod}
                          onChange={(e) => handleInputChange('httpMethod', e.target.value)}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Default Query Parameters</label>
                    <input
                      type="text"
                      placeholder="limit=10&sort=desc"
                      value={formData.defaultQueryParams}
                      onChange={(e) => handleInputChange('defaultQueryParams', e.target.value)}
                    />
                    <div className="input-description">
                      Optional query parameters to include with every request
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="finance, critical"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addTag(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="input-description">
                      Press Enter to add tags for better organization
                    </div>
                    <div className="tags-container">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button 
                            className="tag-remove"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Request Timeout (seconds)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={formData.timeout}
                      onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                    />
                    <div className="input-description">
                      Maximum time to wait for API response
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
                    Configure authentication settings for your API endpoint.
                  </p>

                  <div className="input-group">
                    <label>Authentication Type</label>
                    <select
                      value={formData.authType}
                      onChange={(e) => handleInputChange('authType', e.target.value)}
                    >
                      <option value="None">No Authentication</option>
                      <option value="API Key">API Key</option>
                      <option value="OAuth2">OAuth 2.0</option>
                      <option value="JWT">JWT</option>
                      <option value="Basic Auth">Basic Auth</option>
                    </select>
                  </div>

                  {formData.authType === 'API Key' && (
                    <div className="auth-section">
                      <div className="input-group">
                        <label>API Key / Token</label>
                        <input
                          type="password"
                          placeholder="Enter your API key"
                          value={formData.apiKey}
                          onChange={(e) => handleInputChange('apiKey', e.target.value)}
                        />
                        <div className="input-description">
                          Your API key or access token
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.authType === 'OAuth2' && (
                    <div className="auth-section">
                      <div className="form-row">
                        <div className="input-group">
                          <label>Client ID</label>
                          <input
                            type="text"
                            placeholder="Your OAuth2 Client ID"
                            value={formData.oauth2.clientId}
                            onChange={(e) => handleNestedInputChange('oauth2', 'clientId', e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Client Secret</label>
                          <input
                            type="password"
                            placeholder="Your OAuth2 Client Secret"
                            value={formData.oauth2.clientSecret}
                            onChange={(e) => handleNestedInputChange('oauth2', 'clientSecret', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Token URL</label>
                        <input
                          type="url"
                          placeholder="https://auth.company.com/oauth2/token"
                          value={formData.oauth2.tokenUrl}
                          onChange={(e) => handleNestedInputChange('oauth2', 'tokenUrl', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Scopes</label>
                        <input
                          type="text"
                          placeholder="read write update"
                          value={formData.oauth2.scopes.join(' ')}
                          onChange={(e) => handleNestedInputChange('oauth2', 'scopes', e.target.value.split(' '))}
                        />
                        <div className="input-description">
                          Space-separated list of OAuth2 scopes
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.authType === 'JWT' && (
                    <div className="auth-section">
                      <div className="input-group">
                        <label>JWT Secret / Public Key</label>
                        <textarea
                          placeholder="Enter your JWT secret or public key"
                          value={formData.jwt.secret}
                          onChange={(e) => handleNestedInputChange('jwt', 'secret', e.target.value)}
                          rows="3"
                        />
                      </div>
                      <div className="input-group">
                        <label>Header Prefix</label>
                        <input
                          type="text"
                          placeholder="Bearer"
                          value={formData.jwt.headerPrefix}
                          onChange={(e) => handleNestedInputChange('jwt', 'headerPrefix', e.target.value)}
                        />
                        <div className="input-description">
                          Prefix for Authorization header (e.g., Bearer, Token)
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="security-section">
                    <h3>Security Settings</h3>
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
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Advanced Settings</h2>
                  <p className="section-description">
                    Configure advanced connection parameters and request settings.
                  </p>

                  <div className="headers-section">
                    <h3>Custom Headers</h3>
                    {formData.headers.map((header, index) => (
                      <div key={index} className="header-row">
                        <input
                          type="text"
                          placeholder="Header Name"
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Header Value"
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        />
                        {formData.headers.length > 1 && (
                          <button 
                            className="remove-header"
                            onClick={() => removeHeader(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-secondary" onClick={addHeader}>
                      + Add Header
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Retry Policy - Max Retries</label>
                      <input
                        type="number"
                        placeholder="3"
                        value={formData.retryPolicy.retries}
                        onChange={(e) => handleNestedInputChange('retryPolicy', 'retries', parseInt(e.target.value) || 0)}
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

                  <div className="input-group">
                    <label>Rate Limiting</label>
                    <input
                      type="text"
                      placeholder="100/hour"
                      value={formData.additionalOptions}
                      onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                    />
                    <div className="input-description">
                      Optional rate limiting configuration (e.g., 1000/hour, 10/second)
                    </div>
                  </div>

                  <div className="security-section">
                    <h3>Security & Logging</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.sslVerify}
                          onChange={(e) => handleInputChange('sslVerify', e.target.checked)}
                        />
                        <span className="toggle-label">Enable SSL Verification</span>
                      </label>
                      
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.logging}
                          onChange={(e) => handleInputChange('logging', e.target.checked)}
                        />
                        <span className="toggle-label">Enable Request Logging</span>
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
                    Verify your configuration and test the API connection.
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
                          <span className="summary-label">Connection Type:</span>
                          <span className="summary-value">{formData.connectionType}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">HTTP Method:</span>
                          <span className="summary-value">{formData.httpMethod}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Authentication:</span>
                          <span className="summary-value">{formData.authType}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Timeout:</span>
                          <span className="summary-value">{formData.timeout}s</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">SSL Verification:</span>
                          <span className="summary-value">{formData.sslVerify ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="uri-section">
                      <div className="uri-header">
                        <h3>Request Preview</h3>
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
                      {formData.headers.some(h => h.key && h.value) && (
                        <div className="headers-preview">
                          <h4>Headers:</h4>
                          {formData.headers.map((header, index) => (
                            header.key && header.value && (
                              <div key={index} className="header-preview">
                                <code>{header.key}: {header.value}</code>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        <div className="result-message">
                          {testResult.message}
                        </div>
                      </div>
                    )}

                    {sampleResponse && (
                      <div className="sample-response">
                        <h3>Sample Response</h3>
                        <pre className="json-preview">
                          {JSON.stringify(sampleResponse, null, 2)}
                        </pre>
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
                        disabled={!testResult?.success}
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

export default ApiEndpointConfiguration;
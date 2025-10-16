import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApiEndpointsConnections.css';

const ApiEndpointsConnections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([
    {
      id: '1',
      name: 'Payments API',
      url: 'https://api.company.com/v1/payments',
      status: 'active',
      lastSync: '2 hours ago',
      authType: 'API Key',
      responseTime: '120ms',
      rateLimit: '1000/hour',
      tags: ['finance', 'critical'],
      successRate: '99.8%'
    },
    {
      id: '2',
      name: 'Marketing Analytics',
      url: 'https://api.marketing.com/v1/analytics',
      status: 'failed',
      lastSync: 'Failed',
      authType: 'OAuth2',
      responseTime: 'N/A',
      rateLimit: '500/hour',
      tags: ['marketing', 'bi'],
      successRate: '0%'
    },
    {
      id: '3',
      name: 'HR Management',
      url: 'https://hr.company.com/graphql',
      status: 'warning',
      lastSync: '5 minutes ago',
      authType: 'JWT',
      responseTime: '450ms',
      rateLimit: '200/hour',
      tags: ['hr', 'employees'],
      successRate: '92.5%'
    },
    {
      id: '4',
      name: 'Inventory Service',
      url: 'https://inventory.api.com/rest/v2',
      status: 'active',
      lastSync: '30 minutes ago',
      authType: 'Basic Auth',
      responseTime: '85ms',
      rateLimit: '2000/hour',
      tags: ['inventory', 'operations'],
      successRate: '99.9%'
    }
  ]);

  const [selectedConnections, setSelectedConnections] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showConnectionDrawer, setShowConnectionDrawer] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        console.log('Auto-refreshing API endpoints...');
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedConnections(filteredConnections.map(conn => conn.id));
    } else {
      setSelectedConnections([]);
    }
  };

  const handleSelectConnection = (id, checked) => {
    if (checked) {
      setSelectedConnections(prev => [...prev, id]);
    } else {
      setSelectedConnections(prev => prev.filter(connId => connId !== id));
    }
  };

  const handleViewConnection = (connection) => {
    setSelectedConnection(connection);
    setShowConnectionDrawer(true);
  };

  const handleTestConnection = (connectionId) => {
    console.log(`Testing API connection: ${connectionId}`);
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'active' },
      warning: { label: 'Warning', class: 'warning' },
      failed: { label: 'Failed', class: 'failed' }
    };
    return statusConfig[status] || statusConfig.failed;
  };

  const getAuthTypeDisplay = (authType) => {
    const authConfig = {
      'API Key': { label: 'API Key', class: 'api-key' },
      'OAuth2': { label: 'OAuth 2.0', class: 'oauth' },
      'JWT': { label: 'JWT', class: 'jwt' },
      'Basic Auth': { label: 'Basic Auth', class: 'basic' }
    };
    return authConfig[authType] || { label: authType, class: 'default' };
  };

  return (
    <div className="api-endpoints-container">
      {/* Header */}
      <div className="connections-header">
        <div className="header-top">
          <button 
            className="back-button"
            onClick={() => navigate('/connections')}
          >
            ← Back to Data Connections
          </button>
        </div>
        <div className="header-main">
          <div className="header-title">
            <h1>API Endpoints Connections</h1>
            <p>Manage all connected APIs and monitor their health</p>
          </div>
          <div className="header-actions">
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span className="toggle-label">Auto Refresh</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-left">
          <button 
            className="btn-primary"
            onClick={() => navigate('/configure-apiendpoint')}
          >
            + Add New API Connection
          </button>
        </div>
        <div className="action-right">
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="text"
            placeholder="Search API endpoints..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedConnections.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-actions-left">
            <span>{selectedConnections.length} API endpoint(s) selected</span>
          </div>
          <div className="bulk-actions-right">
            <button className="btn-secondary">Test Selected</button>
            <button className="btn-secondary">Refresh Metadata</button>
            <button className="btn-danger">Remove Selected</button>
          </div>
        </div>
      )}

      {/* Connections Table */}
      <div className="connections-table-container">
        <table className="connections-table">
          <thead>
            <tr>
              <th className="column-checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={selectedConnections.length === filteredConnections.length && filteredConnections.length > 0}
                />
              </th>
              <th className="column-name">Name</th>
              <th className="column-url">Endpoint URL</th>
              <th className="column-status">Status</th>
              <th className="column-sync">Last Sync</th>
              <th className="column-auth">Auth Type</th>
              <th className="column-rate">Rate Limit</th>
              <th className="column-tags">Tags</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map(connection => {
              const status = getStatusDisplay(connection.status);
              const authType = getAuthTypeDisplay(connection.authType);
              const isSelected = selectedConnections.includes(connection.id);
              
              return (
                <tr key={connection.id} className={isSelected ? 'selected' : ''}>
                  <td className="column-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectConnection(connection.id, e.target.checked)}
                    />
                  </td>
                  <td className="column-name">
                    <div className="connection-name">{connection.name}</div>
                    <div className="response-time">
                      <span className="response-value">{connection.responseTime}</span>
                    </div>
                  </td>
                  <td className="column-url">
                    <code className="url-display">{connection.url}</code>
                  </td>
                  <td className="column-status">
                    <div className="status-cell">
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                      <span className="success-rate">{connection.successRate}</span>
                    </div>
                  </td>
                  <td className="column-sync">
                    <span className={`sync-time ${connection.lastSync === 'Failed' ? 'failed' : ''}`}>
                      {connection.lastSync}
                    </span>
                  </td>
                  <td className="column-auth">
                    <span className={`auth-badge ${authType.class}`}>
                      {authType.label}
                    </span>
                  </td>
                  <td className="column-rate">
                    <span className="rate-limit">{connection.rateLimit}</span>
                  </td>
                  <td className="column-tags">
                    <div className="tags-container">
                      {connection.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="column-actions">
                    <div className="actions-container">
                      <button 
                        className="btn-action"
                        onClick={() => handleViewConnection(connection)}
                      >
                        View
                      </button>
                      <button 
                        className="btn-action"
                        onClick={() => navigate('/configure-apiendpoint')}
                      >
                        Edit
                      </button>
                      <div className="more-actions">
                        <button className="btn-more">⋯</button>
                        <div className="more-menu">
                          <button onClick={() => handleTestConnection(connection.id)}>Test Connection</button>
                          <button>Duplicate</button>
                          <button>Export Configuration</button>
                          <button className="danger">Remove</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredConnections.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" stroke="#6B7280" strokeWidth="2"/>
                </svg>
              </div>
              <h3>No API connections yet</h3>
              <p>Connect APIs to start monitoring data and generating insights.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/configure-apiendpoint')}
              >
                + Add New API Connection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Detail Drawer */}
      {showConnectionDrawer && selectedConnection && (
        <ApiEndpointDetailDrawer
          connection={selectedConnection}
          onClose={() => setShowConnectionDrawer(false)}
        />
      )}
    </div>
  );
};

// API Endpoint Detail Drawer Component
const ApiEndpointDetailDrawer = ({ connection, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const status = connection.status === 'active' ? 'Active' : 
                 connection.status === 'warning' ? 'Warning' : 'Failed';

  const sampleResponse = {
    data: [
      { id: 1, amount: 125.50, currency: 'USD', status: 'completed', timestamp: '2024-06-20T10:30:00Z' },
      { id: 2, amount: 89.99, currency: 'EUR', status: 'pending', timestamp: '2024-06-20T10:25:00Z' },
      { id: 3, amount: 200.00, currency: 'USD', status: 'completed', timestamp: '2024-06-20T10:20:00Z' }
    ],
    total: 3,
    page: 1,
    pageSize: 10
  };

  const performanceData = [
    { time: '09:00', latency: 110, success: true },
    { time: '10:00', latency: 125, success: true },
    { time: '11:00', latency: 95, success: true },
    { time: '12:00', latency: 450, success: false },
    { time: '13:00', latency: 130, success: true }
  ];

  const handleTestEndpoint = async () => {
    setIsTesting(true);
    // Simulate API test
    setTimeout(() => {
      setTestResponse(sampleResponse);
      setIsTesting(false);
    }, 1500);
  };

  return (
    <div className="connection-drawer">
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className="drawer-content">
        <div className="drawer-header">
          <h2>{connection.name}</h2>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        
        <div className="drawer-summary">
          <div className="summary-item">
            <span className="summary-label">Status:</span>
            <span className={`summary-value status-${connection.status}`}>{status}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Response Time:</span>
            <span className="summary-value">{connection.responseTime}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Success Rate:</span>
            <span className="summary-value">{connection.successRate}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Auth Type:</span>
            <span className="summary-value">{connection.authType}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Rate Limit:</span>
            <span className="summary-value">{connection.rateLimit}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Sync:</span>
            <span className="summary-value">{connection.lastSync}</span>
          </div>
        </div>

        <div className="drawer-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers & Auth
          </button>
          <button 
            className={`tab ${activeTab === 'sample' ? 'active' : ''}`}
            onClick={() => setActiveTab('sample')}
          >
            Sample Data
          </button>
          <button 
            className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button 
            className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
          <button 
            className={`tab ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
          >
            Test Endpoint
          </button>
        </div>

        <div className="drawer-tab-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <h3>API Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Endpoint URL</span>
                  <code>{connection.url}</code>
                </div>
                <div className="detail-item">
                  <span>Connection Established</span>
                  <span>3 months ago</span>
                </div>
                <div className="detail-item">
                  <span>Request Method</span>
                  <span>GET</span>
                </div>
                <div className="detail-item">
                  <span>Content Type</span>
                  <span>application/json</span>
                </div>
                <div className="detail-item">
                  <span>Timeout</span>
                  <span>30 seconds</span>
                </div>
                <div className="detail-item">
                  <span>Tags</span>
                  <div className="tags-container">
                    {connection.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'headers' && (
            <div className="tab-panel">
              <h3>Headers & Authentication</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Authentication Type</span>
                  <span>{connection.authType}</span>
                </div>
                <div className="detail-item">
                  <span>API Key Header</span>
                  <span>X-API-Key</span>
                </div>
                <div className="detail-item">
                  <span>Content Type</span>
                  <span>application/json</span>
                </div>
                <div className="detail-item">
                  <span>User Agent</span>
                  <span>DataPlatform/1.0</span>
                </div>
                <div className="detail-item">
                  <span>Additional Headers</span>
                  <span>None</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'sample' && (
            <div className="tab-panel">
              <h3>Sample Response Data</h3>
              <p>Example response from the API endpoint</p>
              <div className="sample-data">
                <pre className="json-preview">
                  {JSON.stringify(sampleResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="tab-panel">
              <h3>Performance Metrics</h3>
              <div className="performance-metrics">
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Average Latency</span>
                    <span className="metric-value">{connection.responseTime}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Success Rate</span>
                    <span className="metric-value">{connection.successRate}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Total Requests</span>
                    <span className="metric-value">12,458</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Error Rate</span>
                    <span className="metric-value">0.2%</span>
                  </div>
                </div>
                <div className="performance-history">
                  <h4>Recent Performance</h4>
                  <div className="history-list">
                    {performanceData.map((item, index) => (
                      <div key={index} className="history-item">
                        <span className="history-time">{item.time}</span>
                        <span className={`history-latency ${item.success ? '' : 'failed'}`}>
                          {item.latency}ms
                        </span>
                        <span className={`history-status ${item.success ? 'success' : 'failed'}`}>
                          {item.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'logs' && (
            <div className="tab-panel">
              <h3>Activity Logs</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">2024-06-20 14:30:23</span>
                  <span className="activity-message">GET /payments - 200 OK</span>
                  <span className="activity-duration">120ms</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2024-06-20 14:28:11</span>
                  <span className="activity-message">GET /payments - 200 OK</span>
                  <span className="activity-duration">115ms</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2024-06-20 14:25:47</span>
                  <span className="activity-message">GET /payments - 504 Timeout</span>
                  <span className="activity-duration failed">450ms</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2024-06-20 14:22:15</span>
                  <span className="activity-message">GET /payments - 200 OK</span>
                  <span className="activity-duration">95ms</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'test' && (
            <div className="tab-panel">
              <h3>Test Endpoint</h3>
              <div className="test-panel">
                <div className="test-controls">
                  <button 
                    className="btn-primary"
                    onClick={handleTestEndpoint}
                    disabled={isTesting}
                  >
                    {isTesting ? 'Testing...' : 'Test Endpoint'}
                  </button>
                  <span className="test-url">{connection.url}</span>
                </div>
                
                {testResponse && (
                  <div className="test-results">
                    <h4>Response</h4>
                    <div className="response-info">
                      <span className="response-status">Status: 200 OK</span>
                      <span className="response-time">Time: 120ms</span>
                    </div>
                    <pre className="json-preview">
                      {JSON.stringify(testResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiEndpointsConnections;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MySQLConnections.css';

const MySQLConnections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([
    {
      id: '1',
      name: 'Production Database',
      host: 'mysql.prod.company.com:3306',
      status: 'active',
      lastSync: '2 hours ago',
      databases: 8,
      version: '8.0.35',
      tags: ['production', 'critical'],
      latency: '22ms',
      connections: '156/500',
      sslMode: 'require'
    },
    {
      id: '2',
      name: 'Analytics Cluster',
      host: 'analytics-mysql.local:3306',
      status: 'sync_error',
      lastSync: 'Failed',
      databases: 0,
      version: '5.7.42',
      tags: ['bi', 'analytics'],
      latency: '412ms',
      connections: '0/200',
      sslMode: 'allow'
    },
    {
      id: '3',
      name: 'Local Development',
      host: 'localhost:3306',
      status: 'offline',
      lastSync: 'N/A',
      databases: 0,
      version: '8.0.33',
      tags: ['development'],
      latency: 'N/A',
      connections: 'N/A',
      sslMode: 'disable'
    },
    {
      id: '4',
      name: 'Staging Environment',
      host: 'mysql.staging.company.com:3306',
      status: 'active',
      lastSync: '5 minutes ago',
      databases: 6,
      version: '8.0.34',
      tags: ['staging', 'test'],
      latency: '45ms',
      connections: '89/300',
      sslMode: 'require'
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
        // Simulate auto-refresh
        console.log('Auto-refreshing MySQL connections...');
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    // Simulate connection test
    console.log(`Testing MySQL connection: ${connectionId}`);
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'active' },
      sync_error: { label: 'Sync Error', class: 'sync_error' },
      offline: { label: 'Offline', class: 'offline' }
    };
    return statusConfig[status] || statusConfig.offline;
  };

  const getSSLModeDisplay = (sslMode) => {
    const sslConfig = {
      require: { label: 'SSL Required', class: 'secure' },
      allow: { label: 'SSL Allowed', class: 'warning' },
      disable: { label: 'SSL Disabled', class: 'insecure' }
    };
    return sslConfig[sslMode] || sslConfig.disable;
  };

  return (
    <div className="mysql-connections-container">
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
            <h1>MySQL Connections</h1>
            <p>Manage all MySQL databases connected to your system</p>
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
            onClick={() => navigate('/configure-mysql')}
          >
            + Connect New MySQL
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
            <option value="sync_error">Sync Error</option>
            <option value="offline">Offline</option>
          </select>
          <input
            type="text"
            placeholder="Search connections..."
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
            <span>{selectedConnections.length} connection(s) selected</span>
          </div>
          <div className="bulk-actions-right">
            <button className="btn-secondary">Test Selected</button>
            <button className="btn-secondary">Refresh</button>
            <button className="btn-secondary">Export Credentials</button>
            <button className="btn-danger">Remove</button>
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
              <th className="column-host">Host / Endpoint</th>
              <th className="column-status">Status</th>
              <th className="column-sync">Last Sync</th>
              <th className="column-databases">Databases</th>
              <th className="column-version">Version</th>
              <th className="column-tags">Tags</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map(connection => {
              const status = getStatusDisplay(connection.status);
              const sslMode = getSSLModeDisplay(connection.sslMode);
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
                    <div className="connection-ssl">
                      <span className={`ssl-badge ${sslMode.class}`}>{sslMode.label}</span>
                    </div>
                  </td>
                  <td className="column-host">
                    <code className="host-endpoint">{connection.host}</code>
                  </td>
                  <td className="column-status">
                    <div className="status-cell">
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                      {connection.latency && connection.latency !== 'N/A' && (
                        <span className="latency-indicator">{connection.latency}</span>
                      )}
                    </div>
                  </td>
                  <td className="column-sync">
                    <span className={`sync-time ${connection.lastSync === 'Failed' ? 'failed' : ''}`}>
                      {connection.lastSync}
                    </span>
                  </td>
                  <td className="column-databases">
                    {connection.databases > 0 ? (
                      <span className="databases-count">{connection.databases} DBs</span>
                    ) : (
                      <span className="no-databases">—</span>
                    )}
                  </td>
                  <td className="column-version">
                    <span className="version-number">MySQL {connection.version}</span>
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
                        onClick={() => navigate('/configure-mysql')}
                      >
                        Edit
                      </button>
                      <div className="more-actions">
                        <button className="btn-more">⋯</button>
                        <div className="more-menu">
                          <button onClick={() => handleTestConnection(connection.id)}>Test Connection</button>
                          <button>Duplicate</button>
                          <button>Export Config</button>
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
              <h3>No MySQL connections found</h3>
              <p>No MySQL connections match your current filters. Try adjusting your search criteria or create a new connection.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/configure-mysql')}
              >
                + Connect New MySQL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Detail Drawer */}
      {showConnectionDrawer && selectedConnection && (
        <MySQLConnectionDetailDrawer
          connection={selectedConnection}
          onClose={() => setShowConnectionDrawer(false)}
        />
      )}
    </div>
  );
};

// MySQL Connection Detail Drawer Component
const MySQLConnectionDetailDrawer = ({ connection, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const status = connection.status === 'active' ? 'Active' : 
                 connection.status === 'sync_error' ? 'Sync Error' : 'Offline';

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
            <span className="summary-value">{connection.latency}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">MySQL Version:</span>
            <span className="summary-value">{connection.version}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Active Connections:</span>
            <span className="summary-value">{connection.connections}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">SSL Mode:</span>
            <span className={`summary-value ssl-${connection.sslMode}`}>
              {connection.sslMode === 'require' ? 'SSL Required' : 
               connection.sslMode === 'allow' ? 'SSL Allowed' : 'SSL Disabled'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Databases Detected:</span>
            <span className="summary-value">{connection.databases}</span>
            <button className="btn-secondary">Rescan</button>
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
            className={`tab ${activeTab === 'databases' ? 'active' : ''}`}
            onClick={() => setActiveTab('databases')}
          >
            Databases & Tables
          </button>
          <button 
            className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Query Performance
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Accounts
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Logs
          </button>
        </div>

        <div className="drawer-tab-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <h3>Connection Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Host Endpoint</span>
                  <code>{connection.host}</code>
                </div>
                <div className="detail-item">
                  <span>Last Successful Sync</span>
                  <span>{connection.lastSync}</span>
                </div>
                <div className="detail-item">
                  <span>Connection String</span>
                  <code>mysql://user@${connection.host}/database</code>
                </div>
                <div className="detail-item">
                  <span>Engine Type</span>
                  <span>MySQL Community</span>
                </div>
                <div className="detail-item">
                  <span>Default Character Set</span>
                  <span>utf8mb4</span>
                </div>
                <div className="detail-item">
                  <span>Collation</span>
                  <span>utf8mb4_unicode_ci</span>
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
          
          {activeTab === 'databases' && (
            <div className="tab-panel">
              <h3>Databases & Tables</h3>
              <div className="database-list">
                <div className="database-item">
                  <div className="database-name">information_schema</div>
                  <div className="database-size">System</div>
                </div>
                <div className="database-item">
                  <div className="database-name">mysql</div>
                  <div className="database-size">System</div>
                </div>
                <div className="database-item">
                  <div className="database-name">performance_schema</div>
                  <div className="database-size">System</div>
                </div>
                <div className="database-item">
                  <div className="database-name">application_db</div>
                  <div className="database-size">245 MB</div>
                </div>
                <div className="database-item">
                  <div className="database-name">analytics</div>
                  <div className="database-size">1.8 GB</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="tab-panel">
              <h3>Query Performance</h3>
              <p>Slow query statistics and performance metrics</p>
              <div className="performance-stats">
                <div className="stat-item">
                  <span>Average Query Time</span>
                  <span>18ms</span>
                </div>
                <div className="stat-item">
                  <span>Active Threads</span>
                  <span>24</span>
                </div>
                <div className="stat-item">
                  <span>Key Buffer Hit Rate</span>
                  <span>99.2%</span>
                </div>
                <div className="stat-item">
                  <span>Query Cache Efficiency</span>
                  <span>87.5%</span>
                </div>
                <div className="stat-item">
                  <span>InnoDB Buffer Pool Usage</span>
                  <span>76%</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="tab-panel">
              <h3>User Accounts & Privileges</h3>
              <p>MySQL user accounts and their access rights</p>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Root User</span>
                  <span>Localhost Only</span>
                </div>
                <div className="detail-item">
                  <span>Application User</span>
                  <span>Read/Write Access</span>
                </div>
                <div className="detail-item">
                  <span>Monitor User</span>
                  <span>Read Only</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="tab-panel">
              <h3>Activity Logs</h3>
              <p>MySQL server activity and query logs</p>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>General Log</span>
                  <span>Disabled</span>
                </div>
                <div className="detail-item">
                  <span>Slow Query Log</span>
                  <span>Enabled</span>
                </div>
                <div className="detail-item">
                  <span>Error Log</span>
                  <span>Active</span>
                </div>
                <div className="detail-item">
                  <span>Binary Log</span>
                  <span>Enabled</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySQLConnections;
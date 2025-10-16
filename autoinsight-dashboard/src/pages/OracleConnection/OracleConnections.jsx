import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OracleConnections.css';

const OracleConnections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([
    {
      id: '1',
      name: 'Finance Production',
      host: 'oracle://fin-db.company.com:1521/PROD',
      serviceName: 'PROD',
      status: 'warning',
      lastSync: '3 hours ago',
      schemas: 8,
      version: '19c',
      tags: ['production', 'finance', 'critical'],
      latency: '120ms',
      role: 'SYSDBA',
      connectionMethod: 'service_name',
      sslEnabled: true
    },
    {
      id: '2',
      name: 'HR Backup',
      host: 'oracle://backup-db.company.com:1521/HRDEV',
      serviceName: 'HRDEV',
      status: 'offline',
      lastSync: 'Failed',
      schemas: 0,
      version: '12c',
      tags: ['backup', 'hr'],
      latency: 'N/A',
      role: 'NORMAL',
      connectionMethod: 'service_name',
      sslEnabled: false
    },
    {
      id: '3',
      name: 'Analytics Warehouse',
      host: 'oracle://analytics-db:1521/DWPROD',
      serviceName: 'DWPROD',
      status: 'active',
      lastSync: '15 minutes ago',
      schemas: 12,
      version: '21c',
      tags: ['analytics', 'warehouse', 'read-only'],
      latency: '45ms',
      role: 'NORMAL',
      connectionMethod: 'service_name',
      sslEnabled: true
    },
    {
      id: '4',
      name: 'Legacy SID System',
      host: 'oracle://legacy-db:1521',
      sid: 'ORCL',
      status: 'active',
      lastSync: '1 hour ago',
      schemas: 6,
      version: '11g',
      tags: ['legacy', 'migration-pending'],
      latency: '85ms',
      role: 'SYSOPER',
      connectionMethod: 'sid',
      sslEnabled: false
    }
  ]);

  const [selectedConnections, setSelectedConnections] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showConnectionDrawer, setShowConnectionDrawer] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        // Simulate auto-refresh
        console.log('Auto-refreshing Oracle connections...');
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || conn.connectionMethod === filterMethod;
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (conn.serviceName && conn.serviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (conn.sid && conn.sid.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         conn.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesMethod && matchesSearch;
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
    console.log(`Testing Oracle connection: ${connectionId}`);
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'active' },
      warning: { label: 'Warning', class: 'warning' },
      offline: { label: 'Offline', class: 'offline' }
    };
    return statusConfig[status] || statusConfig.offline;
  };

  const getRoleDisplay = (role) => {
    const roleConfig = {
      SYSDBA: { label: 'SYSDBA', class: 'sysdba' },
      SYSOPER: { label: 'SYSOPER', class: 'sysoper' },
      NORMAL: { label: 'NORMAL', class: 'normal' }
    };
    return roleConfig[role] || roleConfig.NORMAL;
  };

  const getMethodDisplay = (method) => {
    const methodConfig = {
      service_name: { label: 'Service Name', class: 'service' },
      sid: { label: 'SID', class: 'sid' },
      tns: { label: 'TNS', class: 'tns' }
    };
    return methodConfig[method] || methodConfig.service_name;
  };

  return (
    <div className="oracle-connections-container">
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
            <h1>Oracle Database Connections</h1>
            <p>Manage enterprise-grade Oracle DB clusters and tenants</p>
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
            onClick={() => navigate('/configure-oracle')}
          >
            + Connect New Oracle DB
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
            <option value="offline">Offline</option>
          </select>
          <select 
            className="filter-select"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="service_name">Service Name</option>
            <option value="sid">SID</option>
            <option value="tns">TNS</option>
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
            <button className="btn-secondary">Export Wallet</button>
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
              <th className="column-host">Host / Service Name</th>
              <th className="column-status">Status</th>
              <th className="column-sync">Last Sync</th>
              <th className="column-schemas">Schemas</th>
              <th className="column-version">Version</th>
              <th className="column-tags">Tags</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map(connection => {
              const status = getStatusDisplay(connection.status);
              const role = getRoleDisplay(connection.role);
              const method = getMethodDisplay(connection.connectionMethod);
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
                    <div className="connection-meta">
                      <span className={`role-badge ${role.class}`}>{role.label}</span>
                      <span className={`method-badge ${method.class}`}>{method.label}</span>
                    </div>
                  </td>
                  <td className="column-host">
                    <code className="host-endpoint">{connection.host}</code>
                    <div className="connection-identifier">
                      {connection.serviceName && (
                        <span className="service-name">Service: {connection.serviceName}</span>
                      )}
                      {connection.sid && (
                        <span className="sid-name">SID: {connection.sid}</span>
                      )}
                    </div>
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
                  <td className="column-schemas">
                    {connection.schemas > 0 ? (
                      <span className="schemas-count">{connection.schemas}</span>
                    ) : (
                      <span className="no-schemas">—</span>
                    )}
                  </td>
                  <td className="column-version">
                    <span className="version-number">Oracle {connection.version}</span>
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
                        onClick={() => navigate(`/configure-oracle`)}
                      >
                        Edit
                      </button>
                      <div className="more-actions">
                        <button className="btn-more">⋯</button>
                        <div className="more-menu">
                          <button onClick={() => handleTestConnection(connection.id)}>Test Connection</button>
                          <button>Duplicate</button>
                          <button>Export TNS</button>
                          <button>Wallet Management</button>
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
              <h3>No Oracle connections found</h3>
              <p>No Oracle Database connections match your current filters. Try adjusting your search criteria or create a new connection.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/configure-oracle')}
              >
                + Connect New Oracle DB
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Detail Drawer */}
      {showConnectionDrawer && selectedConnection && (
        <OracleConnectionDetailDrawer
          connection={selectedConnection}
          onClose={() => setShowConnectionDrawer(false)}
        />
      )}
    </div>
  );
};

// Oracle Connection Detail Drawer Component
const OracleConnectionDetailDrawer = ({ connection, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const status = connection.status === 'active' ? 'Active' : 
                 connection.status === 'warning' ? 'Warning' : 'Offline';

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
            <span className="summary-label">Latency:</span>
            <span className="summary-value">{connection.latency}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Oracle Version:</span>
            <span className="summary-value">{connection.version}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Database Role:</span>
            <span className={`summary-value role-${connection.role.toLowerCase()}`}>
              {connection.role}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Connection Method:</span>
            <span className="summary-value">
              {connection.connectionMethod === 'service_name' ? 'Service Name' :
               connection.connectionMethod === 'sid' ? 'SID' : 'TNS'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">SSL/TLS:</span>
            <span className={`summary-value ssl-${connection.sslEnabled ? 'enabled' : 'disabled'}`}>
              {connection.sslEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Schemas Detected:</span>
            <span className="summary-value">{connection.schemas}</span>
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
            className={`tab ${activeTab === 'schemas' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemas')}
          >
            Schemas & Tablespaces
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users & Roles
          </button>
          <button 
            className={`tab ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            Tables & Indexes
          </button>
          <button 
            className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions & Locks
          </button>
          <button 
            className={`tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs
          </button>
        </div>

        <div className="drawer-tab-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <h3>Connection Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Connection String</span>
                  <code>{connection.host}</code>
                </div>
                <div className="detail-item">
                  <span>Service Name / SID</span>
                  <span>{connection.serviceName || connection.sid}</span>
                </div>
                <div className="detail-item">
                  <span>Last Successful Sync</span>
                  <span>{connection.lastSync}</span>
                </div>
                <div className="detail-item">
                  <span>Authentication Method</span>
                  <span>Password / Wallet</span>
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
          
          {activeTab === 'schemas' && (
            <div className="tab-panel">
              <h3>Schemas & Tablespaces</h3>
              <div className="schema-list">
                <div className="schema-item">
                  <div className="schema-name">SYS</div>
                  <div className="schema-size">System Schema</div>
                  <div className="schema-tablespace">SYSTEM</div>
                </div>
                <div className="schema-item">
                  <div className="schema-name">HR</div>
                  <div className="schema-size">45 MB</div>
                  <div className="schema-tablespace">USERS</div>
                </div>
                <div className="schema-item">
                  <div className="schema-name">FINANCE</div>
                  <div className="schema-size">2.1 GB</div>
                  <div className="schema-tablespace">FIN_DATA</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="tab-panel">
              <h3>Users & Privileges</h3>
              <p>Database users and their system privileges would be listed here</p>
              <div className="privilege-stats">
                <div className="stat-item">
                  <span>Total Users</span>
                  <span>24</span>
                </div>
                <div className="stat-item">
                  <span>SYSDBA Users</span>
                  <span>2</span>
                </div>
                <div className="stat-item">
                  <span>Active Sessions</span>
                  <span>18</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'tables' && (
            <div className="tab-panel">
              <h3>Tables & Indexes</h3>
              <p>Database metadata view showing tables, indexes, and storage information</p>
            </div>
          )}
          
          {activeTab === 'sessions' && (
            <div className="tab-panel">
              <h3>Active Sessions & Locks</h3>
              <p>Current database sessions and lock information would be displayed here</p>
            </div>
          )}
          
          {activeTab === 'audit' && (
            <div className="tab-panel">
              <h3>Audit Logs</h3>
              <p>Database access and security audit logs would be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OracleConnections;
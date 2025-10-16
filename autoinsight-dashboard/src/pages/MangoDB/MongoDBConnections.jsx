import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MongoDBConnections.css';

const MongoDBConnections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([
    {
      id: '1',
      name: 'Production Cluster',
      type: 'ReplicaSet',
      host: 'mongodb+srv://cluster0.abcd.mongodb.net',
      status: 'online',
      lastSync: '2 hours ago',
      databases: 5,
      tags: ['production', 'live'],
      latency: '24ms',
      version: '7.0.2'
    },
    {
      id: '2',
      name: 'Analytics Database',
      type: 'Standalone',
      host: 'mongodb://analytics-db.company.com:27017',
      status: 'degraded',
      lastSync: 'Failed',
      databases: 0,
      tags: ['analytics'],
      latency: '356ms',
      version: '6.0.5'
    },
    {
      id: '3',
      name: 'Local Development',
      type: 'Local',
      host: 'localhost:27017',
      status: 'offline',
      lastSync: 'N/A',
      databases: 0,
      tags: ['development'],
      latency: 'N/A',
      version: 'N/A'
    },
    {
      id: '4',
      name: 'Staging Environment',
      type: 'ReplicaSet',
      host: 'mongodb+srv://staging-cluster.efgh.mongodb.net',
      status: 'online',
      lastSync: '5 minutes ago',
      databases: 3,
      tags: ['staging', 'test'],
      latency: '45ms',
      version: '7.0.1'
    }
  ]);

  const [selectedConnections, setSelectedConnections] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showConnectionDrawer, setShowConnectionDrawer] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        // Simulate auto-refresh
        console.log('Auto-refreshing connections...');
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
    const matchesType = filterType === 'all' || conn.type === filterType;
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
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
    console.log(`Testing connection: ${connectionId}`);
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      online: { label: 'Online', class: 'online' },
      degraded: { label: 'Degraded', class: 'degraded' },
      offline: { label: 'Offline', class: 'offline' }
    };
    return statusConfig[status] || statusConfig.offline;
  };

  return (
    <div className="page-wrapper">
    <div className="mongodb-connections-container">
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
            <h1>MongoDB Connections</h1>
            <p>Manage all MongoDB clusters, replicas, and nodes</p>
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
            onClick={() => navigate('/configure-mongodb')}
          >
            + Connect New MongoDB
          </button>
        </div>
        <div className="action-right">
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="degraded">Degraded</option>
            <option value="offline">Offline</option>
          </select>
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="ReplicaSet">ReplicaSet</option>
            <option value="Standalone">Standalone</option>
            <option value="Local">Local</option>
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
              <th className="column-type">Type</th>
              <th className="column-host">Host / Cluster URI</th>
              <th className="column-status">Status</th>
              <th className="column-sync">Last Sync</th>
              <th className="column-databases">Databases</th>
              <th className="column-tags">Tags</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map(connection => {
              const status = getStatusDisplay(connection.status);
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
                  </td>
                  <td className="column-type">
                    <span className="type-badge">{connection.type}</span>
                  </td>
                  <td className="column-host">
                    <code className="host-uri">{connection.host}</code>
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
                        onClick={() => navigate(`/configure-mongodb`)}
                      >
                        Edit
                      </button>
                      <div className="more-actions">
                        <button className="btn-more">⋯</button>
                        <div className="more-menu">
                          <button>Duplicate</button>
                          <button>Export Config</button>
                          <button>Test Connection</button>
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
              <h3>No connections found</h3>
              <p>No MongoDB connections match your current filters. Try adjusting your search criteria or create a new connection.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/configure-mongodb')}
              >
                + Connect New MongoDB
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Detail Drawer */}
      {showConnectionDrawer && selectedConnection && (
        <ConnectionDetailDrawer
          connection={selectedConnection}
          onClose={() => setShowConnectionDrawer(false)}
        />
      )}
    </div>
    </div>
  );
};

// Connection Detail Drawer Component
const ConnectionDetailDrawer = ({ connection, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const status = connection.status === 'online' ? 'Online' : 
                 connection.status === 'degraded' ? 'Degraded' : 'Offline';

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
            <span className="summary-label">Version:</span>
            <span className="summary-value">{connection.version}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Cluster Type:</span>
            <span className="summary-value">{connection.type}</span>
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
            Databases & Collections
          </button>
          <button 
            className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
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
                  <span>Connection URI</span>
                  <code>{connection.host}</code>
                </div>
                <div className="detail-item">
                  <span>Last Successful Sync</span>
                  <span>{connection.lastSync}</span>
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
              <h3>Databases & Collections</h3>
              <p>Database tree view would be displayed here</p>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="tab-panel">
              <h3>Performance Metrics</h3>
              <p>Latency charts and performance data would be displayed here</p>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="tab-panel">
              <h3>Activity Logs</h3>
              <p>Connection activity and sync logs would be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MongoDBConnections;
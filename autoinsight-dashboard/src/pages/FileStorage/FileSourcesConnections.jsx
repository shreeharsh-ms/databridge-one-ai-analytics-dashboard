import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileSourcesConnections.css';

const FileSourcesConnections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([
    {
      id: '1',
      name: 'Sales Data',
      path: 's3://company-data-bucket/sales/',
      status: 'active',
      lastSync: '1 week ago',
      fileCount: 24,
      size: '1.2 GB',
      tags: ['finance', 'monthly'],
      type: 's3',
      hasPreview: true
    },
    {
      id: '2',
      name: 'Marketing Analytics',
      path: './uploads/marketing/campaigns.csv',
      status: 'warning',
      lastSync: '3 days ago',
      fileCount: 1,
      size: '120 MB',
      tags: ['marketing', 'analytics'],
      type: 'local',
      hasPreview: true
    },
    {
      id: '3',
      name: 'HR Records',
      path: 'https://drive.google.com/drive/folders/abc123',
      status: 'active',
      lastSync: '5 days ago',
      fileCount: 3,
      size: '300 MB',
      tags: ['hr', 'confidential'],
      type: 'gdrive',
      hasPreview: false
    },
    {
      id: '4',
      name: 'Customer Feedback',
      path: 'azure://storage-account/feedback/',
      status: 'error',
      lastSync: 'Failed',
      fileCount: 0,
      size: '0 B',
      tags: ['customers', 'reviews'],
      type: 'azure',
      hasPreview: false
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
        console.log('Auto-refreshing file sources...');
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'active' },
      warning: { label: 'Warning', class: 'warning' },
      error: { label: 'Error', class: 'error' }
    };
    return statusConfig[status] || statusConfig.error;
  };

  const getSourceTypeDisplay = (type) => {
    const typeConfig = {
      s3: { label: 'Amazon S3', class: 's3' },
      local: { label: 'Local File', class: 'local' },
      gdrive: { label: 'Google Drive', class: 'gdrive' },
      azure: { label: 'Azure Blob', class: 'azure' },
      dropbox: { label: 'Dropbox', class: 'dropbox' }
    };
    return typeConfig[type] || { label: type, class: 'default' };
  };

  return (
    <div className="file-sources-container">
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
            <h1>File Sources Connections</h1>
            <p>Manage all uploaded or linked file sources</p>
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
            onClick={() => navigate('/configure-filesources')}
          >
            + Add New File Source
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
            <option value="error">Error</option>
          </select>
          <input
            type="text"
            placeholder="Search file sources..."
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
            <span>{selectedConnections.length} file source(s) selected</span>
          </div>
          <div className="bulk-actions-right">
            <button className="btn-secondary">Refresh Selected</button>
            <button className="btn-secondary">Export List</button>
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
              <th className="column-path">Path / Source</th>
              <th className="column-status">Status</th>
              <th className="column-sync">Last Sync</th>
              <th className="column-files">Files / Size</th>
              <th className="column-tags">Tags</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map(connection => {
              const status = getStatusDisplay(connection.status);
              const sourceType = getSourceTypeDisplay(connection.type);
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
                    <div className="connection-name">
                      {connection.name}
                      {connection.hasPreview && (
                        <span className="preview-badge">AI Preview</span>
                      )}
                    </div>
                    <div className="connection-type">
                      <span className={`source-type ${sourceType.class}`}>{sourceType.label}</span>
                    </div>
                  </td>
                  <td className="column-path">
                    <code className="path-display">{connection.path}</code>
                  </td>
                  <td className="column-status">
                    <div className="status-cell">
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  <td className="column-sync">
                    <span className={`sync-time ${connection.lastSync === 'Failed' ? 'failed' : ''}`}>
                      {connection.lastSync}
                    </span>
                  </td>
                  <td className="column-files">
                    <div className="files-size">
                      <span className="file-count">{connection.fileCount} files</span>
                      <span className="file-size">{connection.size}</span>
                    </div>
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
                        onClick={() => navigate('/configure-filesources')}
                      >
                        Edit
                      </button>
                      <div className="more-actions">
                        <button className="btn-more">⋯</button>
                        <div className="more-menu">
                          <button>Refresh Metadata</button>
                          <button>Download Files</button>
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
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#6B7280" strokeWidth="2"/>
                  <path d="M14 2V8H20" stroke="#6B7280" strokeWidth="2"/>
                  <path d="M16 13H8" stroke="#6B7280" strokeWidth="2"/>
                  <path d="M16 17H8" stroke="#6B7280" strokeWidth="2"/>
                  <path d="M10 9H9H8" stroke="#6B7280" strokeWidth="2"/>
                </svg>
              </div>
              <h3>No file sources connected yet</h3>
              <p>Upload files or connect cloud storage to start monitoring your data.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/configure-filesources')}
              >
                + Add New File Source
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Detail Drawer */}
      {showConnectionDrawer && selectedConnection && (
        <FileSourceDetailDrawer
          connection={selectedConnection}
          onClose={() => setShowConnectionDrawer(false)}
        />
      )}
    </div>
  );
};

// File Source Detail Drawer Component
const FileSourceDetailDrawer = ({ connection, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const status = connection.status === 'active' ? 'Active' : 
                 connection.status === 'warning' ? 'Warning' : 'Error';

  const sampleFiles = [
    { name: 'sales_q1_2024.csv', size: '45 MB', modified: '2024-03-15', type: 'CSV' },
    { name: 'sales_q2_2024.csv', size: '52 MB', modified: '2024-06-20', type: 'CSV' },
    { name: 'customers.json', size: '23 MB', modified: '2024-06-18', type: 'JSON' }
  ];

  const sampleData = [
    { id: 1, date: '2024-06-01', product: 'Product A', revenue: 12500, region: 'North' },
    { id: 2, date: '2024-06-02', product: 'Product B', revenue: 8900, region: 'South' },
    { id: 3, date: '2024-06-03', product: 'Product A', revenue: 11200, region: 'East' },
    { id: 4, date: '2024-06-04', product: 'Product C', revenue: 15600, region: 'West' },
    { id: 5, date: '2024-06-05', product: 'Product B', revenue: 9800, region: 'North' }
  ];

  const insights = [
    'Revenue shows consistent growth week-over-week',
    'Product A is the top performer across all regions',
    'Consider analyzing seasonal trends in the data',
    'No missing values detected in key columns'
  ];

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
            <span className="summary-label">Source Type:</span>
            <span className="summary-value">{connection.type.toUpperCase()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Sync:</span>
            <span className="summary-value">{connection.lastSync}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Files:</span>
            <span className="summary-value">{connection.fileCount}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Size:</span>
            <span className="summary-value">{connection.size}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">AI Preview:</span>
            <span className={`summary-value ${connection.hasPreview ? 'preview-available' : 'preview-unavailable'}`}>
              {connection.hasPreview ? 'Available' : 'Not Available'}
            </span>
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
            className={`tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
          <button 
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Data Preview
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            AI Insights
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
              <h3>Source Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Source Path</span>
                  <code>{connection.path}</code>
                </div>
                <div className="detail-item">
                  <span>Connection Established</span>
                  <span>2 months ago</span>
                </div>
                <div className="detail-item">
                  <span>Sync Schedule</span>
                  <span>Weekly (Sundays 02:00)</span>
                </div>
                <div className="detail-item">
                  <span>File Formats</span>
                  <span>CSV, JSON</span>
                </div>
                <div className="detail-item">
                  <span>Compression</span>
                  <span>None</span>
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
          
          {activeTab === 'files' && (
            <div className="tab-panel">
              <h3>File List</h3>
              <div className="files-list">
                {sampleFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-details">
                        <span className="file-type">{file.type}</span>
                        <span className="file-size">{file.size}</span>
                        <span className="file-modified">Modified: {file.modified}</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button className="btn-secondary">Download</button>
                      <button className="btn-secondary">Preview</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'preview' && (
            <div className="tab-panel">
              <h3>Data Preview</h3>
              <p>First 5 rows from the dataset</p>
              <div className="data-preview">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Revenue</th>
                      <th>Region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.id}</td>
                        <td>{row.date}</td>
                        <td>{row.product}</td>
                        <td>${row.revenue.toLocaleString()}</td>
                        <td>{row.region}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="tab-panel">
              <h3>AI Insights</h3>
              <p>Automated analysis of your data patterns and quality</p>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-text">{insight}</div>
                  </div>
                ))}
              </div>
              <div className="suggested-questions">
                <h4>Suggested Questions</h4>
                <div className="questions-list">
                  <button className="question-chip">Show monthly revenue trends</button>
                  <button className="question-chip">Compare product performance</button>
                  <button className="question-chip">Identify top regions by sales</button>
                  <button className="question-chip">Detect seasonal patterns</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="tab-panel">
              <h3>Activity Logs</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">2024-06-20 14:30:23</span>
                  <span className="activity-message">Successfully synced 24 files</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2024-06-13 14:28:11</span>
                  <span className="activity-message">Weekly sync completed</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2024-06-06 14:25:47</span>
                  <span className="activity-message">New files detected and processed</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2024-05-30 14:22:15</span>
                  <span className="activity-message">Initial connection established</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSourcesConnections;
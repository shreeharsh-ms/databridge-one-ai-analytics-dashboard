import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataConnectionsOverview.css';

const DataConnectionsOverview = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionsData, setConnectionsData] = useState({
    mongodb: {
      name: 'MongoDB',
      connections: [
        { name: 'Production Cluster', status: 'connected', lastSync: '1 hour ago', type: 'mongodb' },
        { name: 'Analytics DB', status: 'connected', lastSync: '2 hours ago', type: 'mongodb' }
      ],
      total: 2,
      connected: 2,
      failed: 0
    },
    postgresql: {
      name: 'PostgreSQL',
      connections: [
        { name: 'Main Database', status: 'connected', lastSync: '3 days ago', type: 'postgresql' }
      ],
      total: 1,
      connected: 1,
      failed: 0
    },
    oracle: {
      name: 'Oracle Database',
      connections: [
        { name: 'ERP System', status: 'warning', lastSync: '5 days ago', type: 'oracle' }
      ],
      total: 1,
      connected: 0,
      failed: 0,
      warning: 1
    },
    mysql: {
      name: 'MySQL',
      connections: [],
      total: 0,
      connected: 0,
      failed: 0
    },
    csv: {
      name: 'File Sources',
      connections: [
        { name: 'Sales Data', status: 'connected', lastSync: '2 days ago', type: 'file' },
        { name: 'Customer Records', status: 'connected', lastSync: '1 day ago', type: 'file' },
        { name: 'Inventory', status: 'warning', lastSync: '1 week ago', type: 'file' }
      ],
      total: 3,
      connected: 2,
      failed: 0,
      warning: 1
    },
    api: {
      name: 'API Endpoints',
      connections: [
        { name: 'Payment Gateway', status: 'failed', lastSync: 'Never', type: 'api' }
      ],
      total: 1,
      connected: 0,
      failed: 1
    }
  });

  const filters = [
    { id: 'all', label: 'All Technologies' },
    { id: 'nosql', label: 'NoSQL' },
    { id: 'sql', label: 'SQL' },
    { id: 'file', label: 'File Sources' },
    { id: 'api', label: 'APIs' }
  ];

  const getTechnologyType = (techId) => {
    const sqlTechs = ['postgresql', 'mysql', 'oracle'];
    const nosqlTechs = ['mongodb'];
    const fileTechs = ['csv'];
    const apiTechs = ['api'];

    if (sqlTechs.includes(techId)) return 'sql';
    if (nosqlTechs.includes(techId)) return 'nosql';
    if (fileTechs.includes(techId)) return 'file';
    if (apiTechs.includes(techId)) return 'api';
    return 'other';
  };

  const getStatusDisplay = (tech) => {
    if (tech.total === 0) return { text: 'No connections', class: 'empty' };
    if (tech.failed > 0) return { text: `${tech.connected} active, ${tech.failed} failed`, class: 'error' };
    if (tech.warning > 0) return { text: `${tech.connected} active, ${tech.warning} warning`, class: 'warning' };
    return { text: `${tech.connected} active`, class: 'success' };
  };

  const getLastActivity = (tech) => {
    if (tech.total === 0) return 'Never connected';
    const latestConnection = tech.connections.reduce((latest, conn) => {
      if (!latest) return conn;
      return conn.lastSync;
    }, null);
    return `Last sync: ${latestConnection}`;
  };

const handleAddConnection = (technology) => {
  const routes = {
    mongodb: '/configure-mongodb',
    postgresql: '/configure-postgresql',
    oracle: '/configure-oracle',
    mysql: '/connections/mysql',          // No configure route for MySQL
    csv: '/connections/filesources',      // No configure page for file sources
    api: '/configure-apiendpoint'
  };
  navigate(routes[technology] || '/configure');
};

const handleViewAll = (technology) => {
  const viewRoutes = {
    mongodb: '/connections/mongodb',
    postgresql: '/connections/postgresql',
    oracle: '/connections/oracle',
    mysql: '/connections/mysql',
    csv: '/connections/filesources',
    api: '/connections/apiendpoints'
  };
  navigate(viewRoutes[technology] || '/connections');
};


  const filteredTechnologies = Object.entries(connectionsData).filter(([techId, tech]) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sql' && ['postgresql', 'mysql', 'oracle'].includes(techId)) return true;
    if (activeFilter === 'nosql' && techId === 'mongodb') return true;
    if (activeFilter === 'file' && techId === 'csv') return true;
    if (activeFilter === 'api' && techId === 'api') return true;
    return false;
  });

  return (
    <div className="connections-overview-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-left">
            <div className="nav-logo">DataConnect</div>
            <div className="nav-links">
              <a className="nav-link active">Data Sources</a>
              <a className="nav-link">Explore</a>
              <a className="nav-link">AI Insights</a>
              <a className="nav-link">Reports</a>
            </div>
          </div>
          <div className="nav-right">
            <button className="nav-search">Search</button>
            <button className="nav-settings">Settings</button>
            <div className="nav-profile">User</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Data Connections</h1>
              <p>Manage & monitor all data sources across technologies</p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => handleAddConnection('mongodb')}>
                + Add Connection
              </button>
              <button className="btn-secondary">Help</button>
              <button className="btn-secondary">Documentation</button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-content">
            <div className="filter-pills">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by source name, host, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Technology Cards Grid */}
        <div className="technology-grid">
          {filteredTechnologies.map(([techId, tech]) => {
            const status = getStatusDisplay(tech);
            const lastActivity = getLastActivity(tech);
            
            return (
              <div key={techId} className="technology-card">
                <div className="card-header">
                  <div className="tech-name">{tech.name}</div>
                  <div className={`status-badge ${status.class}`}>
                    {status.text}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="activity-info">
                    {lastActivity}
                  </div>
                </div>

                <div className="card-actions">
                  {tech.total > 0 ? (
                    <button 
                      className="btn-view-all"
                      onClick={() => handleViewAll(techId)}
                    >
                      View All Connections
                    </button>
                  ) : (
                    <button 
                      className="btn-add-now"
                      onClick={() => handleAddConnection(techId)}
                    >
                      Add Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State for No Technologies */}
        {filteredTechnologies.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <h3>No technologies found</h3>
              <p>No data technologies match your current filters. Try adjusting your search or filter criteria.</p>
              <button 
                className="btn-primary"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataConnectionsOverview;
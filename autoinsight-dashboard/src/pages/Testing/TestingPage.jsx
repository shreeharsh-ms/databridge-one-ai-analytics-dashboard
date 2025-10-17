import React from 'react';
import { Link } from 'react-router-dom';
import './TestingPage.css';

const TestingPage = () => {
  const routes = [
    { path: '/', name: 'Home Redirect', description: 'Redirects to connections' },
    { path: '/connections', name: 'Data Connections Overview', description: 'Main connections dashboard' },
    { path: '/configure-mongodb', name: 'Configure MongoDB', description: 'MongoDB connection setup' },
    { path: '/test-mongodb', name: 'Test MongoDB', description: 'Test MongoDB connection' },
    { path: '/configure-postgresql', name: 'Configure PostgreSQL', description: 'PostgreSQL connection setup' },
    { path: '/test-postgresql', name: 'Test PostgreSQL', description: 'Test PostgreSQL connection' },
    { path: '/configure-oracle', name: 'Configure Oracle', description: 'Oracle connection setup' },
    { path: '/test-oracle', name: 'Test Oracle', description: 'Test Oracle connection' },
    { path: '/connections/mongodb', name: 'MongoDB Connections', description: 'MongoDB connections list' },
    { path: '/connections/postgresql', name: 'PostgreSQL Connections', description: 'PostgreSQL connections list' },
    { path: '/connections/oracle', name: 'Oracle Connections', description: 'Oracle connections list' },
    { path: '/connections/mysql', name: 'MySQL Connections', description: 'MySQL connections list' },
    { path: '/connections/filesources', name: 'File Sources', description: 'File sources connections' },
    { path: '/connections/apiendpoints', name: 'API Endpoints', description: 'API endpoints connections' },
    { path: '/configure-apiendpoint', name: 'Configure API Endpoint', description: 'API endpoint setup' },
    { path: '/configure-filesources', name: 'Configure File Sources', description: 'File sources setup' },
    { path: '/test-filesource', name: 'Test File Source', description: 'Test file source connection' },
    { path: '/test-apiconnection', name: 'Test API Connection', description: 'Test API connection' },
    { path: '/configure-mysql', name: 'Configure MySQL', description: 'MySQL connection setup' },
    { path: '/test-mysql', name: 'Test MySQL', description: 'Test MySQL connection' },
    { path: '/data-explore', name: 'Data Explore', description: 'Data exploration interface' },
    { path: '/data-manipulation', name: 'Data Manipulation', description: 'Data manipulation workspace' }
  ];

  const databaseRoutes = routes.filter(route => 
    route.path.includes('mongodb') || 
    route.path.includes('postgresql') || 
    route.path.includes('oracle') || 
    route.path.includes('mysql')
  );

  const connectionRoutes = routes.filter(route => 
    route.path.includes('/connections/') && 
    !route.path.includes('mongodb') && 
    !route.path.includes('postgresql') && 
    !route.path.includes('oracle') && 
    !route.path.includes('mysql')
  );

  const configurationRoutes = routes.filter(route => 
    route.path.includes('/configure-') || 
    route.path.includes('/test-')
  );

  const mainRoutes = routes.filter(route => 
    !route.path.includes('/connections/') && 
    !route.path.includes('/configure-') && 
    !route.path.includes('/test-') &&
    route.path !== '/'
  );

  return (
    <div className="testing-page">
      <div className="testing-header">
        <h1>🚀 DataConnect - Testing Portal</h1>
        <p>Access all application pages for testing and development</p>
      </div>

      <div className="routes-grid">
        {/* Main Application Pages */}
        <div className="route-section">
          <h2>📊 Main Application</h2>
          <div className="route-cards">
            {mainRoutes.map(route => (
              <Link key={route.path} to={route.path} className="route-card main">
                <div className="card-content">
                  <h3>{route.name}</h3>
                  <p>{route.description}</p>
                  <span className="route-path">{route.path}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Database Connections */}
        <div className="route-section">
          <h2>🗄️ Database Connections</h2>
          <div className="route-cards">
            {databaseRoutes.map(route => (
              <Link key={route.path} to={route.path} className="route-card database">
                <div className="card-content">
                  <h3>{route.name}</h3>
                  <p>{route.description}</p>
                  <span className="route-path">{route.path}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* File & API Connections */}
        <div className="route-section">
          <h2>📁 File & API Connections</h2>
          <div className="route-cards">
            {connectionRoutes.map(route => (
              <Link key={route.path} to={route.path} className="route-card file-api">
                <div className="card-content">
                  <h3>{route.name}</h3>
                  <p>{route.description}</p>
                  <span className="route-path">{route.path}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Configuration & Testing */}
        <div className="route-section">
          <h2>⚙️ Configuration & Testing</h2>
          <div className="route-cards">
            {configurationRoutes.map(route => (
              <Link key={route.path} to={route.path} className="route-card config">
                <div className="card-content">
                  <h3>{route.name}</h3>
                  <p>{route.description}</p>
                  <span className="route-path">{route.path}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="testing-notes">
        <h3>📝 Testing Notes</h3>
        <ul>
          <li>All routes are accessible from this portal</li>
          <li>Use browser back button to return to this page</li>
          <li>Check console for any errors during navigation</li>
          <li>Test both successful and error scenarios</li>
        </ul>
      </div>
    </div>
  );
};

export default TestingPage;
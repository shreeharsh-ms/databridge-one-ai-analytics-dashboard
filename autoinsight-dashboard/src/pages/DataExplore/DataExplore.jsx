import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataExplore.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We encountered an error while rendering this component.</p>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DataExplore = () => {
  const navigate = useNavigate();
  const [activeConnection, setActiveConnection] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [visualizationConfig, setVisualizationConfig] = useState({
    chartType: 'bar',
    xAxis: '',
    yAxis: '',
    groupBy: ''
  });

  // Comprehensive connections data with detailed statistics
  const connectionsData = {
    mongodb: {
      id: 'mongodb',
      name: 'MongoDB Production Cluster',
      type: 'mongodb',
      status: 'connected',
      version: '6.0',
      host: 'cluster1.mongodb.net',
      lastSync: '2 minutes ago',
      latency: '45ms',
      databases: {
        'analytics': {
          size: '15.2 GB',
          collectionCount: 8,
          collections: {
            'user_sessions': {
              fields: ['_id', 'userId', 'sessionStart', 'sessionEnd', 'pageViews', 'deviceType', 'location'],
              rowCount: 1250000,
              size: '2.1 GB',
              avgDocSize: '1.7 KB',
              indexes: ['_id_', 'userId_1', 'sessionStart_1'],
              storageEngine: 'WiredTiger'
            },
            'events': {
              fields: ['_id', 'eventType', 'timestamp', 'properties', 'userId', 'sessionId', 'ipAddress'],
              rowCount: 4500000,
              size: '3.8 GB',
              avgDocSize: '0.9 KB',
              indexes: ['_id_', 'timestamp_1', 'eventType_1'],
              storageEngine: 'WiredTiger'
            },
            'audit_logs': {
              fields: ['_id', 'action', 'userId', 'timestamp', 'resource', 'changes'],
              rowCount: 890000,
              size: '5.2 GB',
              avgDocSize: '6.1 KB',
              indexes: ['_id_', 'timestamp_1', 'userId_1'],
              storageEngine: 'WiredTiger'
            }
          }
        },
        'operations': {
          size: '8.7 GB',
          collectionCount: 5,
          collections: {
            'performance_metrics': {
              fields: ['_id', 'metricName', 'value', 'timestamp', 'service', 'host'],
              rowCount: 3200000,
              size: '4.1 GB',
              avgDocSize: '1.3 KB',
              indexes: ['_id_', 'timestamp_1', 'service_1'],
              storageEngine: 'WiredTiger'
            }
          }
        }
      }
    },
    postgresql: {
      id: 'postgresql',
      name: 'PostgreSQL Main Database',
      type: 'postgresql',
      status: 'connected',
      version: '15.2',
      host: 'postgres-prod.internal:5432',
      lastSync: '5 minutes ago',
      latency: '23ms',
      databases: {
        'production': {
          size: '48.3 GB',
          tableCount: 24,
          tables: {
            'users': {
              fields: ['id', 'email', 'created_at', 'updated_at', 'status', 'last_login', 'role', 'department'],
              rowCount: 50000,
              size: '850 MB',
              indexes: ['PRIMARY', 'idx_email', 'idx_status', 'idx_last_login'],
              schema: 'public',
              tableType: 'BASE TABLE'
            },
            'orders': {
              fields: ['id', 'user_id', 'amount', 'status', 'created_at', 'updated_at', 'currency', 'payment_method'],
              rowCount: 2500000,
              size: '1.2 GB',
              indexes: ['PRIMARY', 'idx_user_id', 'idx_status', 'idx_created_at'],
              schema: 'public',
              tableType: 'BASE TABLE'
            },
            'products': {
              fields: ['id', 'name', 'price', 'category', 'in_stock', 'supplier_id', 'created_at'],
              rowCount: 15000,
              size: '320 MB',
              indexes: ['PRIMARY', 'idx_category', 'idx_supplier', 'idx_price'],
              schema: 'public',
              tableType: 'BASE TABLE'
            },
            'order_items': {
              fields: ['id', 'order_id', 'product_id', 'quantity', 'unit_price', 'total_price'],
              rowCount: 7500000,
              size: '2.8 GB',
              indexes: ['PRIMARY', 'idx_order_id', 'idx_product_id'],
              schema: 'public',
              tableType: 'BASE TABLE'
            }
          }
        }
      }
    },
    oracle: {
      id: 'oracle',
      name: 'Oracle ERP System',
      type: 'oracle',
      status: 'warning',
      version: '19c',
      host: 'oracle-erp.corporate.com:1521',
      lastSync: '1 hour ago',
      latency: '120ms',
      databases: {
        'erp_system': {
          size: '125.7 GB',
          tableCount: 42,
          tables: {
            'customers': {
              fields: ['CUSTOMER_ID', 'COMPANY_NAME', 'CONTACT_NAME', 'ADDRESS', 'COUNTRY', 'PHONE', 'CREDIT_LIMIT'],
              rowCount: 15000,
              size: '1.1 GB',
              indexes: ['PK_CUSTOMERS', 'IDX_COMPANY_NAME'],
              schema: 'ERP_MAIN',
              tableType: 'TABLE'
            },
            'inventory': {
              fields: ['PRODUCT_ID', 'WAREHOUSE_ID', 'QUANTITY', 'LAST_RESTOCK', 'MIN_STOCK', 'MAX_STOCK'],
              rowCount: 500000,
              size: '850 MB',
              indexes: ['PK_INVENTORY', 'IDX_WAREHOUSE'],
              schema: 'ERP_MAIN',
              tableType: 'TABLE'
            }
          }
        }
      }
    },
    mysql: {
      id: 'mysql',
      name: 'MySQL Analytics DB',
      type: 'mysql',
      status: 'connected',
      version: '8.0',
      host: 'mysql-analytics.internal:3306',
      lastSync: '30 seconds ago',
      latency: '15ms',
      databases: {
        'web_analytics': {
          size: '12.4 GB',
          tableCount: 12,
          tables: {
            'page_views': {
              fields: ['id', 'url', 'user_id', 'session_id', 'timestamp', 'referrer', 'user_agent'],
              rowCount: 15000000,
              size: '8.2 GB',
              indexes: ['PRIMARY', 'idx_timestamp', 'idx_user_id', 'idx_url'],
              schema: 'analytics',
              tableType: 'InnoDB'
            },
            'user_agents': {
              fields: ['id', 'user_agent', 'browser', 'os', 'device_type', 'is_mobile'],
              rowCount: 250000,
              size: '450 MB',
              indexes: ['PRIMARY', 'idx_browser', 'idx_device_type'],
              schema: 'analytics',
              tableType: 'InnoDB'
            }
          }
        }
      }
    },
    sqlserver: {
      id: 'sqlserver',
      name: 'SQL Server Data Warehouse',
      type: 'sqlserver',
      status: 'connected',
      version: '2019',
      host: 'sqlserver-dw.corporate.com:1433',
      lastSync: '10 minutes ago',
      latency: '65ms',
      databases: {
        'data_warehouse': {
          size: '245.8 GB',
          tableCount: 18,
          tables: {
            'fact_sales': {
              fields: ['SalesKey', 'DateKey', 'ProductKey', 'CustomerKey', 'SalesAmount', 'Quantity', 'Profit'],
              rowCount: 25000000,
              size: '45.2 GB',
              indexes: ['PK_FactSales', 'IX_DateKey', 'IX_ProductKey'],
              schema: 'dbo',
              tableType: 'CLUSTERED'
            },
            'dim_customers': {
              fields: ['CustomerKey', 'CustomerName', 'Segment', 'Country', 'Region', 'JoinDate'],
              rowCount: 500000,
              size: '3.8 GB',
              indexes: ['PK_DimCustomers', 'IX_Segment'],
              schema: 'dbo',
              tableType: 'CLUSTERED'
            }
          }
        }
      }
    },
    csv: {
      id: 'csv',
      name: 'File Data Sources',
      type: 'csv',
      status: 'connected',
      version: 'N/A',
      host: 'Local Storage',
      lastSync: 'Just now',
      latency: '5ms',
      databases: {
        'file_sources': {
          size: '2.3 GB',
          tableCount: 8,
          tables: {
            'sales_data': {
              fields: ['Region', 'Country', 'Item_Type', 'Sales_Channel', 'Order_Priority', 'Order_Date', 'Units_Sold'],
              rowCount: 150000,
              size: '450 MB',
              indexes: [],
              schema: 'files',
              tableType: 'CSV'
            },
            'customer_feedback': {
              fields: ['Feedback_ID', 'Customer_ID', 'Rating', 'Comments', 'Date_Submitted', 'Product_ID'],
              rowCount: 75000,
              size: '280 MB',
              indexes: [],
              schema: 'files',
              tableType: 'CSV'
            },
            'inventory_snapshot': {
              fields: ['Product_ID', 'Warehouse', 'Current_Stock', 'Reorder_Level', 'Last_Updated'],
              rowCount: 25000,
              size: '120 MB',
              indexes: [],
              schema: 'files',
              tableType: 'CSV'
            }
          }
        }
      }
    },
    api: {
      id: 'api',
      name: 'API Endpoints',
      type: 'api',
      status: 'warning',
      version: 'REST',
      host: 'Various endpoints',
      lastSync: '15 minutes ago',
      latency: 'Varies',
      databases: {
        'api_endpoints': {
          size: 'N/A',
          tableCount: 6,
          tables: {
            'payment_gateway': {
              fields: ['transaction_id', 'amount', 'currency', 'status', 'customer_email', 'timestamp'],
              rowCount: 0,
              size: 'N/A',
              indexes: [],
              schema: 'api',
              tableType: 'REST_ENDPOINT'
            },
            'weather_data': {
              fields: ['location', 'temperature', 'humidity', 'pressure', 'wind_speed', 'timestamp'],
              rowCount: 0,
              size: 'N/A',
              indexes: [],
              schema: 'api',
              tableType: 'REST_ENDPOINT'
            },
            'social_media': {
              fields: ['post_id', 'user_id', 'content', 'likes', 'shares', 'timestamp'],
              rowCount: 0,
              size: 'N/A',
              indexes: [],
              schema: 'api',
              tableType: 'REST_ENDPOINT'
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!activeConnection && Object.keys(connectionsData).length > 0) {
      const firstConnection = Object.keys(connectionsData)[0];
      setActiveConnection(connectionsData[firstConnection]);
    }
  }, []);

  const handleTableSelect = (database, tableName, tableData) => {
    const tableInfo = {
      database,
      table: tableName,
      connection: activeConnection,
      ...tableData
    };
    setSelectedTable(tableInfo);
    setActiveTab('overview');
  };

  const executeQuery = (query) => {
    if (!query.trim()) return;

    const newHistory = [
      {
        id: Date.now(),
        query: query,
        timestamp: new Date().toISOString(),
        connection: activeConnection.name
      },
      ...queryHistory.slice(0, 9)
    ];
    setQueryHistory(newHistory);

    const mockResults = {
      columns: selectedTable ? selectedTable.fields : ['id', 'name', 'value', 'timestamp'],
      data: Array.from({ length: 25 }, (_, i) => {
        const baseRecord = {
          id: i + 1,
          name: `Record ${i + 1}`,
          value: Math.random() * 1000,
          timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        };
        
        if (selectedTable && selectedTable.fields) {
          selectedTable.fields.forEach(field => {
            if (!baseRecord[field]) {
              baseRecord[field] = `Sample ${field} ${i + 1}`;
            }
          });
        }
        
        return baseRecord;
      }),
      executionTime: '125ms',
      rowCount: 25,
      size: '45 KB'
    };
    
    setQueryResults(mockResults);
    setActiveTab('results');
  };

  // Fixed ConnectionTree component
  const ConnectionTree = ({ connection }) => {
    if (!connection) {
      return (
        <div className="connection-tree">
          <div className="tree-header">
            <div className="connection-info">
              <div className="connection-name">No Connection Selected</div>
            </div>
          </div>
        </div>
      );
    }

    const getObjectCount = (database) => {
      if (database.tables) {
        return Object.keys(database.tables).length;
      }
      if (database.collections) {
        return Object.keys(database.collections).length;
      }
      return 0;
    };

    const getObjectSize = (database) => {
      return database.size || 'N/A';
    };

    return (
      <div className="connection-tree">
        <div className="tree-header">
          <div className="connection-info">
            <div className="connection-name">{connection.name}</div>
            <div className="connection-details">
              <div className="connection-host">{connection.host}</div>
              <div className={`connection-status ${connection.status}`}>
                {connection.status.toUpperCase()} • {connection.latency}
              </div>
            </div>
          </div>
        </div>
        
        <div className="tree-content">
          {Object.entries(connection.databases).map(([dbName, database]) => {
            const objectCount = getObjectCount(database);
            const objectSize = getObjectSize(database);
            
            return (
              <div key={dbName} className="database-node">
                <div className="node-label">
                  <span>{dbName}</span>
                  <span className="node-stats">
                    {objectSize} • {objectCount} objects
                  </span>
                </div>
                <div className="node-children">
                  {/* Render tables for SQL databases */}
                  {database.tables && Object.entries(database.tables).map(([tableName, table]) => (
                    <div 
                      key={tableName} 
                      className={`table-node ${selectedTable?.table === tableName ? 'selected' : ''}`}
                      onClick={() => handleTableSelect(dbName, tableName, table)}
                    >
                      <div className="table-name">{tableName}</div>
                      <div className="table-stats">
                        <span className="row-count">{table.rowCount.toLocaleString()} rows</span>
                        <span className="table-size">{table.size}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Render collections for NoSQL databases */}
                  {database.collections && Object.entries(database.collections).map(([collectionName, collection]) => (
                    <div 
                      key={collectionName} 
                      className={`table-node ${selectedTable?.table === collectionName ? 'selected' : ''}`}
                      onClick={() => handleTableSelect(dbName, collectionName, collection)}
                    >
                      <div className="table-name">{collectionName}</div>
                      <div className="table-stats">
                        <span className="row-count">{collection.rowCount.toLocaleString()} docs</span>
                        <span className="table-size">{collection.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const OverviewTab = () => {
    if (!selectedTable) {
      return (
        <div className="tab-content empty-state">
          <h3>Select a Table or Collection</h3>
          <p>Choose a table from the connection tree to view its structure, statistics, and sample data.</p>
        </div>
      );
    }

    return (
      <div className="tab-content">
        <div className="overview-header">
          <div className="table-info">
            <h2>{selectedTable.table}</h2>
            <div className="table-meta">
              <span className="schema-name">{selectedTable.schema || 'default'}</span>
              <span className="table-type">{selectedTable.tableType || 'TABLE'}</span>
              <span className="connection-name">{selectedTable.connection.name}</span>
            </div>
          </div>
          <div className="table-stats">
            <div className="stat">
              <label>Rows</label>
              <span>{selectedTable.rowCount?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="stat">
              <label>Size</label>
              <span>{selectedTable.size || 'N/A'}</span>
            </div>
            {selectedTable.avgDocSize && (
              <div className="stat">
                <label>Avg Doc Size</label>
                <span>{selectedTable.avgDocSize}</span>
              </div>
            )}
            {selectedTable.indexes && (
              <div className="stat">
                <label>Indexes</label>
                <span>{selectedTable.indexes.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className="schema-section">
          <h3>Schema Definition</h3>
          <div className="schema-table">
            <div className="schema-header">
              <div className="schema-col">Column Name</div>
              <div className="schema-col">Data Type</div>
              <div className="schema-col">Nullable</div>
              <div className="schema-col">Default</div>
            </div>
            {selectedTable.fields?.map((field, index) => (
              <div key={field} className="schema-row">
                <div className="schema-col field-name">{field}</div>
                <div className="schema-col">VARCHAR(255)</div>
                <div className="schema-col">YES</div>
                <div className="schema-col">NULL</div>
              </div>
            )) || (
              <div className="schema-row">
                <div className="schema-col" colSpan="4">No schema information available</div>
              </div>
            )}
          </div>
        </div>

        {selectedTable.indexes && selectedTable.indexes.length > 0 && (
          <div className="indexes-section">
            <h3>Indexes</h3>
            <div className="indexes-list">
              {selectedTable.indexes.map((index, idx) => (
                <div key={idx} className="index-item">
                  {index}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sample-data-section">
          <div className="section-header">
            <h3>Sample Data</h3>
            <div className="section-actions">
              <button className="btn-secondary">Export Sample</button>
              <button className="btn-secondary">View Full Data</button>
            </div>
          </div>
          <div className="sample-data">
            <DataTable 
              columns={selectedTable.fields?.slice(0, 6) || []} 
              data={Array.from({ length: 10 }, (_, i) => 
                (selectedTable.fields?.slice(0, 6) || []).reduce((acc, field) => {
                  acc[field] = `Sample ${field} ${i + 1}`;
                  return acc;
                }, { id: i + 1 })
              )} 
            />
          </div>
        </div>
      </div>
    );
  };

  const QueryBuilderTab = () => {
    const [query, setQuery] = useState('');

    const handleRunQuery = () => {
      executeQuery(query || currentQuery);
    };

    const handleSaveQuery = () => {
      if (query.trim()) {
        // Implement save query logic
        console.log('Saving query:', query);
      }
    };

    return (
      <div className="tab-content">
        <div className="query-header">
          <h2>Query Builder</h2>
          <div className="query-actions">
            <button className="btn-secondary" onClick={handleSaveQuery}>Save Query</button>
            <button className="btn-secondary">Load Template</button>
            <button 
              className="btn-primary" 
              onClick={handleRunQuery}
              disabled={!query.trim() && !currentQuery.trim()}
            >
              Execute Query
            </button>
          </div>
        </div>

        <div className="query-editor-section">
          <div className="editor-header">
            <h4>SQL Editor</h4>
            <div className="editor-info">
              Connected to: {activeConnection?.name}
            </div>
          </div>
          <textarea
            value={query || currentQuery}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedTable 
                ? `SELECT * FROM ${selectedTable.table} WHERE ...`
                : "SELECT * FROM your_table WHERE ..."
            }
            className="query-input"
          />
          <div className="editor-actions">
            <button 
              className="btn-secondary"
              onClick={() => setQuery('')}
            >
              Clear
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setQuery(`SELECT * FROM ${selectedTable?.table || 'table_name'} LIMIT 100`)}
            >
              Sample Query
            </button>
          </div>
        </div>

        {queryHistory.length > 0 && (
          <div className="query-history">
            <h3>Recent Queries</h3>
            <div className="history-list">
              {queryHistory.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="history-item"
                  onClick={() => setQuery(item.query)}
                >
                  <div className="query-text">{item.query}</div>
                  <div className="query-meta">
                    <span>{item.connection}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const VisualizationTab = () => {
    const [chartData, setChartData] = useState(null);

    const generateChart = () => {
      if (!visualizationConfig.xAxis || !visualizationConfig.yAxis) return;

      const mockData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: visualizationConfig.yAxis,
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: 'rgba(0, 102, 204, 0.6)',
            borderColor: 'rgba(0, 102, 204, 1)',
            borderWidth: 1
          }
        ]
      };
      setChartData(mockData);
    };

    return (
      <div className="tab-content">
        <div className="viz-header">
          <h2>Data Visualization</h2>
          <div className="viz-actions">
            <button className="btn-secondary">Save Chart</button>
            <button className="btn-primary" onClick={generateChart}>
              Generate Chart
            </button>
          </div>
        </div>

        <div className="viz-configuration">
          <div className="config-panel">
            <h3>Chart Configuration</h3>
            
            <div className="config-group">
              <label>Chart Type</label>
              <select 
                className="control-select"
                value={visualizationConfig.chartType}
                onChange={(e) => setVisualizationConfig(prev => ({
                  ...prev,
                  chartType: e.target.value
                }))}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="area">Area Chart</option>
              </select>
            </div>

            <div className="config-group">
              <label>X-Axis Field</label>
              <select 
                className="control-select"
                value={visualizationConfig.xAxis}
                onChange={(e) => setVisualizationConfig(prev => ({
                  ...prev,
                  xAxis: e.target.value
                }))}
              >
                <option value="">Select field</option>
                {selectedTable?.fields?.map(field => (
                  <option key={field} value={field}>{field}</option>
                )) || <option disabled>No fields available</option>}
              </select>
            </div>

            <div className="config-group">
              <label>Y-Axis Field</label>
              <select 
                className="control-select"
                value={visualizationConfig.yAxis}
                onChange={(e) => setVisualizationConfig(prev => ({
                  ...prev,
                  yAxis: e.target.value
                }))}
              >
                <option value="">Select field</option>
                {selectedTable?.fields?.map(field => (
                  <option key={field} value={field}>{field}</option>
                )) || <option disabled>No fields available</option>}
              </select>
            </div>

            <div className="config-group">
              <label>Group By</label>
              <select 
                className="control-select"
                value={visualizationConfig.groupBy}
                onChange={(e) => setVisualizationConfig(prev => ({
                  ...prev,
                  groupBy: e.target.value
                }))}
              >
                <option value="">No grouping</option>
                {selectedTable?.fields?.map(field => (
                  <option key={field} value={field}>{field}</option>
                )) || <option disabled>No fields available</option>}
              </select>
            </div>
          </div>

          <div className="viz-preview">
            <div className="preview-header">
              <h3>Chart Preview</h3>
              <div className="preview-actions">
                <button className="btn-secondary">Export PNG</button>
                <button className="btn-secondary">Export Data</button>
              </div>
            </div>
            <div className="chart-container">
              {chartData ? (
                <div className="chart-placeholder generated">
                  <div className="chart-mock">
                    <div className="mock-bar-chart">
                      {chartData.datasets[0].data.map((value, index) => (
                        <div 
                          key={index}
                          className="mock-bar"
                          style={{ height: `${value}%` }}
                        >
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mock-labels">
                      {chartData.labels.map((label, index) => (
                        <div key={index} className="mock-label">{label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-info">
                    <div className="chart-title">
                      {visualizationConfig.yAxis} by {visualizationConfig.xAxis}
                    </div>
                    <div className="chart-stats">
                      {chartData.datasets[0].data.length} data points
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>Configure chart settings and generate to preview visualization</p>
                  <ul className="placeholder-features">
                    <li>Select X and Y axis fields</li>
                    <li>Choose appropriate chart type</li>
                    <li>Apply grouping if needed</li>
                    <li>Generate chart to visualize</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DataProfilingTab = () => {
    if (!selectedTable) {
      return (
        <div className="tab-content empty-state">
          <h3>Select a Table for Profiling</h3>
          <p>Choose a table to view detailed data quality metrics, statistics, and profiling information.</p>
        </div>
      );
    }

    return (
      <div className="tab-content">
        <div className="profiling-header">
          <h2>Data Profiling - {selectedTable.table}</h2>
          <div className="profiling-actions">
            <button className="btn-primary">Generate Report</button>
            <button className="btn-secondary">Export Profile</button>
          </div>
        </div>

        <div className="profiling-overview">
          <div className="profile-stats">
            <div className="profile-stat">
              <label>Total Records</label>
              <span>{selectedTable.rowCount?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="profile-stat">
              <label>Data Size</label>
              <span>{selectedTable.size || 'N/A'}</span>
            </div>
            <div className="profile-stat">
              <label>Columns</label>
              <span>{selectedTable.fields?.length || 0}</span>
            </div>
            <div className="profile-stat">
              <label>Data Quality Score</label>
              <span>94%</span>
            </div>
          </div>
        </div>

        <div className="column-profiles">
          <h3>Column Analysis</h3>
          <div className="profiles-grid">
            {selectedTable.fields?.slice(0, 6).map((field, index) => (
              <div key={field} className="column-profile">
                <div className="column-header">
                  <h4>{field}</h4>
                  <span className="data-type">VARCHAR</span>
                </div>
                <div className="column-stats">
                  <div className="stat-row">
                    <span>Completeness</span>
                    <span>98%</span>
                  </div>
                  <div className="stat-row">
                    <span>Distinct Values</span>
                    <span>{(Math.random() * 1000).toFixed(0)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Most Frequent</span>
                    <span>Sample Value</span>
                  </div>
                  <div className="stat-row">
                    <span>Max Length</span>
                    <span>64 chars</span>
                  </div>
                </div>
              </div>
            )) || (
              <div className="no-columns">
                <p>No column information available</p>
              </div>
            )}
          </div>
        </div>

        <div className="quality-metrics">
          <h3>Data Quality Metrics</h3>
          <div className="metrics-grid">
            <div className="quality-metric">
              <label>Completeness</label>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '96%' }}></div>
              </div>
              <span>96%</span>
            </div>
            <div className="quality-metric">
              <label>Uniqueness</label>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '99%' }}></div>
              </div>
              <span>99%</span>
            </div>
            <div className="quality-metric">
              <label>Consistency</label>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '92%' }}></div>
              </div>
              <span>92%</span>
            </div>
            <div className="quality-metric">
              <label>Validity</label>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '98%' }}></div>
              </div>
              <span>98%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DataTable = ({ columns, data }) => {
    if (!columns || columns.length === 0) {
      return (
        <div className="data-table empty">
          <div className="table-header">
            <div className="table-col">No columns available</div>
          </div>
        </div>
      );
    }

    return (
      <div className="data-table">
        <div className="table-header">
          {columns.map(column => (
            <div key={column} className="table-col">{column}</div>
          ))}
        </div>
        <div className="table-body">
          {data.map((row, index) => (
            <div key={index} className="table-row">
              {columns.map(column => (
                <div key={column} className="table-col">
                  {row[column]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="data-explore-container">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="nav-content">
            <div className="nav-left">
              <div className="nav-logo">DataConnect</div>
              <div className="nav-links">
                <a className="nav-link">Data Sources</a>
                <a className="nav-link active">Explore</a>
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
                <h1>Data Explorer</h1>
                <p>Explore, query, and analyze data across all connected sources</p>
              </div>
              <div className="header-actions">
                <div className="connection-selector">
                  <select 
                    className="control-select"
                    value={activeConnection?.id}
                    onChange={(e) => setActiveConnection(connectionsData[e.target.value])}
                  >
                    {Object.entries(connectionsData).map(([key, connection]) => (
                      <option key={key} value={key}>{connection.name}</option>
                    ))}
                  </select>
                </div>
                <button className="btn-secondary">Refresh Schema</button>
                <button className="btn-primary">New Query</button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-content">
              <input
                type="text"
                placeholder="Search tables, columns, or data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div className="search-filters">
                <button className="btn-secondary">Filter</button>
                <button className="btn-secondary">Advanced Search</button>
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="workspace">
            {/* Sidebar */}
            <div className="sidebar">
              <ConnectionTree connection={activeConnection} />
              
              <div className="sidebar-section">
                <h3>Favorites</h3>
                <div className="favorites-list">
                  <div className="favorite-item">users</div>
                  <div className="favorite-item">orders</div>
                  <div className="favorite-item">events</div>
                  <div className="favorite-item">page_views</div>
                </div>
              </div>

              <div className="sidebar-section">
                <h3>Recent Queries</h3>
                <div className="recent-list">
                  {queryHistory.slice(0, 3).map((item) => (
                    <div key={item.id} className="recent-item">
                      {item.query.substring(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="content-area">
              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button 
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab-button ${activeTab === 'query' ? 'active' : ''}`}
                  onClick={() => setActiveTab('query')}
                >
                  Query Builder
                </button>
                <button 
                  className={`tab-button ${activeTab === 'visualization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('visualization')}
                >
                  Visualization
                </button>
                <button 
                  className={`tab-button ${activeTab === 'profiling' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profiling')}
                >
                  Data Profiling
                </button>
                {queryResults && (
                  <button 
                    className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
                    onClick={() => setActiveTab('results')}
                  >
                    Results ({queryResults.rowCount})
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="tab-container">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'query' && <QueryBuilderTab />}
                {activeTab === 'visualization' && <VisualizationTab />}
                {activeTab === 'profiling' && <DataProfilingTab />}
                {activeTab === 'results' && queryResults && (
                  <div className="tab-content">
                    <div className="results-header">
                      <div className="results-info">
                        <h2>Query Results</h2>
                        <div className="results-stats">
                          <span>{queryResults.rowCount} rows</span>
                          <span>{queryResults.executionTime}</span>
                          <span>{queryResults.size}</span>
                        </div>
                      </div>
                      <div className="results-actions">
                        <button className="btn-secondary">Export CSV</button>
                        <button className="btn-secondary">Export JSON</button>
                        <button className="btn-primary">Save Results</button>
                      </div>
                    </div>
                    <DataTable columns={queryResults.columns} data={queryResults.data} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DataExplore;
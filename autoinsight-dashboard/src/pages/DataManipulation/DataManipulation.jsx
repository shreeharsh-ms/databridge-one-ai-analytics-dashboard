import React, { useState, useEffect } from 'react';
import './DataManipulation.css';

const DataManipulation = () => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [activePanel, setActivePanel] = useState('selection');
  const [joinData, setJoinData] = useState({ tables: [], joins: [] });
  const [transformationQuery, setTransformationQuery] = useState('');
  const [visualizationConfig, setVisualizationConfig] = useState({});
  const [operationHistory, setOperationHistory] = useState([]);
  const [availableConnections, setAvailableConnections] = useState({});
  const [statsData, setStatsData] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Mock connections data with multiple databases
  const connectionsData = {
    mongodb: {
      id: 'mongodb',
      name: 'MongoDB Production',
      type: 'mongodb',
      status: 'connected',
      databases: {
        'analytics': {
          collections: {
            'user_sessions': {
              fields: ['_id', 'userId', 'sessionStart', 'pageViews', 'deviceType'],
              rowCount: 1250000,
              sampleData: Array(5).fill().map((_, i) => ({
                _id: `session_${i}`,
                userId: `user_${i}`,
                sessionStart: new Date().toISOString(),
                pageViews: Math.floor(Math.random() * 50),
                deviceType: ['mobile', 'desktop', 'tablet'][i % 3]
              }))
            },
            'events': {
              fields: ['_id', 'eventType', 'userId', 'timestamp', 'properties'],
              rowCount: 4500000,
              sampleData: Array(5).fill().map((_, i) => ({
                _id: `event_${i}`,
                eventType: ['click', 'view', 'purchase'][i % 3],
                userId: `user_${i}`,
                timestamp: new Date().toISOString(),
                properties: { page: `/page${i}`, duration: Math.random() * 100 }
              }))
            }
          }
        },
        'operations': {
          collections: {
            'performance_logs': {
              fields: ['_id', 'service', 'responseTime', 'timestamp', 'status'],
              rowCount: 890000,
              sampleData: Array(5).fill().map((_, i) => ({
                _id: `log_${i}`,
                service: ['api', 'web', 'database'][i % 3],
                responseTime: Math.random() * 500,
                timestamp: new Date().toISOString(),
                status: ['success', 'error'][i % 2]
              }))
            }
          }
        }
      }
    },
    postgresql: {
      id: 'postgresql',
      name: 'PostgreSQL Main',
      type: 'postgresql',
      status: 'connected',
      databases: {
        'production': {
          tables: {
            'users': {
              fields: ['id', 'email', 'created_at', 'status', 'country', 'last_login'],
              rowCount: 50000,
              sampleData: Array(5).fill().map((_, i) => ({
                id: i + 1,
                email: `user${i}@company.com`,
                created_at: new Date().toISOString(),
                status: ['active', 'inactive'][i % 2],
                country: ['US', 'UK', 'CA'][i % 3],
                last_login: new Date().toISOString()
              }))
            },
            'orders': {
              fields: ['id', 'user_id', 'amount', 'status', 'created_at', 'currency'],
              rowCount: 250000,
              sampleData: Array(5).fill().map((_, i) => ({
                id: i + 1,
                user_id: i + 1,
                amount: (Math.random() * 1000).toFixed(2),
                status: ['pending', 'completed', 'cancelled'][i % 3],
                created_at: new Date().toISOString(),
                currency: 'USD'
              }))
            },
            'products': {
              fields: ['id', 'name', 'price', 'category', 'in_stock'],
              rowCount: 1500,
              sampleData: Array(5).fill().map((_, i) => ({
                id: i + 1,
                name: `Product ${i}`,
                price: (Math.random() * 500).toFixed(2),
                category: ['electronics', 'clothing', 'home'][i % 3],
                in_stock: i % 2 === 0
              }))
            }
          }
        }
      }
    },
    oracle: {
      id: 'oracle',
      name: 'Oracle ERP',
      type: 'oracle',
      status: 'connected',
      databases: {
        'erp_system': {
          tables: {
            'customers': {
              fields: ['CUSTOMER_ID', 'COMPANY_NAME', 'COUNTRY', 'INDUSTRY', 'EMPLOYEES'],
              rowCount: 15000,
              sampleData: Array(5).fill().map((_, i) => ({
                CUSTOMER_ID: i + 1,
                COMPANY_NAME: `Company ${i}`,
                COUNTRY: ['US', 'UK', 'DE', 'FR'][i % 4],
                INDUSTRY: ['tech', 'manufacturing', 'retail'][i % 3],
                EMPLOYEES: Math.floor(Math.random() * 10000)
              }))
            },
            'inventory': {
              fields: ['PRODUCT_ID', 'WAREHOUSE_ID', 'QUANTITY', 'LAST_RESTOCK'],
              rowCount: 50000,
              sampleData: Array(5).fill().map((_, i) => ({
                PRODUCT_ID: i + 1,
                WAREHOUSE_ID: ['WH1', 'WH2', 'WH3'][i % 3],
                QUANTITY: Math.floor(Math.random() * 1000),
                LAST_RESTOCK: new Date().toISOString()
              }))
            }
          }
        }
      }
    },
    mysql: {
      id: 'mysql',
      name: 'MySQL Analytics',
      type: 'mysql',
      status: 'connected',
      databases: {
        'web_analytics': {
          tables: {
            'page_views': {
              fields: ['view_id', 'user_id', 'page_url', 'view_duration', 'timestamp'],
              rowCount: 1500000,
              sampleData: Array(5).fill().map((_, i) => ({
                view_id: i + 1,
                user_id: `user_${i}`,
                page_url: `/products/${i}`,
                view_duration: Math.random() * 300,
                timestamp: new Date().toISOString()
              }))
            }
          }
        }
      }
    },
    csv: {
      id: 'csv',
      name: 'CSV Files',
      type: 'csv',
      status: 'connected',
      databases: {
        'uploads': {
          tables: {
            'sales_data': {
              fields: ['Region', 'Product', 'Sales', 'Date', 'Salesperson'],
              rowCount: 15000,
              sampleData: Array(5).fill().map((_, i) => ({
                Region: ['North', 'South', 'East', 'West'][i % 4],
                Product: `Product ${i}`,
                Sales: Math.floor(Math.random() * 10000),
                Date: new Date().toISOString().split('T')[0],
                Salesperson: `Salesperson ${i}`
              }))
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    setAvailableConnections(connectionsData);
    generateStatsData();
  }, [selectedTables]);

  const generateStatsData = () => {
    if (selectedTables.length === 0) {
      setStatsData(null);
      return;
    }
    
    const mockStats = selectedTables.map(table => ({
      table: table.table,
      connection: table.connectionName,
      stats: {
        rowCount: table.rowCount,
        columnCount: table.fields.length,
        completeness: Math.floor(Math.random() * 20) + 80,
        uniqueness: Math.floor(Math.random() * 15) + 85,
        consistency: Math.floor(Math.random() * 15) + 85
      },
      columnStats: table.fields.map(field => ({
        name: field,
        type: ['VARCHAR', 'INT', 'DATE', 'BOOLEAN'][Math.floor(Math.random() * 4)],
        nullCount: Math.floor(Math.random() * 100),
        uniqueCount: Math.floor(Math.random() * 1000),
        min: Math.floor(Math.random() * 100),
        max: Math.floor(Math.random() * 1000),
        mean: Math.floor(Math.random() * 500)
      }))
    }));
    
    setStatsData(mockStats);
  };

  const generateChartData = () => {
    if (selectedTables.length === 0) {
      setChartData(null);
      return;
    }
    
    const mockChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: selectedTables.slice(0, 2).map((table, index) => ({
        label: table.table,
        data: Array(6).fill().map(() => Math.floor(Math.random() * 1000)),
        backgroundColor: index === 0 ? 'rgba(0, 102, 204, 0.6)' : 'rgba(255, 140, 0, 0.6)',
        borderColor: index === 0 ? 'rgba(0, 102, 204, 1)' : 'rgba(255, 140, 0, 1)',
        borderWidth: 1
      }))
    };
    
    setChartData(mockChartData);
  };

  const isPanelEnabled = (panel) => {
    switch (panel) {
      case 'join':
        return selectedTables.length >= 2;
      case 'transform':
        return selectedTables.length >= 1;
      case 'stats':
        return selectedTables.length >= 1;
      case 'visualize':
        return selectedTables.length >= 1;
      default:
        return true;
    }
  };

  const handleConnectionSelect = (connectionId) => {
    const connection = connectionsData[connectionId];
    setSelectedConnection(connection);
    setSelectedTables([]);
    addToHistory('Connection Selected', `Connected to ${connection.name}`);
  };

  const handleTableSelect = (database, tableName, tableData, connection) => {
    const tableKey = `${connection.id}.${database}.${tableName}`;
    const isSelected = selectedTables.some(t => t.key === tableKey);
    
    if (isSelected) {
      setSelectedTables(selectedTables.filter(t => t.key !== tableKey));
      addToHistory('Table Deselected', `Removed ${tableName} from selection`);
    } else {
      const newTable = {
        key: tableKey,
        connection: connection.id,
        connectionName: connection.name,
        database,
        table: tableName,
        ...tableData
      };
      setSelectedTables([...selectedTables, newTable]);
      addToHistory('Table Selected', `Added ${connection.name}.${database}.${tableName}`);
    }
  };

  const addToHistory = (operation, details) => {
    setOperationHistory(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      operation,
      details
    }, ...prev.slice(0, 49)]);
  };

  const ConnectionTree = ({ connection }) => {
    if (!connection) return null;

    return (
      <div className="connection-tree">
        <div className="tree-header">
          <div className="connection-info">
            <div className="connection-name">{connection.name}</div>
            <div className={`connection-status ${connection.status}`}>
              {connection.status.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="tree-content">
          {Object.entries(connection.databases).map(([dbName, database]) => (
            <div key={dbName} className="database-node">
              <div className="node-label">{dbName}</div>
              <div className="node-children">
                {database.tables && Object.entries(database.tables).map(([tableName, table]) => (
                  <TableNode 
                    key={tableName}
                    tableName={tableName}
                    table={table}
                    database={dbName}
                    connection={connection}
                    isSelected={selectedTables.some(t => 
                      t.connection === connection.id && 
                      t.database === dbName && 
                      t.table === tableName
                    )}
                    onSelect={handleTableSelect}
                  />
                ))}
                {database.collections && Object.entries(database.collections).map(([collectionName, collection]) => (
                  <TableNode 
                    key={collectionName}
                    tableName={collectionName}
                    table={collection}
                    database={dbName}
                    connection={connection}
                    isSelected={selectedTables.some(t => 
                      t.connection === connection.id && 
                      t.database === dbName && 
                      t.table === collectionName
                    )}
                    onSelect={handleTableSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TableNode = ({ tableName, table, database, connection, isSelected, onSelect }) => (
    <div 
      className={`table-node ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(database, tableName, table, connection)}
    >
      <div className="table-name">{tableName}</div>
      <div className="table-stats">
        <span className="row-count">{table.rowCount.toLocaleString()} rows</span>
        <span className="table-type">{table.fields.length} cols</span>
      </div>
    </div>
  );

  const SelectionPanel = () => (
    <div className="panel">
      <div className="panel-header">
        <h2>Data Source Selection</h2>
        <p>Select connections and tables from multiple databases to begin data manipulation</p>
      </div>
      
      <div className="selection-content">
        <div className="connection-selector">
          <label>Database Connection</label>
          <select 
            className="control-select"
            value={selectedConnection?.id || ''}
            onChange={(e) => handleConnectionSelect(e.target.value)}
          >
            <option value="">Select a connection</option>
            {Object.entries(connectionsData).map(([key, connection]) => (
              <option key={key} value={key}>{connection.name}</option>
            ))}
          </select>
        </div>

        <div className="connections-grid">
          {Object.entries(connectionsData).map(([key, connection]) => (
            <div key={key} className="connection-section">
              <div className="section-header">
                <h3>{connection.name}</h3>
                <div className={`connection-badge ${connection.status}`}>
                  {connection.type.toUpperCase()}
                </div>
              </div>
              <ConnectionTree connection={connection} />
            </div>
          ))}
        </div>

        {selectedTables.length > 0 && (
          <div className="selected-tables">
            <label>Selected Tables ({selectedTables.length})</label>
            <div className="selected-list">
              {selectedTables.map(table => (
                <div key={table.key} className="selected-item">
                  <div className="table-info">
                    <span className="table-path">{table.connectionName}.{table.database}.{table.table}</span>
                    <span className="table-meta">{table.rowCount.toLocaleString()} rows • {table.fields.length} columns</span>
                  </div>
                  <button 
                    className="btn-remove"
                    onClick={() => handleTableSelect(table.database, table.table, table, { id: table.connection })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const JoinPanel = () => {
    const isEnabled = isPanelEnabled('join');
    const [joinConfig, setJoinConfig] = useState({
      leftTable: '',
      rightTable: '',
      joinType: 'INNER',
      conditions: [{
        leftColumn: '',
        rightColumn: '',
        operator: '='
      }]
    });

    const handleAddJoinCondition = () => {
      setJoinConfig(prev => ({
        ...prev,
        conditions: [...prev.conditions, { leftColumn: '', rightColumn: '', operator: '=' }]
      }));
    };

    const handleJoinConditionChange = (index, field, value) => {
      setJoinConfig(prev => ({
        ...prev,
        conditions: prev.conditions.map((condition, i) => 
          i === index ? { ...condition, [field]: value } : condition
        )
      }));
    };

    const executeJoin = () => {
      if (!joinConfig.leftTable || !joinConfig.rightTable) {
        alert('Please select both tables to join');
        return;
      }

      const leftTable = selectedTables.find(t => t.key === joinConfig.leftTable);
      const rightTable = selectedTables.find(t => t.key === joinConfig.rightTable);
      
      if (!leftTable || !rightTable) {
        alert('Selected tables not found');
        return;
      }

      const joinDetails = {
        type: joinConfig.joinType,
        tables: [leftTable, rightTable],
        conditions: joinConfig.conditions,
        timestamp: new Date().toISOString()
      };

      addToHistory('Cross-DB Join Executed', 
        `${joinConfig.joinType} JOIN between ${leftTable.connectionName}.${leftTable.table} and ${rightTable.connectionName}.${rightTable.table}`
      );

      // Mock join result
      const mockResult = {
        columns: [...leftTable.fields.map(f => `${leftTable.table}.${f}`), ...rightTable.fields.map(f => `${rightTable.table}.${f}`)],
        data: Array(10).fill().map((_, i) => ({
          ...leftTable.sampleData[i % leftTable.sampleData.length],
          ...rightTable.sampleData[i % rightTable.sampleData.length]
        })),
        rowCount: Math.min(leftTable.rowCount, rightTable.rowCount),
        executionTime: '245ms'
      };

      setJoinData(prev => ({
        ...prev,
        lastJoin: joinDetails,
        result: mockResult
      }));
    };

    if (!isEnabled) {
      return (
        <div className="panel disabled">
          <div className="panel-header">
            <h2>Cross-Database Join</h2>
            <p>Select at least 2 tables from any databases to enable join operations</p>
          </div>
        </div>
      );
    }

    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Cross-Database Join</h2>
          <p>Combine data from multiple tables across different database systems</p>
        </div>
        
        <div className="join-interface">
          <div className="join-configuration">
            <div className="config-section">
              <label>Left Table</label>
              <select 
                className="control-select"
                value={joinConfig.leftTable}
                onChange={(e) => setJoinConfig(prev => ({ ...prev, leftTable: e.target.value }))}
              >
                <option value="">Select left table</option>
                {selectedTables.map(table => (
                  <option key={table.key} value={table.key}>
                    {table.connectionName}.{table.database}.{table.table}
                  </option>
                ))}
              </select>
            </div>

            <div className="config-section">
              <label>Right Table</label>
              <select 
                className="control-select"
                value={joinConfig.rightTable}
                onChange={(e) => setJoinConfig(prev => ({ ...prev, rightTable: e.target.value }))}
              >
                <option value="">Select right table</option>
                {selectedTables.map(table => (
                  <option key={table.key} value={table.key}>
                    {table.connectionName}.{table.database}.{table.table}
                  </option>
                ))}
              </select>
            </div>

            <div className="config-section">
              <label>Join Type</label>
              <select 
                className="control-select"
                value={joinConfig.joinType}
                onChange={(e) => setJoinConfig(prev => ({ ...prev, joinType: e.target.value }))}
              >
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT JOIN</option>
                <option value="RIGHT">RIGHT JOIN</option>
                <option value="FULL">FULL OUTER JOIN</option>
                <option value="CROSS">CROSS JOIN</option>
              </select>
            </div>

            <div className="config-section">
              <label>Join Conditions</label>
              <div className="join-conditions">
                {joinConfig.conditions.map((condition, index) => (
                  <div key={index} className="condition-row">
                    <select 
                      className="control-select"
                      value={condition.leftColumn}
                      onChange={(e) => handleJoinConditionChange(index, 'leftColumn', e.target.value)}
                    >
                      <option value="">Select left column</option>
                      {joinConfig.leftTable && selectedTables
                        .find(t => t.key === joinConfig.leftTable)
                        ?.fields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))
                      }
                    </select>
                    <select 
                      className="control-select operator-select"
                      value={condition.operator}
                      onChange={(e) => handleJoinConditionChange(index, 'operator', e.target.value)}
                    >
                      <option value="=">=</option>
                      <option value="!=">≠</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">≥</option>
                      <option value="<=">≤</option>
                    </select>
                    <select 
                      className="control-select"
                      value={condition.rightColumn}
                      onChange={(e) => handleJoinConditionChange(index, 'rightColumn', e.target.value)}
                    >
                      <option value="">Select right column</option>
                      {joinConfig.rightTable && selectedTables
                        .find(t => t.key === joinConfig.rightTable)
                        ?.fields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))
                      }
                    </select>
                    {joinConfig.conditions.length > 1 && (
                      <button 
                        className="btn-remove-condition"
                        onClick={() => setJoinConfig(prev => ({
                          ...prev,
                          conditions: prev.conditions.filter((_, i) => i !== index)
                        }))}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn-secondary" onClick={handleAddJoinCondition}>
                  Add Condition
                </button>
              </div>
            </div>

            <div className="config-actions">
              <button className="btn-primary" onClick={executeJoin}>
                Execute Join
              </button>
              <button className="btn-secondary" onClick={() => setJoinConfig({
                leftTable: '',
                rightTable: '',
                joinType: 'INNER',
                conditions: [{ leftColumn: '', rightColumn: '', operator: '=' }]
              })}>
                Reset
              </button>
            </div>
          </div>
          
          <div className="join-preview">
            <div className="preview-header">
              <h4>Join Preview</h4>
              {joinData.lastJoin && (
                <div className="join-info">
                  <span>{joinData.lastJoin.type} JOIN</span>
                  <span>{joinData.result?.rowCount.toLocaleString()} rows</span>
                  <span>{joinData.result?.executionTime}</span>
                </div>
              )}
            </div>
            
            <div className="preview-content">
              {joinData.result ? (
                <DataTable 
                  columns={joinData.result.columns} 
                  data={joinData.result.data} 
                />
              ) : (
                <div className="preview-placeholder">
                  <p>Configure join conditions and execute to see results</p>
                  <div className="placeholder-features">
                    <div>• Cross-database joins (MongoDB ↔ PostgreSQL ↔ Oracle)</div>
                    <div>• Multiple join conditions supported</div>
                    <div>• Real-time preview of joined data</div>
                    <div>• Type conversion handling</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TransformPanel = () => {
    const isEnabled = isPanelEnabled('transform');
    const [transformations, setTransformations] = useState([]);
    const [selectedTransformation, setSelectedTransformation] = useState('');
    const [transformConfig, setTransformConfig] = useState({});

    const transformationTypes = [
      { id: 'filter', name: 'Filter Data', description: 'Filter rows based on conditions' },
      { id: 'select', name: 'Select Columns', description: 'Choose which columns to include' },
      { id: 'aggregate', name: 'Aggregate', description: 'Group by and aggregate functions' },
      { id: 'join', name: 'Join Tables', description: 'Combine with other tables' },
      { id: 'sort', name: 'Sort Data', description: 'Order by specific columns' },
      { id: 'calculate', name: 'Calculated Columns', description: 'Create new computed columns' },
      { id: 'pivot', name: 'Pivot Data', description: 'Reshape data from long to wide format' },
      { id: 'clean', name: 'Data Cleaning', description: 'Handle missing values, duplicates' }
    ];

    const addTransformation = (type) => {
      const newTransformation = {
        id: Date.now(),
        type,
        name: transformationTypes.find(t => t.id === type)?.name,
        config: {},
        status: 'pending'
      };
      setTransformations(prev => [...prev, newTransformation]);
      setSelectedTransformation(newTransformation.id);
      addToHistory('Transformation Added', `Added ${newTransformation.name} to pipeline`);
    };

    const executeTransformations = () => {
      if (transformations.length === 0) {
        alert('No transformations to execute');
        return;
      }

      const updatedTransformations = transformations.map(t => ({
        ...t,
        status: 'completed',
        executedAt: new Date().toISOString()
      }));
      setTransformations(updatedTransformations);

      addToHistory('Transformations Executed', 
        `Executed ${transformations.length} transformations on ${selectedTables.length} tables`
      );

      // Mock transformation result
      const mockResult = {
        columns: selectedTables[0]?.fields || [],
        data: selectedTables[0]?.sampleData || [],
        transformations: transformations.length,
        rowCount: selectedTables.reduce((sum, table) => sum + table.rowCount, 0)
      };

      setTransformConfig(prev => ({ ...prev, lastResult: mockResult }));
    };

    if (!isEnabled) {
      return (
        <div className="panel disabled">
          <div className="panel-header">
            <h2>Data Transformation</h2>
            <p>Select at least one table to enable transformation operations</p>
          </div>
        </div>
      );
    }

    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Data Transformation Pipeline</h2>
          <p>Build and execute complex data transformation workflows</p>
        </div>
        
        <div className="transform-interface">
          <div className="transform-sidebar">
            <div className="sidebar-section">
              <h4>Transformation Types</h4>
              <div className="transformation-types">
                {transformationTypes.map(type => (
                  <div 
                    key={type.id}
                    className="transformation-type"
                    onClick={() => addTransformation(type.id)}
                  >
                    <div className="type-name">{type.name}</div>
                    <div className="type-description">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Transformation Pipeline</h4>
              <div className="pipeline-steps">
                {transformations.map((transformation, index) => (
                  <div 
                    key={transformation.id}
                    className={`pipeline-step ${selectedTransformation === transformation.id ? 'selected' : ''} ${transformation.status}`}
                    onClick={() => setSelectedTransformation(transformation.id)}
                  >
                    <div className="step-header">
                      <span className="step-number">{index + 1}</span>
                      <span className="step-name">{transformation.name}</span>
                      <span className={`step-status ${transformation.status}`}>
                        {transformation.status}
                      </span>
                    </div>
                    {transformation.executedAt && (
                      <div className="step-meta">
                        Executed: {new Date(transformation.executedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
                {transformations.length === 0 && (
                  <div className="empty-pipeline">
                    <p>No transformations added</p>
                    <p>Select transformation types from the left to build your pipeline</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pipeline-actions">
              <button 
                className="btn-primary" 
                onClick={executeTransformations}
                disabled={transformations.length === 0}
              >
                Execute Pipeline
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setTransformations([])}
                disabled={transformations.length === 0}
              >
                Clear Pipeline
              </button>
            </div>
          </div>
          
          <div className="transform-main">
            <div className="transform-config">
              <div className="config-header">
                <h4>
                  {selectedTransformation 
                    ? `Configure ${transformations.find(t => t.id === selectedTransformation)?.name}`
                    : 'Transformation Configuration'
                  }
                </h4>
                {selectedTransformation && (
                  <button 
                    className="btn-secondary"
                    onClick={() => setTransformations(prev => 
                      prev.filter(t => t.id !== selectedTransformation)
                    )}
                  >
                    Remove Transformation
                  </button>
                )}
              </div>

              <div className="config-content">
                {selectedTransformation ? (
                  <div className="transformation-config">
                    <div className="config-section">
                      <label>Source Tables</label>
                      <div className="selected-tables-list">
                        {selectedTables.map(table => (
                          <div key={table.key} className="selected-table-item">
                            <span>{table.connectionName}.{table.table}</span>
                            <span>{table.rowCount.toLocaleString()} rows</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="config-section">
                      <label>Configuration</label>
                      <div className="config-options">
                        <div className="config-option">
                          <label>Transformation Parameters</label>
                          <textarea 
                            className="config-input"
                            placeholder="Enter transformation parameters..."
                            rows={4}
                          />
                        </div>
                        <div className="config-option">
                          <label>Output Table Name</label>
                          <input 
                            type="text" 
                            className="config-input"
                            placeholder="transformed_results"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="config-section">
                      <label>Preview SQL</label>
                      <div className="sql-preview">
                        {`-- ${transformations.find(t => t.id === selectedTransformation)?.name} Transformation\n`}
                        {`-- Applied to: ${selectedTables.map(t => t.table).join(', ')}\n`}
                        {`SELECT * FROM source_data\nWHERE transformation_conditions;`}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-selection">
                    <p>Select a transformation from the pipeline to configure it</p>
                    <p>Or add new transformations from the left panel</p>
                  </div>
                )}
              </div>
            </div>

            <div className="transform-preview">
              <div className="preview-header">
                <h4>Transformation Preview</h4>
                {transformConfig.lastResult && (
                  <div className="preview-stats">
                    <span>{transformConfig.lastResult.transformations} transformations</span>
                    <span>{transformConfig.lastResult.rowCount.toLocaleString()} rows</span>
                  </div>
                )}
              </div>
              <div className="preview-content">
                {transformConfig.lastResult ? (
                  <DataTable 
                    columns={transformConfig.lastResult.columns} 
                    data={transformConfig.lastResult.data} 
                  />
                ) : (
                  <div className="preview-placeholder">
                    <p>Execute transformations to see results</p>
                    <div className="placeholder-features">
                      <div>• Real-time transformation preview</div>
                      <div>• Multi-step pipeline execution</div>
                      <div>• Cross-database transformations</div>
                      <div>• Data quality validation</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatsPanel = () => {
    const isEnabled = isPanelEnabled('stats');
    
    if (!isEnabled) {
      return (
        <div className="panel disabled">
          <div className="panel-header">
            <h2>Data Statistics & Profiling</h2>
            <p>Select at least one table to enable data profiling and statistics</p>
          </div>
        </div>
      );
    }

    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Data Statistics & Profiling</h2>
          <p>Comprehensive analysis of data quality, statistics, and profiling information</p>
        </div>
        
        <div className="stats-interface">
          <div className="overview-stats">
            <h3>Dataset Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <label>Total Tables</label>
                <span>{selectedTables.length}</span>
              </div>
              <div className="stat-card">
                <label>Total Rows</label>
                <span>{selectedTables.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()}</span>
              </div>
              <div className="stat-card">
                <label>Total Columns</label>
                <span>{selectedTables.reduce((sum, table) => sum + table.fields.length, 0)}</span>
              </div>
              <div className="stat-card">
                <label>Database Types</label>
                <span>{[...new Set(selectedTables.map(t => t.connectionName))].length}</span>
              </div>
            </div>
          </div>

          <div className="data-quality">
            <h3>Data Quality Metrics</h3>
            <div className="quality-metrics">
              {statsData && statsData.map((tableStats, index) => (
                <div key={index} className="quality-table">
                  <h4>{tableStats.connection}.{tableStats.table}</h4>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <label>Completeness</label>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill" 
                          style={{ width: `${tableStats.stats.completeness}%` }}
                        ></div>
                      </div>
                      <span>{tableStats.stats.completeness}%</span>
                    </div>
                    <div className="metric-item">
                      <label>Uniqueness</label>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill" 
                          style={{ width: `${tableStats.stats.uniqueness}%` }}
                        ></div>
                      </div>
                      <span>{tableStats.stats.uniqueness}%</span>
                    </div>
                    <div className="metric-item">
                      <label>Consistency</label>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill" 
                          style={{ width: `${tableStats.stats.consistency}%` }}
                        ></div>
                      </div>
                      <span>{tableStats.stats.consistency}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="column-analysis">
            <h3>Column-Level Analysis</h3>
            <div className="analysis-tabs">
              {statsData && statsData.map((tableStats, tableIndex) => (
                <div key={tableIndex} className="analysis-tab">
                  <h4>{tableStats.table} Columns</h4>
                  <div className="columns-grid">
                    {tableStats.columnStats.map((column, colIndex) => (
                      <div key={colIndex} className="column-card">
                        <div className="column-header">
                          <span className="column-name">{column.name}</span>
                          <span className="data-type">{column.type}</span>
                        </div>
                        <div className="column-stats">
                          <div className="stat-row">
                            <span>Null Values</span>
                            <span>{column.nullCount}</span>
                          </div>
                          <div className="stat-row">
                            <span>Unique Values</span>
                            <span>{column.uniqueCount}</span>
                          </div>
                          {column.type === 'INT' && (
                            <>
                              <div className="stat-row">
                                <span>Min Value</span>
                                <span>{column.min}</span>
                              </div>
                              <div className="stat-row">
                                <span>Max Value</span>
                                <span>{column.max}</span>
                              </div>
                              <div className="stat-row">
                                <span>Mean</span>
                                <span>{column.mean}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="data-profiling">
            <h3>Data Profiling Report</h3>
            <div className="profiling-report">
              <div className="report-section">
                <h4>Data Quality Summary</h4>
                <div className="summary-stats">
                  <div className="summary-item">
                    <label>Overall Quality Score</label>
                    <span className="score">92%</span>
                  </div>
                  <div className="summary-item">
                    <label>Issues Found</label>
                    <span className="issues">12</span>
                  </div>
                  <div className="summary-item">
                    <label>Recommendations</label>
                    <span className="recommendations">8</span>
                  </div>
                </div>
              </div>
              
              <div className="report-section">
                <h4>Data Issues</h4>
                <div className="issues-list">
                  <div className="issue-item warning">
                    <span>Missing values in user_sessions.deviceType</span>
                    <span>245 records affected</span>
                  </div>
                  <div className="issue-item warning">
                    <span>Duplicate records in events collection</span>
                    <span>1,245 records affected</span>
                  </div>
                  <div className="issue-item error">
                    <span>Data type mismatch in orders.amount</span>
                    <span>56 records affected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VisualizePanel = () => {
    const isEnabled = isPanelEnabled('visualize');
    const [chartConfig, setChartConfig] = useState({
      chartType: 'bar',
      xAxis: '',
      yAxis: '',
      groupBy: '',
      title: ''
    });

    // useEffect(() => {
    //   if (selectedTables.length > 0) {
    //     generateChartData();
    //   }
    // }, [selectedTables]);

const handleGenerateChart = () => {
  if (!chartConfig.xAxis || !chartConfig.yAxis) {
    alert('Please select both X and Y axis columns');
    return;
  }
  generateChartData(); // Only generate when explicitly called
  addToHistory('Chart Generated', 
    `${chartConfig.chartType} chart: ${chartConfig.yAxis} vs ${chartConfig.xAxis}`
  );
};

    if (!isEnabled) {
      return (
        <div className="panel disabled">
          <div className="panel-header">
            <h2>Data Visualization</h2>
            <p>Select at least one table to enable data visualization</p>
          </div>
        </div>
      );
    }

    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Data Visualization</h2>
          <p>Create interactive charts and visualizations from your data</p>
        </div>
        
        <div className="visualize-interface">
          <div className="chart-configuration">
            <div className="config-section">
              <h4>Chart Configuration</h4>
              
              <div className="config-group">
                <label>Chart Type</label>
                <select 
                  className="control-select"
                  value={chartConfig.chartType}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, chartType: e.target.value }))}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                  <option value="heatmap">Heatmap</option>
                </select>
              </div>

              <div className="config-group">
                <label>X-Axis Column</label>
                <select 
                  className="control-select"
                  value={chartConfig.xAxis}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, xAxis: e.target.value }))}
                >
                  <option value="">Select column</option>
                  {selectedTables.flatMap(table => 
                    table.fields.map(field => (
                      <option key={`${table.key}.${field}`} value={field}>
                        {table.table}.{field}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="config-group">
                <label>Y-Axis Column</label>
                <select 
                  className="control-select"
                  value={chartConfig.yAxis}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, yAxis: e.target.value }))}
                >
                  <option value="">Select column</option>
                  {selectedTables.flatMap(table => 
                    table.fields.map(field => (
                      <option key={`${table.key}.${field}`} value={field}>
                        {table.table}.{field}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="config-group">
                <label>Group By (Optional)</label>
                <select 
                  className="control-select"
                  value={chartConfig.groupBy}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                >
                  <option value="">No grouping</option>
                  {selectedTables.flatMap(table => 
                    table.fields.map(field => (
                      <option key={`${table.key}.${field}`} value={field}>
                        {table.table}.{field}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="config-group">
                <label>Chart Title</label>
                <input 
                  type="text"
                  className="control-input"
                  placeholder="Enter chart title..."
                  value={chartConfig.title}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="config-actions">
                <button className="btn-primary" onClick={handleGenerateChart}>
                  Generate Chart
                </button>
                <button className="btn-secondary">Save Chart</button>
                <button className="btn-secondary">Export as PNG</button>
              </div>
            </div>

            <div className="data-preview">
              <h4>Data Preview</h4>
              {selectedTables[0]?.sampleData && (
                <DataTable 
                  columns={selectedTables[0].fields.slice(0, 4)} 
                  data={selectedTables[0].sampleData} 
                />
              )}
            </div>
          </div>

          <div className="chart-preview">
            <div className="preview-header">
              <h4>
                {chartConfig.title || `${chartConfig.chartType.charAt(0).toUpperCase() + chartConfig.chartType.slice(1)} Chart`}
              </h4>
              <div className="chart-actions">
                <button className="btn-secondary">Refresh</button>
                <button className="btn-secondary">Fullscreen</button>
              </div>
            </div>
            
            <div className="chart-container">
              {chartData ? (
                <div className="chart-rendered">
                  <div className="chart-mock">
                    <div className="mock-chart-area">
                      <div className="mock-y-axis">
                        <span>Values</span>
                      </div>
                      <div className="mock-chart-bars">
                        {chartData.labels.map((label, index) => (
                          <div key={index} className="mock-bar-group">
                            {chartData.datasets.map((dataset, dsIndex) => (
                              <div 
                                key={dsIndex}
                                className="mock-bar"
                                style={{ 
                                  height: `${dataset.data[index] / 10}%`,
                                  backgroundColor: dataset.backgroundColor
                                }}
                                title={`${dataset.label}: ${dataset.data[index]}`}
                              >
                                <span className="bar-value">{dataset.data[index]}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="mock-x-axis">
                        {chartData.labels.map((label, index) => (
                          <div key={index} className="mock-label">{label}</div>
                        ))}
                      </div>
                    </div>
                    <div className="chart-legend">
                      {chartData.datasets.map((dataset, index) => (
                        <div key={index} className="legend-item">
                          <div 
                            className="legend-color"
                            style={{ backgroundColor: dataset.backgroundColor }}
                          ></div>
                          <span>{dataset.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-info">
                    <div className="chart-stats">
                      <span>{chartData.datasets.length} datasets</span>
                      <span>{chartData.labels.length} data points</span>
                      <span>Cross-database visualization</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>Configure chart settings and generate to visualize your data</p>
                  <div className="placeholder-features">
                    <div>• Multiple chart types supported</div>
                    <div>• Cross-database data visualization</div>
                    <div>• Interactive filtering and drill-down</div>
                    <div>• Real-time data updates</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HistoryPanel = () => (
    <div className="panel">
      <div className="panel-header">
        <h2>Operation History</h2>
        <p>Complete audit trail of all data manipulation operations</p>
      </div>
      
      <div className="history-interface">
        <div className="history-summary">
          <div className="summary-stats">
            <div className="summary-item">
              <label>Total Operations</label>
              <span>{operationHistory.length}</span>
            </div>
            <div className="summary-item">
              <label>Today's Operations</label>
              <span>{operationHistory.filter(op => 
                new Date(op.timestamp).toDateString() === new Date().toDateString()
              ).length}</span>
            </div>
            <div className="summary-item">
              <label>Last Operation</label>
              <span>{operationHistory[0] ? new Date(operationHistory[0].timestamp).toLocaleTimeString() : 'None'}</span>
            </div>
          </div>
        </div>

        <div className="history-list">
          <div className="list-header">
            <span>Operation</span>
            <span>Details</span>
            <span>Timestamp</span>
          </div>
          <div className="list-content">
            {operationHistory.length > 0 ? (
              operationHistory.map(entry => (
                <div key={entry.id} className="history-entry">
                  <div className="entry-operation">
                    <span className="operation-type">{entry.operation}</span>
                  </div>
                  <div className="entry-details">
                    {entry.details}
                  </div>
                  <div className="entry-timestamp">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-history">
                <p>No operations recorded yet</p>
                <p>Start by selecting tables and performing operations</p>
              </div>
            )}
          </div>
        </div>

        <div className="history-actions">
          <button 
            className="btn-secondary" 
            disabled={operationHistory.length === 0}
          >
            Export Audit Log
          </button>
          <button 
            className="btn-secondary"
            disabled={operationHistory.length === 0}
            onClick={() => setOperationHistory([])}
          >
            Clear History
          </button>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>
    </div>
  );

  const ExportPanel = () => {
    const [exportConfig, setExportConfig] = useState({
      format: 'csv',
      destination: 'download',
      fileName: 'exported_data',
      includeSchema: true,
      compression: 'none'
    });

    const handleExport = () => {
      if (selectedTables.length === 0) {
        alert('No tables selected for export');
        return;
      }

      addToHistory('Data Exported', 
        `Exported ${selectedTables.length} tables as ${exportConfig.format.toUpperCase()}`
      );

      // Mock export success
      alert(`Export completed successfully! Format: ${exportConfig.format}, File: ${exportConfig.fileName}`);
    };

    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Export & Integration</h2>
          <p>Save, export, and integrate your transformed data</p>
        </div>
        
        <div className="export-interface">
          <div className="export-configuration">
            <div className="config-section">
              <h4>Export Configuration</h4>
              
              <div className="config-group">
                <label>Export Format</label>
                <select 
                  className="control-select"
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="excel">Excel</option>
                  <option value="parquet">Parquet</option>
                  <option value="sql">SQL Dump</option>
                </select>
              </div>

              <div className="config-group">
                <label>Destination</label>
                <select 
                  className="control-select"
                  value={exportConfig.destination}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, destination: e.target.value }))}
                >
                  <option value="download">Download</option>
                  <option value="database">Save to Database</option>
                  <option value="cloud">Cloud Storage</option>
                  <option value="api">API Endpoint</option>
                </select>
              </div>

              <div className="config-group">
                <label>File Name</label>
                <input 
                  type="text"
                  className="control-input"
                  value={exportConfig.fileName}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="Enter file name..."
                />
              </div>

              <div className="config-options">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={exportConfig.includeSchema}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeSchema: e.target.checked }))}
                  />
                  Include schema information
                </label>
                
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Include data statistics
                </label>
              </div>
            </div>

            <div className="selected-data">
              <h4>Selected Data for Export</h4>
              <div className="tables-list">
                {selectedTables.map(table => (
                  <div key={table.key} className="table-export-item">
                    <span className="table-name">{table.connectionName}.{table.table}</span>
                    <span className="table-stats">{table.rowCount.toLocaleString()} rows</span>
                  </div>
                ))}
              </div>
              {selectedTables.length === 0 && (
                <p className="no-data">No tables selected for export</p>
              )}
            </div>
          </div>

          <div className="export-actions">
            <div className="action-section">
              <h4>Quick Export</h4>
              <div className="quick-actions">
                <button className="btn-secondary">Export as CSV</button>
                <button className="btn-secondary">Export as JSON</button>
                <button className="btn-secondary">Export as Excel</button>
              </div>
            </div>

            <div className="action-section">
              <h4>Integration</h4>
              <div className="integration-actions">
                <button className="btn-secondary">Push to Dashboard</button>
                <button className="btn-secondary">Schedule Export</button>
                <button className="btn-secondary">API Integration</button>
              </div>
            </div>

            <div className="action-section">
              <h4>Finalize Export</h4>
              <div className="final-actions">
                <button 
                  className="btn-primary"
                  onClick={handleExport}
                  disabled={selectedTables.length === 0}
                >
                  Execute Export
                </button>
                <button className="btn-secondary">Cancel</button>
              </div>
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
          <div className="table-message">No data available</div>
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
                  {typeof row[column] === 'object' ? JSON.stringify(row[column]) : row[column]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="data-manipulation-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-left">
            <div className="nav-logo">DataConnect</div>
            <div className="nav-links">
              <a className="nav-link">Data Sources</a>
              <a className="nav-link active">Manipulation</a>
              <a className="nav-link">Explore</a>
              <a className="nav-link">AI Insights</a>
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
              <h1>Advanced Data Manipulation</h1>
              <p>Cross-database operations, transformations, and analytics</p>
            </div>
            <div className="header-stats">
              <div className="stat">
                <label>Selected Tables</label>
                <span>{selectedTables.length}</span>
              </div>
              <div className="stat">
                <label>Database Types</label>
                <span>{[...new Set(selectedTables.map(t => t.connectionName))].length}</span>
              </div>
              <div className="stat">
                <label>Total Rows</label>
                <span>{selectedTables.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Navigation */}
        <div className="panel-navigation">
          <button 
            className={`panel-nav ${activePanel === 'selection' ? 'active' : ''}`}
            onClick={() => setActivePanel('selection')}
          >
            Source Selection
          </button>
          <button 
            className={`panel-nav ${activePanel === 'join' ? 'active' : ''} ${!isPanelEnabled('join') ? 'disabled' : ''}`}
            onClick={() => isPanelEnabled('join') && setActivePanel('join')}
          >
            Cross-DB Join
          </button>
          <button 
            className={`panel-nav ${activePanel === 'transform' ? 'active' : ''} ${!isPanelEnabled('transform') ? 'disabled' : ''}`}
            onClick={() => isPanelEnabled('transform') && setActivePanel('transform')}
          >
            Transformation
          </button>
          <button 
            className={`panel-nav ${activePanel === 'stats' ? 'active' : ''} ${!isPanelEnabled('stats') ? 'disabled' : ''}`}
            onClick={() => isPanelEnabled('stats') && setActivePanel('stats')}
          >
            Statistics
          </button>
          <button 
            className={`panel-nav ${activePanel === 'visualize' ? 'active' : ''} ${!isPanelEnabled('visualize') ? 'disabled' : ''}`}
            onClick={() => isPanelEnabled('visualize') && setActivePanel('visualize')}
          >
            Visualization
          </button>
          <button 
            className={`panel-nav ${activePanel === 'history' ? 'active' : ''}`}
            onClick={() => setActivePanel('history')}
          >
            History
          </button>
          <button 
            className={`panel-nav ${activePanel === 'export' ? 'active' : ''}`}
            onClick={() => setActivePanel('export')}
          >
            Export
          </button>
        </div>

        {/* Active Panel Content */}
        <div className="panel-container">
          {activePanel === 'selection' && <SelectionPanel />}
          {activePanel === 'join' && <JoinPanel />}
          {activePanel === 'transform' && <TransformPanel />}
          {activePanel === 'stats' && <StatsPanel />}
          {activePanel === 'visualize' && <VisualizePanel />}
          {activePanel === 'history' && <HistoryPanel />}
          {activePanel === 'export' && <ExportPanel />}
        </div>
      </div>
    </div>
  );
};

export default DataManipulation;
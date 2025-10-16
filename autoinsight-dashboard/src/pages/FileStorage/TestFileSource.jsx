import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestFileSource.css';

const TestFileSource = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [testProgress, setTestProgress] = useState(0);
  const [connectionDetails, setConnectionDetails] = useState(null);

  useEffect(() => {
    if (location.state?.connectionData) {
      setConnectionDetails({
        ...location.state.connectionData,
        connectionUri: location.state.connectionUri
      });
    }
  }, [location.state]);

  const simulateFileTest = async () => {
    setIsTesting(true);
    setConnectionStatus('testing');
    setTestProgress(0);

    const progressInterval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(progressInterval);
    setTestProgress(100);

    const mockResults = {
      success: Math.random() > 0.3,
      timestamp: new Date().toISOString(),
      metrics: {
        readTime: '85ms',
        fileSize: '13.2MB',
        rowCount: 12431,
        columnCount: 7,
        parseSpeed: '146,247 rows/sec'
      },
      details: {
        fileType: connectionDetails?.fileType || 'CSV',
        delimiter: connectionDetails?.delimiter || ',',
        encoding: connectionDetails?.encoding || 'UTF-8',
        compression: 'None',
        hasHeaders: connectionDetails?.hasHeaders || true
      },
      schema: [
        { column: 'order_id', type: 'integer', nullCount: 0 },
        { column: 'customer_name', type: 'string', nullCount: 2 },
        { column: 'amount', type: 'float', nullCount: 1 },
        { column: 'order_date', type: 'date', nullCount: 0 },
        { column: 'status', type: 'string', nullCount: 0 },
        { column: 'region', type: 'string', nullCount: 5 },
        { column: 'product_category', type: 'string', nullCount: 0 }
      ],
      sampleData: [
        ['001', 'John Doe', '120.50', '2024-01-15', 'completed', 'North', 'Electronics'],
        ['002', 'Jane Smith', '99.99', '2024-01-16', 'pending', 'South', 'Books'],
        ['003', 'Bob Johnson', '250.00', '2024-01-17', 'completed', 'East', 'Furniture'],
        ['004', 'Alice Brown', '75.25', '2024-01-18', 'shipped', 'West', 'Clothing'],
        ['005', 'Charlie Wilson', '180.75', '2024-01-19', 'completed', 'North', 'Electronics']
      ],
      issues: []
    };

    if (!mockResults.success) {
      mockResults.issues = [
        {
          type: 'format',
          message: 'Inconsistent field count detected in 14 rows',
          severity: 'medium'
        },
        {
          type: 'encoding',
          message: 'File encoding appears to be ISO-8859-1, not UTF-8',
          severity: 'low'
        }
      ];
    } else {
      // Add warnings even for successful tests
      mockResults.issues = [
        {
          type: 'data_quality',
          message: '2 columns contain null values',
          severity: 'low'
        }
      ];
    }

    setTestResults(mockResults);
    setIsTesting(false);
    setConnectionStatus(mockResults.success ? 'connected' : 'failed');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { label: 'Verified', class: 'verified' },
      needs_verification: { label: 'Needs Verification', class: 'needs-verification' },
      failed: { label: 'Failed', class: 'failed' },
      testing: { label: 'Testing', class: 'testing' },
      connected: { label: 'Connected', class: 'connected' },
      disconnected: { label: 'Disconnected', class: 'disconnected' }
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const navigateToConfigure = () => {
    navigate('/configure-file-source');
  };

  return (
    <div className="test-filesource-container">
      <div className="test-filesource-header">
        <div className="header-content">
          <div className="header-main">
            <h1>File Source Testing</h1>
            <p>Verify file accessibility, format validation, and data quality</p>
          </div>
          <button 
            className="btn-configure"
            onClick={navigateToConfigure}
          >
            Configure New File Source
          </button>
        </div>
      </div>

      <div className="test-filesource-body">
        <div className="test-panel">
          {connectionDetails ? (
            <div className="test-content">
              <div className="test-header">
                <div className="connection-title">
                  <h2>{connectionDetails.connectionName || 'Current File Source'}</h2>
                  {getStatusBadge(connectionStatus)}
                </div>
                <div className="connection-meta">
                  <span>{connectionDetails.fileSourceType?.toUpperCase()} • {connectionDetails.fileType} • {connectionDetails.filePath || 'Local File'}</span>
                </div>
              </div>

              <div className="test-controls">
                <button
                  className={`btn-test ${isTesting ? 'testing' : ''}`}
                  onClick={simulateFileTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Testing File Source...
                    </>
                  ) : (
                    'Test File Source'
                  )}
                </button>
              </div>

              {isTesting && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Processing File</span>
                    <span>{testProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${testProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    <div className={`progress-step ${testProgress >= 20 ? 'completed' : ''}`}>
                      Validating File Path
                    </div>
                    <div className={`progress-step ${testProgress >= 40 ? 'completed' : ''}`}>
                      Checking Access Permissions
                    </div>
                    <div className={`progress-step ${testProgress >= 60 ? 'completed' : ''}`}>
                      Determining File Type
                    </div>
                    <div className={`progress-step ${testProgress >= 80 ? 'completed' : ''}`}>
                      Parsing Data
                    </div>
                    <div className={`progress-step ${testProgress >= 100 ? 'completed' : ''}`}>
                      Analyzing Schema
                    </div>
                  </div>
                </div>
              )}

              {testResults && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>File Analysis Results</h3>
                    <span className="results-timestamp">
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className={`results-summary ${testResults.success ? 'success' : 'error'}`}>
                    <div className="summary-content">
                      <div className="summary-title">
                        {testResults.success ? 'File Analysis Successful' : 'File Analysis Failed'}
                      </div>
                      <div className="summary-description">
                        {testResults.success 
                          ? 'File is accessible and format validation passed' 
                          : 'File accessibility or format validation failed'
                        }
                      </div>
                    </div>
                  </div>

                  {testResults.success && (
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-value">{testResults.metrics.fileSize}</div>
                        <div className="metric-label">File Size</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">{testResults.metrics.rowCount.toLocaleString()}</div>
                        <div className="metric-label">Rows</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">{testResults.metrics.columnCount}</div>
                        <div className="metric-label">Columns</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">{testResults.metrics.readTime}</div>
                        <div className="metric-label">Read Time</div>
                      </div>
                    </div>
                  )}

                  <div className="details-grid">
                    <div className="detail-section">
                      <h4>File Information</h4>
                      <div className="detail-item">
                        <span>File Type</span>
                        <span>{testResults.details.fileType}</span>
                      </div>
                      <div className="detail-item">
                        <span>Encoding</span>
                        <span>{testResults.details.encoding}</span>
                      </div>
                      <div className="detail-item">
                        <span>Delimiter</span>
                        <span>{testResults.details.delimiter === ',' ? 'Comma' : testResults.details.delimiter}</span>
                      </div>
                      <div className="detail-item">
                        <span>Headers</span>
                        <span>{testResults.details.hasHeaders ? 'Present' : 'Missing'}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Performance Metrics</h4>
                      <div className="detail-item">
                        <span>Parse Speed</span>
                        <span>{testResults.metrics.parseSpeed}</span>
                      </div>
                      <div className="detail-item">
                        <span>Compression</span>
                        <span>{testResults.details.compression}</span>
                      </div>
                      <div className="detail-item">
                        <span>Total Duration</span>
                        <span>{testResults.metrics.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="schema-section">
                    <h4>Detected Schema</h4>
                    <div className="schema-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Column Name</th>
                            <th>Data Type</th>
                            <th>Null Values</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testResults.schema.map((column, index) => (
                            <tr key={index}>
                              <td className="column-name">{column.column}</td>
                              <td className="column-type">{column.type}</td>
                              <td className="column-nulls">
                                {column.nullCount > 0 ? (
                                  <span className="null-warning">{column.nullCount}</span>
                                ) : (
                                  <span className="null-ok">0</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="sample-data-section">
                    <h4>Sample Data (First 5 Rows)</h4>
                    <div className="sample-data-table">
                      <table>
                        <thead>
                          <tr>
                            {testResults.schema.map((column, index) => (
                              <th key={index}>{column.column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {testResults.sampleData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {testResults.issues.length > 0 && (
                    <div className="issues-section">
                      <h4>Analysis Warnings & Issues</h4>
                      {testResults.issues.map((issue, index) => (
                        <div key={index} className={`issue-item ${issue.severity}`}>
                          <div className="issue-severity">{issue.severity.toUpperCase()}</div>
                          <div className="issue-message">{issue.message}</div>
                          <div className="issue-type">{issue.type.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-connection-selected">
              <div className="empty-state">
                <h3>No File Source Selected</h3>
                <p>Configure a file source first to begin testing</p>
                <button 
                  className="btn-primary"
                  onClick={navigateToConfigure}
                >
                  Configure File Source
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestFileSource;
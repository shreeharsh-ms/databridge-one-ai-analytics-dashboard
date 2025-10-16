import React, { useState, useEffect } from 'react';
import './FileSourcesConnections.css';
import { useNavigate } from 'react-router-dom';

const FileSourceConfiguration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    connectionName: '',
    fileSourceType: 'local',
    filePath: '',
    cloudProvider: '',
    bucketName: '',
    folderPath: '',
    fileType: 'CSV',
    delimiter: ',',
    encoding: 'UTF-8',
    hasHeaders: true,
    tags: [],
    syncSchedule: 'manual',
    syncFrequency: '',
    syncTime: '',
    autoDetectSchema: true,
    sampleRows: 10,
    compression: 'none',
    saveCredentials: false
  });

  const [filePreview, setFilePreview] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    generateFilePreview();
  }, [formData, uploadedFile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateFilePreview = () => {
    if (uploadedFile || formData.filePath) {
      setFilePreview({
        fileName: uploadedFile ? uploadedFile.name : formData.filePath.split('/').pop(),
        fileSize: uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
        rows: 1250,
        columns: 8,
        sampleData: [
          { id: 1, name: 'Product A', category: 'Electronics', price: 299.99, stock: 45 },
          { id: 2, name: 'Product B', category: 'Books', price: 24.99, stock: 120 },
          { id: 3, name: 'Product C', category: 'Clothing', price: 49.99, stock: 78 },
          { id: 4, name: 'Product D', category: 'Home', price: 89.99, stock: 32 },
          { id: 5, name: 'Product E', category: 'Electronics', price: 199.99, stock: 15 }
        ],
        columnsInfo: [
          { name: 'id', type: 'integer', nullCount: 0 },
          { name: 'name', type: 'string', nullCount: 2 },
          { name: 'category', type: 'string', nullCount: 0 },
          { name: 'price', type: 'decimal', nullCount: 1 },
          { name: 'stock', type: 'integer', nullCount: 0 }
        ]
      });
    } else {
      setFilePreview(null);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      handleInputChange('connectionName', file.name.replace(/\.[^/.]+$/, ""));
    }
  };

const testConnection = () => {
  navigate('/test-filesource', {
    state: { 
      connectionData: formData,
      filePreview
    }
  });
};

  const saveConnection = () => {
    console.log('Saving file source connection:', { ...formData, uploadedFile });
    alert('File source connection has been saved successfully.');
    navigate('/file-sources');
  };

  const resetForm = () => {
    setFormData({
      connectionName: '',
      fileSourceType: 'local',
      filePath: '',
      cloudProvider: '',
      bucketName: '',
      folderPath: '',
      fileType: 'CSV',
      delimiter: ',',
      encoding: 'UTF-8',
      hasHeaders: true,
      tags: [],
      syncSchedule: 'manual',
      syncFrequency: '',
      syncTime: '',
      autoDetectSchema: true,
      sampleRows: 10,
      compression: 'none',
      saveCredentials: false
    });
    setUploadedFile(null);
    setFilePreview(null);
    setTestResult(null);
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="file-configuration-container">
      <div className="configuration-header">
        <button 
          className="back-button"
          onClick={() => navigate('/file-sources')}
        >
          ← Back to File Sources
        </button>

        <div className="header-title">
          <h1>File Source Configuration</h1>
          <p>Configure and manage file-based data sources for your dashboard</p>
        </div>
      </div>

      <div className="configuration-body">
        <div className="form-container">
          <div className="form-tabs">
            <button 
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Configuration
            </button>
            <button 
              className={`tab ${activeTab === 'format' ? 'active' : ''}`}
              onClick={() => setActiveTab('format')}
            >
              File Format
            </button>
            <button 
              className={`tab ${activeTab === 'sync' ? 'active' : ''}`}
              onClick={() => setActiveTab('sync')}
            >
              Sync Settings
            </button>
            <button 
              className={`tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              Review & Test
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Basic Configuration</h2>
                  <p className="section-description">
                    Configure the fundamental parameters for your file data source.
                  </p>

                  <div className="input-group">
                    <label>Connection Name</label>
                    <input
                      type="text"
                      placeholder="Sales Data 2024"
                      value={formData.connectionName}
                      onChange={(e) => handleInputChange('connectionName', e.target.value)}
                    />
                    <div className="input-description">
                      A descriptive name for this file source connection
                    </div>
                  </div>

                  <div className="input-group">
                    <label>File Source Type</label>
                    <select
                      value={formData.fileSourceType}
                      onChange={(e) => handleInputChange('fileSourceType', e.target.value)}
                    >
                      <option value="local">Local File</option>
                      <option value="s3">Amazon S3</option>
                      <option value="gdrive">Google Drive</option>
                      <option value="azure">Azure Blob Storage</option>
                      <option value="dropbox">Dropbox</option>
                    </select>
                  </div>

                  {formData.fileSourceType === 'local' && (
                    <div className="input-group">
                      <label>Upload File</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="file-upload"
                          onChange={handleFileUpload}
                          accept=".csv,.json,.xlsx,.xls,.parquet"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="file-upload" className="file-upload-label">
                          {uploadedFile ? uploadedFile.name : 'Choose file or drag and drop'}
                        </label>
                        {uploadedFile && (
                          <div className="file-info">
                            <span className="file-name">{uploadedFile.name}</span>
                            <span className="file-size">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="input-description">
                        Supported formats: CSV, JSON, Excel, Parquet
                      </div>
                    </div>
                  )}

                  {formData.fileSourceType !== 'local' && (
                    <div className="cloud-config-section">
                      <div className="input-group">
                        <label>File Path / URL</label>
                        <input
                          type="text"
                          placeholder={
                            formData.fileSourceType === 's3' 
                              ? 's3://bucket-name/path/to/file.csv'
                              : formData.fileSourceType === 'gdrive'
                              ? 'https://drive.google.com/file/d/...'
                              : 'https://storageaccount.blob.core.windows.net/container/file.csv'
                          }
                          value={formData.filePath}
                          onChange={(e) => handleInputChange('filePath', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <div className="input-group">
                          <label>Bucket / Container</label>
                          <input
                            type="text"
                            placeholder="my-bucket"
                            value={formData.bucketName}
                            onChange={(e) => handleInputChange('bucketName', e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Folder Path</label>
                          <input
                            type="text"
                            placeholder="/data/files/"
                            value={formData.folderPath}
                            onChange={(e) => handleInputChange('folderPath', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label>File Type</label>
                    <select
                      value={formData.fileType}
                      onChange={(e) => handleInputChange('fileType', e.target.value)}
                    >
                      <option value="CSV">CSV</option>
                      <option value="JSON">JSON</option>
                      <option value="Excel">Excel</option>
                      <option value="Parquet">Parquet</option>
                      <option value="TSV">TSV</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="sales, monthly, critical"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addTag(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="input-description">
                      Press Enter to add tags for better organization
                    </div>
                    <div className="tags-container">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button 
                            className="tag-remove"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'format' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>File Format Settings</h2>
                  <p className="section-description">
                    Configure file parsing and data format options.
                  </p>

                  {formData.fileType === 'CSV' && (
                    <div className="format-section">
                      <div className="form-row">
                        <div className="input-group">
                          <label>Delimiter</label>
                          <select
                            value={formData.delimiter}
                            onChange={(e) => handleInputChange('delimiter', e.target.value)}
                          >
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="\t">Tab (\t)</option>
                            <option value="|">Pipe (|)</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>Text Encoding</label>
                          <select
                            value={formData.encoding}
                            onChange={(e) => handleInputChange('encoding', e.target.value)}
                          >
                            <option value="UTF-8">UTF-8</option>
                            <option value="UTF-16">UTF-16</option>
                            <option value="ISO-8859-1">ISO-8859-1</option>
                            <option value="Windows-1252">Windows-1252</option>
                          </select>
                        </div>
                      </div>

                      <div className="toggle-group">
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={formData.hasHeaders}
                            onChange={(e) => handleInputChange('hasHeaders', e.target.checked)}
                          />
                          <span className="toggle-label">First row contains headers</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.fileType === 'JSON' && (
                    <div className="format-section">
                      <div className="input-group">
                        <label>JSON Structure</label>
                        <select
                          onChange={(e) => handleInputChange('jsonStructure', e.target.value)}
                        >
                          <option value="array">Array of Objects</option>
                          <option value="object">Single Object</option>
                          <option value="lines">JSON Lines</option>
                        </select>
                        <div className="input-description">
                          Expected structure of the JSON file
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="processing-section">
                    <h3>Data Processing</h3>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Sample Rows for Preview</label>
                        <input
                          type="number"
                          placeholder="10"
                          value={formData.sampleRows}
                          onChange={(e) => handleInputChange('sampleRows', parseInt(e.target.value) || 10)}
                        />
                        <div className="input-description">
                          Number of rows to sample for schema detection
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Compression</label>
                        <select
                          value={formData.compression}
                          onChange={(e) => handleInputChange('compression', e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="gzip">GZIP</option>
                          <option value="zip">ZIP</option>
                        </select>
                      </div>
                    </div>

                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.autoDetectSchema}
                          onChange={(e) => handleInputChange('autoDetectSchema', e.target.checked)}
                        />
                        <span className="toggle-label">Auto-detect schema and data types</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Sync Settings</h2>
                  <p className="section-description">
                    Configure synchronization and update settings for your file source.
                  </p>

                  <div className="input-group">
                    <label>Sync Schedule</label>
                    <select
                      value={formData.syncSchedule}
                      onChange={(e) => handleInputChange('syncSchedule', e.target.value)}
                    >
                      <option value="manual">Manual Only</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom Cron</option>
                    </select>
                  </div>

                  {formData.syncSchedule !== 'manual' && (
                    <div className="sync-config-section">
                      <div className="form-row">
                        <div className="input-group">
                          <label>Sync Frequency</label>
                          <select
                            value={formData.syncFrequency}
                            onChange={(e) => handleInputChange('syncFrequency', e.target.value)}
                          >
                            <option value="1">Every 1 hour</option>
                            <option value="6">Every 6 hours</option>
                            <option value="12">Every 12 hours</option>
                            <option value="24">Every 24 hours</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>Sync Time</label>
                          <input
                            type="time"
                            value={formData.syncTime}
                            onChange={(e) => handleInputChange('syncTime', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="security-section">
                    <h3>Security Settings</h3>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.saveCredentials}
                          onChange={(e) => handleInputChange('saveCredentials', e.target.checked)}
                        />
                        <span className="toggle-label">Save Connection Profile</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="tab-panel">
                <div className="form-section">
                  <h2>Review & Test Connection</h2>
                  <p className="section-description">
                    Verify your configuration and test the file source connection.
                  </p>

                  <div className="review-section">
                    <div className="config-summary">
                      <h3>Configuration Summary</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Connection Name:</span>
                          <span className="summary-value">{formData.connectionName || 'Not specified'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Source Type:</span>
                          <span className="summary-value">{formData.fileSourceType}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">File Type:</span>
                          <span className="summary-value">{formData.fileType}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Sync Schedule:</span>
                          <span className="summary-value">{formData.syncSchedule}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Schema Detection:</span>
                          <span className="summary-value">{formData.autoDetectSchema ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Sample Rows:</span>
                          <span className="summary-value">{formData.sampleRows}</span>
                        </div>
                      </div>
                    </div>

                    {filePreview && (
                      <div className="preview-section">
                        <div className="preview-header">
                          <h3>File Preview</h3>
                        </div>
                        <div className="preview-content">
                          <div className="file-stats">
                            <div className="stat-item">
                              <span className="stat-label">File Name:</span>
                              <span className="stat-value">{filePreview.fileName}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">File Size:</span>
                              <span className="stat-value">{filePreview.fileSize}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Rows / Columns:</span>
                              <span className="stat-value">{filePreview.rows} × {filePreview.columns}</span>
                            </div>
                          </div>

                          <div className="data-preview">
                            <h4>Sample Data (First 5 rows)</h4>
                            <div className="preview-table">
                              <table>
                                <thead>
                                  <tr>
                                    {filePreview.sampleData.length > 0 && 
                                      Object.keys(filePreview.sampleData[0]).map(key => (
                                        <th key={key}>{key}</th>
                                      ))
                                    }
                                  </tr>
                                </thead>
                                <tbody>
                                  {filePreview.sampleData.map((row, index) => (
                                    <tr key={index}>
                                      {Object.values(row).map((value, cellIndex) => (
                                        <td key={cellIndex}>{value}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="schema-info">
                            <h4>Detected Schema</h4>
                            <div className="schema-grid">
                              {filePreview.columnsInfo.map((column, index) => (
                                <div key={index} className="schema-item">
                                  <span className="column-name">{column.name}</span>
                                  <span className="column-type">{column.type}</span>
                                  <span className="column-nulls">{column.nullCount} nulls</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        <div className="result-message">
                          {testResult.message}
                        </div>
                      </div>
                    )}

                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        Reset Configuration
                      </button>
<button 
  className="btn btn-primary"
  onClick={testConnection}
>
  Test Connection
</button>

                      <button 
                        className="btn btn-success"
                        onClick={saveConnection}
                        disabled={!testResult?.success}
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSourceConfiguration;
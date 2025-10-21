import axios from 'axios';

class MongoDBService {
  constructor() {
    this.connections = new Map();
    this.activeConnection = null;
    this.baseURL = 'http://localhost:5001/api';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Get MongoDB URI from Vault
   */
  async getVaultMongoURI() {
    try {
      const response = await this.axiosInstance.get('/vault/mongodb-uri');
      return response.data.uri;
    } catch (error) {
      console.error("Failed to fetch MongoDB URI from Vault:", error.message);
      return null;
    }
  }

  /**
   * Save connection to backend user profile
   */


  /**
   * Validate MongoDB connection configuration
   */
  validateConnectionConfig(config) {
    const errors = [];

    if (!config.connectionName?.trim()) {
      errors.push('Connection name is required');
    }

    if (!config.host?.trim()) {
      errors.push('Host is required');
    }

    if (config.protocol === 'mongodb://' && !config.port) {
      errors.push('Port is required for mongodb:// protocol');
    }

    if (config.authRequired) {
      if (!config.username?.trim()) {
        errors.push('Username is required when authentication is enabled');
      }
      if (!config.password?.trim()) {
        errors.push('Password is required when authentication is enabled');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate MongoDB connection URI from configuration
   */
  generateConnectionUri(config) {
    const {
      protocol = 'mongodb://',
      host,
      port,
      databaseName,
      authRequired = false,
      username,
      password,
      authSource = 'admin',
      replicaSetName,
      additionalOptions = 'retryWrites=true&w=majority',
      sslEnabled = true
    } = config;

    let uri = protocol;

    // Add credentials if authentication is enabled
    if (authRequired && username && password) {
      uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }

    // Add host and port
    uri += host;
    if (protocol === 'mongodb://' && port) {
      uri += `:${port}`;
    }

    // Add database name
    if (databaseName) {
      uri += `/${databaseName}`;
    } else {
      uri += '/';
    }

    // Build query parameters
    const queryParams = [];

    if (authRequired && authSource) {
      queryParams.push(`authSource=${authSource}`);
    }

    if (replicaSetName) {
      queryParams.push(`replicaSet=${replicaSetName}`);
    }

    // Add SSL/TLS configuration
    if (sslEnabled) {
      queryParams.push('ssl=true');
    } else {
      queryParams.push('ssl=false');
    }

    if (additionalOptions) {
      // Split existing options and add them individually
      const options = additionalOptions.split('&');
      options.forEach(option => {
        if (option.trim()) {
          queryParams.push(option.trim());
        }
      });
    }

    // Add connection timeouts
    queryParams.push('connectTimeoutMS=10000');
    queryParams.push('socketTimeoutMS=45000');

    if (queryParams.length > 0) {
      uri += `?${queryParams.join('&')}`;
    }

    return uri;
  }

  /**
   * Test MongoDB connection via backend API using Axios
   */
  async testConnection(config) {
    const validation = this.validateConnectionConfig(config);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Configuration validation failed',
        errors: validation.errors,
        connectionId: null
      };
    }

    try {
      const connectionUri = this.generateConnectionUri(config);
      
      console.log('Testing MongoDB connection via backend with URI:', this.maskSensitiveData(connectionUri));

      // Call backend API to test connection using Axios
      const response = await this.axiosInstance.post('/mongodb/test-connection', {
        uri: connectionUri,
        config: config
      });

      const result = response.data;

      if (result.success) {
        // Store the connection locally for later use
        const connectionId = this.storeConnectionLocally(config, connectionUri);
        
        return {
          success: true,
          message: 'Connection established successfully',
          connectionId,
          connectionUri: this.maskSensitiveData(connectionUri),
          serverInfo: result.serverInfo || {
            version: 'Unknown',
            host: config.host,
            protocol: config.protocol,
            ssl: config.sslEnabled
          },
          databases: result.databases || [],
          details: result.details || {
            serverVersion: result.serverInfo?.version || 'Unknown',
            protocol: config.protocol,
            sslEnabled: config.sslEnabled,
            compression: 'unknown',
            maxConnections: 0,
            activeConnections: 0
          }
        };
      } else {
        return {
          success: false,
          message: result.message || 'Connection test failed',
          error: result.error,
          errorType: this.determineErrorType(result.message),
          connectionId: null
        };
      }

    } catch (error) {
      console.error('MongoDB connection test error:', error);
      
      let errorMessage = 'Connection test failed';
      let errorType = 'unknown';
      
      // Handle specific error types
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        errorMessage = 'Cannot connect to backend server. Please make sure the backend is running.';
        errorType = 'backend_connection';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Connection timeout - server not reachable';
        errorType = 'timeout';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.message,
        errorType,
        connectionId: null
      };
    }
  }

  /**
   * Determine error type from error message
   */
  determineErrorType(message) {
    if (!message) return 'unknown';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('auth') || lowerMessage.includes('credential') || lowerMessage.includes('password')) {
      return 'authentication';
    } else if (lowerMessage.includes('network') || lowerMessage.includes('host') || lowerMessage.includes('port')) {
      return 'network';
    } else if (lowerMessage.includes('ssl') || lowerMessage.includes('tls')) {
      return 'ssl';
    } else if (lowerMessage.includes('replica') || lowerMessage.includes('set')) {
      return 'replica_set';
    } else if (lowerMessage.includes('timeout')) {
      return 'timeout';
    } else {
      return 'connection';
    }
  }

  /**
   * Store connection configuration locally
   */
  storeConnectionLocally(config, connectionUri) {
    const connectionId = `mongodb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate connectionUri before using it
    const safeConnectionUri = connectionUri || this.generateConnectionUri(config);
    
    const connectionData = {
      id: connectionId,
      config: { ...config },
      connectionUri: this.maskSensitiveData(safeConnectionUri),
      fullConnectionUri: safeConnectionUri,
      createdAt: new Date().toISOString(),
      status: 'connected',
      lastTested: new Date().toISOString()
    };

    this.connections.set(connectionId, connectionData);
    this.activeConnection = connectionId;

    // Save to localStorage for persistence
    this.saveToLocalStorage(connectionData);

    return connectionId;
  }

  /**
   * Save connection to localStorage
   */
  saveToLocalStorage(connectionData) {
    try {
      const savedConnections = JSON.parse(localStorage.getItem('mongodb_connections') || '[]');
      
      // Check if connection with same name already exists
      const existingIndex = savedConnections.findIndex(
        conn => conn.config.connectionName === connectionData.config.connectionName
      );

      if (existingIndex !== -1) {
        savedConnections[existingIndex] = connectionData;
      } else {
        savedConnections.push(connectionData);
      }

      localStorage.setItem('mongodb_connections', JSON.stringify(savedConnections));
    } catch (error) {
      console.warn('Failed to save connection to localStorage:', error);
    }
  }

  /**
   * Load saved connections from localStorage
   */
  loadSavedConnections() {
    try {
      const savedConnections = JSON.parse(localStorage.getItem('mongodb_connections') || '[]');
      savedConnections.forEach(conn => {
        this.connections.set(conn.id, conn);
      });
      return savedConnections;
    } catch (error) {
      console.warn('Failed to load connections from localStorage:', error);
      return [];
    }
  }

  /**
   * Get connection by ID
   */
  getConnection(connectionId) {
    return this.connections.get(connectionId);
  }

  /**
   * Get all saved connections
   */
  getAllConnections() {
    return Array.from(this.connections.values());
  }

  /**
   * Delete connection locally
   */
  deleteConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      
      // Remove from localStorage
      try {
        const savedConnections = JSON.parse(localStorage.getItem('mongodb_connections') || '[]');
        const filteredConnections = savedConnections.filter(conn => conn.id !== connectionId);
        localStorage.setItem('mongodb_connections', JSON.stringify(filteredConnections));
      } catch (error) {
        console.warn('Failed to delete connection from localStorage:', error);
      }

      return true;
    }
    return false;
  }

  /**
   * Mask sensitive data in connection URI for display
   */
  maskSensitiveData(connectionUri) {
    if (!connectionUri || typeof connectionUri !== 'string') {
      console.warn('Invalid connection URI provided to maskSensitiveData:', connectionUri);
      return 'Invalid connection URI';
    }
    return connectionUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  }

  /**
   * Execute database operation via backend using Axios
   */
  async executeOperation(connectionId, operation, parameters = {}) {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      const response = await this.axiosInstance.post('/mongodb/execute', {
        uri: connection.fullConnectionUri,
        operation,
        parameters
      });

      const result = response.data;
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Operation error:', error);
      throw error;
    }
  }

  /**
   * List databases via backend
   */
  async listDatabases(connectionId) {
    return this.executeOperation(connectionId, 'listDatabases');
  }

  /**
   * List collections via backend
   */
  async listCollections(connectionId, database) {
    return this.executeOperation(connectionId, 'listCollections', { database });
  }

  /**
   * Execute query via backend
   */
  async executeQuery(connectionId, database, collection, query = {}, limit = 10) {
    return this.executeOperation(connectionId, 'query', {
      database,
      collection,
      query,
      limit
    });
  }

  /**
   * Execute aggregation via backend
   */
  async executeAggregation(connectionId, database, collection, pipeline = []) {
    return this.executeOperation(connectionId, 'aggregate', {
      database,
      collection,
      pipeline
    });
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get connection statistics via backend using Axios
   */
  async getConnectionStats(connectionId) {
    try {
      const connection = this.getConnection(connectionId);
      if (!connection) {
        return null;
      }

      const response = await this.axiosInstance.post('/mongodb/stats', {
        uri: connection.fullConnectionUri
      });

      const result = response.data;
      
      if (result.success) {
        return {
          connectionId,
          status: 'connected',
          ...result.data
        };
      } else {
        return {
          connectionId,
          status: 'disconnected',
          error: result.error
        };
      }
    } catch (error) {
      return {
        connectionId,
        status: 'disconnected',
        error: error.message
      };
    }
  }

  /**
   * Close connection
   */
  closeConnection(connectionId) {
    const connection = this.getConnection(connectionId);
    if (connection) {
      connection.status = 'disconnected';
      connection.closedAt = new Date().toISOString();
      
      if (this.activeConnection === connectionId) {
        this.activeConnection = null;
      }

      return true;
    }
    return false;
  }

  /**
   * Close all connections
   */
  closeAllConnections() {
    this.connections.forEach(connection => {
      connection.status = 'disconnected';
      connection.closedAt = new Date().toISOString();
    });
    this.activeConnection = null;
    this.connections.clear();
  }

  /**
   * Save connection (combines local and backend saving)
   */
  async saveConnection(config, connectionUri = null) {
  try {
    console.log('💾 Starting save connection process...');
    
    // Generate connection URI if not provided
    const finalConnectionUri = connectionUri || this.generateConnectionUri(config);
    console.log('🔗 Using connection URI:', this.maskSensitiveData(finalConnectionUri));
    
    // Save locally first for immediate access
    const localConnectionId = this.storeConnectionLocally(config, finalConnectionUri);
    console.log('📱 Saved locally with ID:', localConnectionId);
    
    // Use temporary userId for testing
    const userId = localStorage.getItem('userId') || 'temp_user_12347';
    console.log('👤 Using userId:', userId);
    
    if (userId) {
      const backendResult = await this.saveConnectionToBackend(userId, config, finalConnectionUri);
      
      return {
        success: backendResult.success,
        localConnectionId,
        userConnectionId: backendResult.connectionId,
        message: backendResult.message || 'Connection saved locally and to backend'
      };
    }
    
    console.log('👤 No user ID found, saving locally only');
    return {
      success: true,
      localConnectionId,
      message: 'Connection saved locally (user not authenticated)'
    };
    
  } catch (error) {
    console.error('❌ Error saving connection:', error);
    return {
      success: false,
      message: 'Failed to save connection',
      error: error.message
    };
  }
}

async saveConnectionToBackend(userId, config, connectionUri) {
  try {
    console.log('💾 Saving connection to backend for user:', userId);
    console.log('📋 Connection details:', {
      connectionName: config.connectionName,
      host: config.host,
      databaseName: config.databaseName,
      protocol: config.protocol
    });

    const requestData = {
      userId,
      type: 'mongodb',
      connection: {
        name: config.connectionName,
        encryptedUri: connectionUri,
        connectionData: {
          connectionType: config.connectionType || 'standard',
          host: config.host,
          databaseName: config.databaseName,
          protocol: config.protocol,
          sslEnabled: !!config.sslEnabled,
          authRequired: !!config.authRequired,
          username: config.authRequired ? config.username : '',
          password: config.authRequired ? config.password : '', // FIX: Send actual password, not masked
          replicaSetName: config.replicaSetName || '',
          additionalOptions: config.additionalOptions || '',
          port: config.port || '27017',
          authSource: config.authSource || 'admin'
        }
      }
    };

    // Log the request data with sensitive information masked for security
    const loggedData = {
      ...requestData,
      connection: {
        ...requestData.connection,
        connectionData: {
          ...requestData.connection.connectionData,
          password: requestData.connection.connectionData.password ? '***' : ''
        }
      }
    };
    
    console.log('📤 Sending request to backend:', JSON.stringify(loggedData, null, 2));

    const response = await this.axiosInstance.post('/user/connections', requestData);

    console.log('✅ Backend response received:', response.data);

    return {
      success: true,
      connectionId: response.data.connectionId,
      message: response.data.message || 'Connection saved to user profile successfully'
    };

  } catch (error) {
    const backendMessage = error.response?.data?.message;
    console.error('❌ Failed to save connection to backend:', error);
    console.error('🔧 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    return {
      success: false,
      message: backendMessage || 'Failed to save connection to backend',
      error: error.message
    };
  }
}


}

// Create and export singleton instance
const mongodbService = new MongoDBService();

// Initialize by loading saved connections
mongodbService.loadSavedConnections();

export default mongodbService;
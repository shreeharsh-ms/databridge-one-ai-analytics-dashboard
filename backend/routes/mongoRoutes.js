import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

/**
 * Test MongoDB connection
 */
router.post('/test-connection', async (req, res) => {
  console.log('🔧 [BACKEND] /test-connection endpoint called');
  console.log('📦 [BACKEND] Request body received:', {
    uri: req.body.uri ? '*** URI PROVIDED ***' : 'NO URI',
    config: req.body.config ? '*** CONFIG PROVIDED ***' : 'NO CONFIG'
  });

  try {
    const { uri, config } = req.body;

    if (!uri) {
      console.error('❌ [BACKEND] Missing URI in request');
      return res.status(400).json({
        success: false,
        message: 'Connection URI is required'
      });
    }

    console.log('🔗 [BACKEND] Testing connection with URI:', uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    console.log('⚙️ [BACKEND] Connection config:', {
      sslEnabled: config?.sslEnabled,
      host: config?.host,
      port: config?.port,
      protocol: config?.protocol
    });

    const clientOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      ssl: config?.sslEnabled || false,
      tlsAllowInvalidCertificates: false
    };

    console.log('🔧 [BACKEND] MongoClient options:', clientOptions);

    const client = new MongoClient(uri, clientOptions);

    console.log('🚀 [BACKEND] Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ [BACKEND] MongoDB client connected successfully');

    // Verify connection by pinging
    console.log('🏓 [BACKEND] Pinging database...');
    await client.db().admin().ping();
    console.log('✅ [BACKEND] Database ping successful');

    // Get server information
    console.log('📊 [BACKEND] Fetching server build info...');
    const buildInfo = await client.db().admin().buildInfo();
    console.log('✅ [BACKEND] Build info received - Version:', buildInfo.version);

    console.log('📈 [BACKEND] Fetching server status...');
    const serverStatus = await client.db().admin().serverStatus();
    console.log('✅ [BACKEND] Server status received - Active connections:', serverStatus.connections?.current);
    
    // List databases
    console.log('🗄️ [BACKEND] Listing databases...');
    const databasesResult = await client.db().admin().listDatabases();
    const databases = databasesResult.databases.map(db => db.name);
    console.log('✅ [BACKEND] Databases found:', databases.length, 'databases:', databases);

    console.log('🔌 [BACKEND] Closing client connection...');
    await client.close();
    console.log('✅ [BACKEND] Client connection closed');

    const responseData = {
      success: true,
      message: 'Connection established successfully',
      serverInfo: {
        version: buildInfo.version,
        host: config?.host || 'unknown',
        // port: config?.port || '27017',
        protocol: config?.protocol || 'mongodb://',
        ssl: config?.sslEnabled || false,
        connections: serverStatus.connections?.current || 0
      },
      databases: databases,
      details: {
        serverVersion: buildInfo.version,
        protocol: config?.protocol || 'mongodb://',
        sslEnabled: config?.sslEnabled || false,
        compression: serverStatus.network?.compression || 'none',
        maxConnections: serverStatus.connections?.available || 0,
        activeConnections: serverStatus.connections?.current || 0
      }
    };

    console.log('📤 [BACKEND] Sending successful response:', {
      success: true,
      serverVersion: buildInfo.version,
      databasesCount: databases.length,
      activeConnections: serverStatus.connections?.current
    });

    res.json(responseData);

  } catch (error) {
    console.error('💥 [BACKEND] MongoDB Connection Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    let errorMessage = 'Connection failed';
    let errorType = 'unknown';

    if (error.name === 'MongoServerSelectionError') {
      errorMessage = `Cannot connect to server: ${error.message}`;
      errorType = 'server_selection';
      console.error('🌐 [BACKEND] Server Selection Error - Cannot reach MongoDB server');
    } else if (error.name === 'MongoAuthenticationError') {
      errorMessage = `Authentication failed: ${error.message}`;
      errorType = 'authentication';
      console.error('🔐 [BACKEND] Authentication Error - Invalid credentials');
    } else if (error.name === 'MongoNetworkError') {
      errorMessage = `Network error: ${error.message}`;
      errorType = 'network';
      console.error('📡 [BACKEND] Network Error - Connection issues');
    } else if (error.name === 'MongoTimeoutError') {
      errorMessage = `Connection timeout: ${error.message}`;
      errorType = 'timeout';
      console.error('⏰ [BACKEND] Timeout Error - Server not responding');
    } else if (error.name === 'MongoParseError') {
      errorMessage = `Invalid connection string: ${error.message}`;
      errorType = 'parse_error';
      console.error('📝 [BACKEND] Parse Error - Invalid URI format');
    } else {
      errorMessage = `Connection error: ${error.message}`;
      console.error('❓ [BACKEND] Unknown Error Type:', error.name);
    }

    console.log('📤 [BACKEND] Sending error response:', {
      success: false,
      message: errorMessage,
      errorType: errorType
    });

    res.json({
      success: false,
      message: errorMessage,
      error: error.message,
      errorType: errorType
    });
  }
});

/**
 * Execute database operations
 */
router.post('/execute', async (req, res) => {
  console.log('🔧 [BACKEND] /execute endpoint called');
  console.log('📦 [BACKEND] Execute request:', {
    operation: req.body.operation,
    parameters: req.body.parameters ? '*** PARAMETERS PROVIDED ***' : 'NO PARAMETERS',
    uri: req.body.uri ? '*** URI PROVIDED ***' : 'NO URI'
  });

  try {
    const { uri, operation, parameters } = req.body;

    if (!uri || !operation) {
      console.error('❌ [BACKEND] Missing required fields:', {
        missingUri: !uri,
        missingOperation: !operation
      });
      return res.status(400).json({
        success: false,
        message: 'URI and operation are required'
      });
    }

    console.log('🔧 [BACKEND] Executing operation:', operation);
    console.log('📋 [BACKEND] Operation parameters:', parameters);

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log('🚀 [BACKEND] Connecting for operation execution...');
    await client.connect();
    console.log('✅ [BACKEND] Connected for operation');

    let result;

    switch (operation) {
      case 'listDatabases':
        console.log('🗄️ [BACKEND] Listing all databases...');
        const databases = await client.db().admin().listDatabases();
        result = databases.databases.map(db => ({
          name: db.name,
          size: formatBytes(db.sizeOnDisk),
          empty: db.empty
        }));
        console.log('✅ [BACKEND] Found', result.length, 'databases');
        break;

      case 'listCollections':
        console.log('📂 [BACKEND] Listing collections for database:', parameters.database);
        const db = client.db(parameters.database);
        const collections = await db.listCollections().toArray();
        result = collections.map(collection => ({
          name: collection.name,
          type: collection.type || 'collection'
        }));
        console.log('✅ [BACKEND] Found', result.length, 'collections');
        break;

      case 'query':
        console.log('🔍 [BACKEND] Executing query:', {
          database: parameters.database,
          collection: parameters.collection,
          query: parameters.query,
          limit: parameters.limit
        });
        const queryDb = client.db(parameters.database);
        const queryColl = queryDb.collection(parameters.collection);
        result = await queryColl.find(parameters.query || {})
          .limit(parameters.limit || 10)
          .project(parameters.projection || {})
          .toArray();
        console.log('✅ [BACKEND] Query returned', result.length, 'documents');
        break;

      case 'aggregate':
        console.log('📊 [BACKEND] Executing aggregation:', {
          database: parameters.database,
          collection: parameters.collection,
          pipeline: parameters.pipeline
        });
        const aggDb = client.db(parameters.database);
        const aggColl = aggDb.collection(parameters.collection);
        result = await aggColl.aggregate(parameters.pipeline || []).toArray();
        console.log('✅ [BACKEND] Aggregation returned', result.length, 'documents');
        break;

      default:
        console.error('❌ [BACKEND] Unsupported operation:', operation);
        throw new Error(`Unsupported operation: ${operation}`);
    }

    console.log('🔌 [BACKEND] Closing operation client connection...');
    await client.close();

    console.log('📤 [BACKEND] Sending operation result:', {
      success: true,
      operation: operation,
      resultCount: result.length
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('💥 [BACKEND] Operation Error:', {
      operation: req.body.operation,
      error: error.message,
      name: error.name,
      stack: error.stack
    });

    res.json({
      success: false,
      message: `Operation failed: ${error.message}`,
      error: error.message,
      operation: req.body.operation
    });
  }
});

/**
 * Get connection statistics
 */
router.post('/stats', async (req, res) => {
  console.log('🔧 [BACKEND] /stats endpoint called');
  
  try {
    const { uri } = req.body;

    if (!uri) {
      console.error('❌ [BACKEND] Missing URI for stats');
      return res.status(400).json({
        success: false,
        message: 'URI is required'
      });
    }

    console.log('📊 [BACKEND] Fetching statistics for URI:', uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('🚀 [BACKEND] Connecting for statistics...');
    await client.connect();
    console.log('✅ [BACKEND] Connected for statistics');

    const serverStatus = await client.db().admin().serverStatus();
    console.log('📈 [BACKEND] Server status retrieved:', {
      uptime: serverStatus.uptime,
      activeConnections: serverStatus.connections?.current,
      availableConnections: serverStatus.connections?.available
    });

    await client.close();

    const statsData = {
      uptime: serverStatus.uptime || 0,
      operations: serverStatus.opcounters || {},
      performance: {
        activeConnections: serverStatus.connections?.current || 0,
        availableConnections: serverStatus.connections?.available || 0
      }
    };

    console.log('📤 [BACKEND] Sending statistics:', statsData);

    res.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('💥 [BACKEND] Stats Error:', {
      error: error.message,
      name: error.name
    });

    res.json({
      success: false,
      message: `Failed to get statistics: ${error.message}`,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  console.log('🔧 [BACKEND] /health endpoint called');
  console.log('✅ [BACKEND] Service is healthy');
  
  res.json({
    success: true,
    message: 'MongoDB backend service is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;
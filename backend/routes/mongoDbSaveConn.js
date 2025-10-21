import express from 'express';
import { ObjectId } from 'mongodb';
import interactDB from '../DatabaseConnection/interactDb.js';
import { 
  encryptWithVault, 
  saveUserCredentialsKV, 
  getUserCredentialsKV,
  updateUserCredentialsKV,
  deleteUserCredentialsKV 
} from "../DatabaseConnection/InteractVault.js";

const router = express.Router();

// Save user connection
// Save user connection
router.post("/user/connections", async (req, res) => {
  try {
    console.log("🔵 [BACKEND] POST /user/connections called");

    const { userId, type, connection } = req.body;

    if (!userId || !type || !connection) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, type, connection",
      });
    }

    // ✅ Extract credentials safely
    const { username, password, ...restConnectionData } = connection.connectionData || {};
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing username or password in connectionData",
      });
    }

    const connectionId = new ObjectId().toString();
    const timestamp = new Date().toISOString();

    let vaultPath;
    try {
      // ✅ Store credentials in Vault KV with user-specific path
      vaultPath = await saveUserCredentialsKV(
        userId, 
        type, 
        connectionId, 
        { username, password }
      );
      console.log("✅ Credentials stored in Vault at:", vaultPath);
    } catch (vaultError) {
      console.error("❌ Failed to store credentials in Vault:", vaultError.message);
      return res.status(500).json({
        success: false,
        message: `Failed to store credentials securely: ${vaultError.message}`,
      });
    }

    // ✅ Encrypt the MongoDB URI using Vault transit
    let encryptedUri;
    try {
      encryptedUri = await encryptWithVault(
        "mongo-transit-key",
        connection.encryptedUri || connection.uri
      );
    } catch (encryptError) {
      console.error("❌ Failed to encrypt URI:", encryptError.message);
      // Continue without encryption as fallback
      encryptedUri = connection.encryptedUri || connection.uri;
    }

    // ✅ Create sanitized object (no password in DB)
    const safeConnectionData = {
      ...restConnectionData,
      username, // username is okay to store
      vaultPath, // store the path to retrieve credentials later
      createdAt: timestamp,
      lastUpdated: timestamp,
    };

    // ... rest of your database saving logic remains the same

    res.json({
      success: true,
      connectionId,
      vaultPath,
      message: "Connection saved successfully (credentials stored securely in Vault)",
    });

  } catch (err) {
    console.error("💥 Error saving user connection:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to save connection",
    });
  } finally {
    try {
      await interactDB.close();
    } catch (closeErr) {
      console.error("❌ Error closing DB:", closeErr);
    }
  }
});

// Get user connections with credentials
router.get('/user/connections/:userId', async (req, res) => {
  try {
    console.log('🔵 [BACKEND] GET /user/connections/:userId called');
    
    const { userId } = req.params;
    const { type, includeCredentials = false } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await interactDB.connect();

    const users = await interactDB.findDocuments('user_connections', 'users', { _id: userId }, 1);
    
    if (users.length === 0) {
      return res.json({
        success: true,
        connections: [],
        message: 'No connections found for user'
      });
    }

    const user = users[0];
    let connections = [];

    // Extract connections based on type filter
    if (type && user.dataSources) {
      const dataSource = user.dataSources.find(ds => ds.type === type);
      connections = dataSource ? dataSource.connections : [];
    } else if (user.dataSources) {
      connections = user.dataSources.flatMap(ds => ds.connections || []);
    }

    // If credentials are requested, fetch them from Vault
    if (includeCredentials === 'true') {
      for (let connection of connections) {
        try {
          const credentials = await getUserCredentialsKV(
            userId, 
            connection.dataSourceType || 'mongodb', 
            connection.id
          );
          if (credentials) {
            connection.credentials = credentials;
          }
        } catch (error) {
          console.warn(`⚠️ Could not fetch credentials for connection ${connection.id}:`, error.message);
        }
      }
    }

    res.json({
      success: true,
      connections,
      count: connections.length,
      debug: {
        userId,
        type,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('💥 Error fetching user connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections',
      error: error.message
    });
  } finally {
    try {
      await interactDB.close();
    } catch (closeError) {
      console.error('❌ Error closing database connection:', closeError);
    }
  }
});

// Update user connection
router.put('/user/connections/:userId/:connectionId', async (req, res) => {
  try {
    console.log('🔵 [BACKEND] PUT /user/connections/:userId/:connectionId called');
    
    const { userId, connectionId } = req.params;
    const { connection: connectionData, credentials } = req.body;
    
    if (!userId || !connectionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Connection ID are required'
      });
    }

    await interactDB.connect();

    const timestamp = new Date().toISOString();

    // If credentials are provided, update them in Vault
    if (credentials && credentials.username && credentials.password) {
      await updateUserCredentialsKV(
        userId, 
        connectionData.type || 'mongodb', 
        connectionId, 
        credentials
      );
    }

    // Update connection in database
    const result = await interactDB.updateDocuments(
      'user_connections',
      'users',
      { 
        _id: userId,
        'dataSources.connections.id': connectionId 
      },
      {
        $set: {
          'dataSources.$[].connections.$[conn].name': connectionData.name,
          'dataSources.$[].connections.$[conn].encryptedUri': connectionData.encryptedUri,
          'dataSources.$[].connections.$[conn].connectionData': {
            ...connectionData.connectionData,
            lastUpdated: timestamp
          },
          'dataSources.$[].connections.$[conn].lastUpdated': timestamp,
          lastUpdated: timestamp
        }
      },
      [{ 'conn.id': connectionId }]
    );

    res.json({
      success: true,
      message: 'Connection updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('💥 Error updating user connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update connection',
      error: error.message
    });
  } finally {
    try {
      await interactDB.close();
    } catch (closeError) {
      console.error('❌ Error closing database connection:', closeError);
    }
  }
});

// Delete user connection
router.delete('/user/connections/:userId/:connectionId', async (req, res) => {
  try {
    console.log('🔵 [BACKEND] DELETE /user/connections/:userId/:connectionId called');
    
    const { userId, connectionId } = req.params;
    const { dataSourceType = 'mongodb' } = req.query;
    
    if (!userId || !connectionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Connection ID are required'
      });
    }

    await interactDB.connect();

    // Delete credentials from Vault first
    try {
      await deleteUserCredentialsKV(userId, dataSourceType, connectionId);
    } catch (vaultError) {
      console.warn('⚠️ Could not delete credentials from Vault:', vaultError.message);
    }

    // Delete connection from database
    const result = await interactDB.updateDocuments(
      'user_connections',
      'users',
      { _id: userId },
      {
        $pull: {
          'dataSources.$[].connections': { id: connectionId }
        },
        $set: {
          lastUpdated: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Connection deleted successfully',
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('💥 Error deleting user connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete connection',
      error: error.message
    });
  } finally {
    try {
      await interactDB.close();
    } catch (closeError) {
      console.error('❌ Error closing database connection:', closeError);
    }
  }
});

// Get connection credentials (separate endpoint for security)
router.get('/user/connections/:userId/:connectionId/credentials', async (req, res) => {
  try {
    const { userId, connectionId } = req.params;
    const { dataSourceType = 'mongodb' } = req.query;
    
    if (!userId || !connectionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Connection ID are required'
      });
    }

    const credentials = await getUserCredentialsKV(userId, dataSourceType, connectionId);
    
    if (!credentials) {
      return res.status(404).json({
        success: false,
        message: 'Credentials not found for this connection'
      });
    }

    res.json({
      success: true,
      credentials
    });
  } catch (error) {
    console.error('💥 Error fetching connection credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials',
      error: error.message
    });
  }
});

// ... rest of your existing routes (get all users, test, etc.)

export default router;
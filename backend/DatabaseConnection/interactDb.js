import { MongoClient } from "mongodb";

class InteractDB {
  constructor() {
    // Replace these with your MongoDB Atlas credentials
    this.username = "infoshreeharshshivpuje_db_user";
    this.password = "cBIyxliUzqDl1LpM";
    this.host = "cluster0.ccjkejl.mongodb.net";
    this.protocol = "mongodb+srv://";
    this.options = "?retryWrites=true&w=majority&appName=Cluster0";

    this.uri = `${this.protocol}${encodeURIComponent(this.username)}:${encodeURIComponent(this.password)}@${this.host}/${this.options}`;
    this.client = new MongoClient(this.uri, { 
      serverSelectionTimeoutMS: 10000, // 10s timeout
      maxPoolSize: 10,
      minPoolSize: 1
    });
    this.isConnected = false;
  }

  // Connect to MongoDB
  async connect() {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        this.isConnected = true;
        console.log("✅ Connected successfully to MongoDB Atlas");
      }
    } catch (error) {
      console.error("💥 Connection failed:", error.message);
      throw error;
    }
  }

  // Close connection
  async close() {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log("🔒 Connection closed");
    }
  }

  // List all databases
  async listDatabases() {
    try {
      await this.connect();
      const databases = await this.client.db().admin().listDatabases();
      return databases.databases;
    } catch (error) {
      console.error("💥 Failed to list databases:", error.message);
      throw error;
    }
  }

  // List all collections in a database
  async listCollections(databaseName) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const collections = await db.collections();
      return collections.map(col => col.collectionName);
    } catch (error) {
      console.error("💥 Failed to list collections:", error.message);
      throw error;
    }
  }

  // Insert a document
  async insertDocument(databaseName, collectionName, document) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const collection = db.collection(collectionName);
      const result = await collection.insertOne(document);
      console.log(`✅ Inserted document with ID: ${result.insertedId}`);
      return result;
    } catch (error) {
      console.error("💥 Failed to insert document:", error.message);
      throw error;
    }
  }

  // Find documents with query
  async findDocuments(databaseName, collectionName, query = {}, limit = 10, projection = {}) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const collection = db.collection(collectionName);
      const results = await collection.find(query).project(projection).limit(limit).toArray();
      console.log(`✅ Found ${results.length} documents`);
      return results;
    } catch (error) {
      console.error("💥 Failed to find documents:", error.message);
      throw error;
    }
  }

  // Update documents with array filters
  async updateDocuments(databaseName, collectionName, filter, update, arrayFilters = []) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const collection = db.collection(collectionName);
      
      const options = arrayFilters.length > 0 ? { arrayFilters } : {};
      const result = await collection.updateMany(filter, update, options);
      
      console.log(`✅ Updated ${result.modifiedCount} documents`);
      return result;
    } catch (error) {
      console.error("💥 Failed to update documents:", error.message);
      throw error;
    }
  }

  // Delete documents
  async deleteDocuments(databaseName, collectionName, filter) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany(filter);
      console.log(`✅ Deleted ${result.deletedCount} documents`);
      return result;
    } catch (error) {
      console.error("💥 Failed to delete documents:", error.message);
      throw error;
    }
  }

  // Create index
  async createIndex(databaseName, collectionName, indexSpec, options = {}) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const collection = db.collection(collectionName);
      const result = await collection.createIndex(indexSpec, options);
      console.log(`✅ Created index: ${result}`);
      return result;
    } catch (error) {
      console.error("💥 Failed to create index:", error.message);
      throw error;
    }
  }

  // Drop collection
  async dropCollection(databaseName, collectionName) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const result = await db.collection(collectionName).drop();
      console.log(`✅ Dropped collection: ${collectionName}`);
      return result;
    } catch (error) {
      console.error("💥 Failed to drop collection:", error.message);
      throw error;
    }
  }

  // Get collection stats
  async getCollectionStats(databaseName, collectionName) {
    try {
      await this.connect();
      const db = this.client.db(databaseName);
      const stats = await db.collection(collectionName).stats();
      return stats;
    } catch (error) {
      console.error("💥 Failed to get collection stats:", error.message);
      throw error;
    }
  }
}

// Export singleton instance
const interactDB = new InteractDB();
export default interactDB;
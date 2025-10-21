import express from "express";
import cors from "cors";
import axios from "axios";
import mongoRoutes from "./routes/mongoRoutes.js";
import userRoutes from "./routes/mongoDbSaveConn.js"; // Ensure correct path

const app = express(); // ✅ MUST come before app.use
app.use(cors());
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Test route
app.get("/api/test", (req, res) => {
  console.log('🔵 [BACKEND] /api/test called');
  res.json({ message: "✅ Server is running!" });
});

// ✅ Use routes AFTER app is defined
app.use("/api", userRoutes);

// // ✅ Fixed: Route to fetch secret from Vault (KV v2)
// app.get("/api/vault/mongodb-uri", async (req, res) => {
//   try {
//     console.log("🔧 [BACKEND] /vault/mongodb-uri endpoint called");
//     const vaultUrl = "https://hashicorpc-hosting-on-render-1.onrender.com/v1/mongodb/data/mongodb-uri";
//     const vaultToken = process.env.VAULT_TOKEN || "hvs.beBoVA2jyfgI9yskivN7g5vi";

//     const response = await axios.get(vaultUrl, {
//       headers: { "X-Vault-Token": vaultToken }
//     });

//     const mongoUri = response.data?.data?.data?.uri;
//     if (!mongoUri) {
//       return res.status(404).json({ error: "Mongo URI not found in Vault" });
//     }

//     res.json({ uri: mongoUri });
//   } catch (error) {
//     console.error("Error fetching secret from Vault:", error.message);
//     res.status(500).json({ error: "Failed to fetch secret from Vault" });
//   }
// });

// MongoDB routes
app.use("/api/mongodb", mongoRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🔗 Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/test`);
  console.log(`   - http://localhost:${PORT}/api/user/test`);
  console.log(`   - http://localhost:${PORT}/api/user/connections/temp_user_12345`);
});
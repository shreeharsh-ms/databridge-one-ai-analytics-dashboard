import Vault from "node-vault";
import axios from "axios";

// Vault client configuration
export const vault = Vault({
  apiVersion: "v1",
  endpoint: "https://hashicorpc-hosting-on-render-1.onrender.com",
  token: "hvs.beBoVA2jyfgI9yskivN7g5vi",
});

// Unseal keys (dev/local only)
const unsealKeys = [
  "3c306a64f190c315f98c2c4cccca919bc6788172082caebaad9027d76afbf0ef5e",
  "a15818bc08713e48b919866c4201b133501a5c10195eccbba00720b7f2430b9325",
  "31d3c2fe205c86860b3db78d458499591241ba342884333a5db980fb424c5b573d",
  "051f6fb2b4d1e152a96552059591c38fb6f2afca7229d51835681c4ac1bc509ccf",
  "0ae55ee5df92c9b91f860ecd9c2f72571cab89d33c18505f00446137ab5b3b573d",
];

const VAULT_SEAL_STATUS_URL =
  "https://hashicorpc-hosting-on-render-1.onrender.com/v1/sys/seal-status";
const VAULT_UNSEAL_URL =
  "https://hashicorpc-hosting-on-render-1.onrender.com/v1/sys/unseal";

// 1️⃣ Check if Vault is sealed (via HTTP)
export async function isVaultSealed() {
  try {
    const res = await axios.get(VAULT_SEAL_STATUS_URL, {
      headers: { "X-Vault-Token": vault.token },
    });
    return res.data.sealed;
  } catch (err) {
    console.error("Error checking Vault seal status:", err.message);
    return true; // treat as sealed if cannot reach Vault
  }
}

// 2️⃣ Unseal Vault via HTTP
export async function unsealVaultHTTP() {
  console.log("🔐 Attempting to unseal Vault via HTTP...");

  let sealed = await isVaultSealed();
  if (!sealed) {
    console.log("✅ Vault is already unsealed");
    return;
  }

  for (let i = 0; i < unsealKeys.length; i++) {
    const key = unsealKeys[i];
    try {
      const res = await axios.put(
        VAULT_UNSEAL_URL,
        { key },
        { headers: { "X-Vault-Token": vault.token } }
      );
      sealed = res.data.sealed;
      console.log(`Submitted key ${i + 1}, sealed=${sealed}`);
      if (!sealed) {
        console.log("✅ Vault successfully unsealed");
        break;
      }
    } catch (err) {
      console.error("Error unsealing Vault:", err.message);
    }
  }

  // Final check
  sealed = await isVaultSealed();
  if (sealed) {
    throw new Error(
      "❌ Vault is still sealed! Cannot perform Vault operations."
    );
  }
}

// 3️⃣ Ensure Vault is ready before any action
export async function ensureVaultReady() {
  const sealed = await isVaultSealed();
  if (sealed) {
    console.warn("⚠ Vault is sealed, trying to unseal...");
    await unsealVaultHTTP();
  }
}

// 4️⃣ Setup KV Secrets Engine
export async function setupKVSecretsEngine() {
  await ensureVaultReady();

  try {
    // Check if KV engine is already mounted at users/
    const mounts = await vault.mounts();
    
    if (mounts.data && mounts.data['users/']) {
      console.log("✅ KV engine already mounted at users/");
      return true;
    }

    // Mount KV v2 secrets engine at users/ path
    console.log("🔧 Mounting KV v2 secrets engine at users/...");
    await vault.mount({
      mount_point: 'users',
      type: 'kv',
      options: { version: '2' }
    });

    console.log("✅ Successfully mounted KV v2 secrets engine at users/");
    return true;

  } catch (error) {
    console.error("❌ Error setting up KV secrets engine:", error.message);
    
    // If mount already exists, that's fine
    if (error.message.includes('path is already in use')) {
      console.log("✅ KV engine already mounted");
      return true;
    }
    
    throw error;
  }
}

// 5️⃣ Encrypt with Transit
export async function encryptWithVault(keyName, plaintext) {
  await ensureVaultReady();

  try {
    const result = await vault.write(`transit/encrypt/${keyName}`, {
      plaintext: Buffer.from(plaintext).toString("base64"),
    });
    return result.data.ciphertext;
  } catch (err) {
    console.error("Error encrypting with Vault:", err.message);
    throw err;
  }
}

// 6️⃣ Save credentials with user-specific path
export async function saveUserCredentialsKV(userId, dataSourceType, connectionId, credentials) {
  await ensureVaultReady();
  await setupKVSecretsEngine(); // Ensure KV engine is mounted

  try {
    // Create unique path for each user's connection
    const vaultPath = `${userId}/${dataSourceType}/${connectionId}`;
    
    console.log(`💾 Saving credentials to Vault at: users/data/${vaultPath}`);
    
    await vault.write(`users/data/${vaultPath}`, {
      data: credentials
    });
    
    console.log(`✅ Saved credentials to Vault at: users/data/${vaultPath}`);
    return vaultPath;
  } catch (err) {
    console.error("❌ Error saving user credentials to Vault KV:", err.message);
    
    // More detailed error information
    if (err.response) {
      console.error("Vault response error:", err.response.data);
    }
    
    throw err;
  }
}

// 7️⃣ Get user credentials
export async function getUserCredentialsKV(userId, dataSourceType, connectionId) {
  await ensureVaultReady();
  await setupKVSecretsEngine();

  try {
    const vaultPath = `${userId}/${dataSourceType}/${connectionId}`;
    const secret = await vault.read(`users/data/${vaultPath}`);
    return secret?.data?.data || null;
  } catch (err) {
    // If secret doesn't exist, return null instead of throwing
    if (err.response?.status === 404) {
      console.log(`ℹ️ No credentials found at: users/data/${userId}/${dataSourceType}/${connectionId}`);
      return null;
    }
    console.error("❌ Error reading user credentials from Vault:", err.message);
    throw err;
  }
}

// 8️⃣ Update user credentials
export async function updateUserCredentialsKV(userId, dataSourceType, connectionId, credentials) {
  await ensureVaultReady();
  await setupKVSecretsEngine();

  try {
    const vaultPath = `${userId}/${dataSourceType}/${connectionId}`;
    
    await vault.write(`users/data/${vaultPath}`, {
      data: credentials
    });
    
    console.log(`✅ Updated credentials in Vault at: users/data/${vaultPath}`);
    return vaultPath;
  } catch (err) {
    console.error("❌ Error updating user credentials in Vault:", err.message);
    throw err;
  }
}

// 9️⃣ Delete user credentials
export async function deleteUserCredentialsKV(userId, dataSourceType, connectionId) {
  await ensureVaultReady();
  await setupKVSecretsEngine();

  try {
    const vaultPath = `${userId}/${dataSourceType}/${connectionId}`;
    
    await vault.delete(`users/data/${vaultPath}`);
    
    console.log(`✅ Deleted credentials from Vault at: users/data/${vaultPath}`);
    return true;
  } catch (err) {
    // If secret doesn't exist, that's fine for deletion
    if (err.response?.status === 404) {
      console.log(`ℹ️ No credentials to delete at: users/data/${vaultPath}`);
      return true;
    }
    console.error("❌ Error deleting user credentials from Vault:", err.message);
    throw err;
  }
}

// 🔟 List all connections for a user
export async function listUserConnectionsKV(userId) {
  await ensureVaultReady();
  await setupKVSecretsEngine();

  try {
    const result = await vault.list(`users/metadata/${userId}`);
    return result?.data?.keys || [];
  } catch (err) {
    // If path doesn't exist, return empty array
    if (err.response?.status === 404) {
      return [];
    }
    console.error("❌ Error listing user connections from Vault:", err.message);
    throw err;
  }
}
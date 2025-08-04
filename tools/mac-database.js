const Database = require('better-sqlite3');
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'mac-addresses.db');

// Initialize the database
const db = new Database(dbPath);

/**
 * Create the mac_addresses table if it doesn't exist
 */
function createTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS mac_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac_address TEXT UNIQUE NOT NULL,
      already_use INTEGER DEFAULT 0, -- 0 for false, 1 for true
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      connected_at DATETIME NULL,
      status TEXT DEFAULT 'connecting' -- connecting, connected, banned
    )
  `;

  db.exec(createTableSQL);

  // Add connected_at column if it doesn't exist (for existing databases)
  try {
    db.exec('ALTER TABLE mac_addresses ADD COLUMN connected_at DATETIME NULL');
  } catch (err) {
    // Column might already exist, ignore error
  }

  // Add status column if it doesn't exist (for existing databases)
  try {
    db.exec("ALTER TABLE mac_addresses ADD COLUMN status TEXT DEFAULT 'connecting'");
  } catch (err) {
    // Column might already exist, ignore error
  }

  // Create an index on mac_address for faster lookups
  const createIndexSQL = `
    CREATE INDEX IF NOT EXISTS idx_mac_address ON mac_addresses (mac_address)
  `;

  db.exec(createIndexSQL);
}

/**
 * Save MAC addresses to the database
 * @param {string[]} macAddresses - Array of MAC addresses to save
 */
function saveMacAddresses(macAddresses) {
  // Create the table if it doesn't exist
  createTable();

  // Prepare the insert statement
  const insertSQL = `
    INSERT OR IGNORE INTO mac_addresses (mac_address, already_use)
    VALUES (?, ?)
  `;

  const insertStmt = db.prepare(insertSQL);

  // Insert each MAC address
  const transaction = db.transaction((addresses) => {
    for (const mac of addresses) {
      insertStmt.run(mac, 0); // already_use defaults to false (0 in SQLite)
    }
  });

  transaction(macAddresses);
}

/**
 * Get all MAC addresses from the database
 * @returns {Object[]} Array of MAC address objects
 */
function getAllMacAddresses() {
  // Ensure the table structure is up to date
  createTable();

  const selectSQL = `SELECT * FROM mac_addresses`;
  return db.prepare(selectSQL).all();
}

/**
 * Get unused MAC addresses from the database
 * @returns {Object[]} Array of unused MAC address objects
 */
function getUnusedMacAddresses() {
  // Ensure the table structure is up to date
  createTable();

  const selectSQL = `SELECT * FROM mac_addresses WHERE already_use = ?`;
  return db.prepare(selectSQL).all(0); // 0 represents false in SQLite
}

/**
 * Mark a MAC address as used
 * @param {string} macAddress - The MAC address to mark as used
 */
function markMacAsUsed(macAddress) {
  // Ensure the table structure is up to date
  createTable();

  const updateSQL = `
    UPDATE mac_addresses
    SET already_use = ?, updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(1, macAddress); // 1 represents true in SQLite
}

/**
 * Mark a MAC address as unused
 * @param {string} macAddress - The MAC address to mark as unused
 */
function markMacAsUnused(macAddress) {
  // Ensure the table structure is up to date
  createTable();

  const updateSQL = `
    UPDATE mac_addresses
    SET already_use = ?, updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(0, macAddress); // 0 represents false in SQLite
}

/**
 * Mark a MAC address as connecting
 * @param {string} macAddress - The MAC address to mark as connecting
 */
function markMacAsConnecting(macAddress) {
  // Ensure the table structure is up to date
  createTable();

  const updateSQL = `
    UPDATE mac_addresses
    SET status = 'connecting', updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(macAddress);
}

/**
 * Mark a MAC address as connected and set the connection time
 * @param {string} macAddress - The MAC address to mark as connected
 */
function markMacAsConnected(macAddress) {
  // Ensure the table structure is up to date
  createTable();

  const updateSQL = `
    UPDATE mac_addresses
    SET status = 'connected', connected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(macAddress);
}

/**
 * Mark a MAC address as disconnected and clear the connection time
 * @param {string} macAddress - The MAC address to mark as disconnected
 */
function markMacAsDisconnected(macAddress) {
  // Ensure the table structure is up to date
  createTable();

  const updateSQL = `
    UPDATE mac_addresses
    SET connected_at = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(macAddress);
}

/**
 * Mark a MAC address as banned
 * @param {string} macAddress - The MAC address to mark as banned
 */
function markMacAsBanned(macAddress) {
  // Ensure the table structure is up to date
  createTable();

  const updateSQL = `
    UPDATE mac_addresses
    SET status = 'banned', updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(macAddress);
}

/**
 * Get MAC addresses by status
 * @param {string} status - The status to filter by (connecting, connected, banned)
 * @returns {Object[]} Array of MAC address objects
 */
function getMacAddressesByStatus(status) {
  // Ensure the table structure is up to date
  createTable();

  const selectSQL = `SELECT * FROM mac_addresses WHERE status = ?`;
  return db.prepare(selectSQL).all(status);
}

// Export functions
module.exports = {
  createTable,
  saveMacAddresses,
  getAllMacAddresses,
  getUnusedMacAddresses,
  markMacAsUsed,
  markMacAsUnused,
  markMacAsConnecting,
  markMacAsConnected,
  markMacAsDisconnected,
  markMacAsBanned,
  getMacAddressesByStatus
};
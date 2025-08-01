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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createTableSQL);

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
  const selectSQL = `SELECT * FROM mac_addresses`;
  return db.prepare(selectSQL).all();
}

/**
 * Get unused MAC addresses from the database
 * @returns {Object[]} Array of unused MAC address objects
 */
function getUnusedMacAddresses() {
  const selectSQL = `SELECT * FROM mac_addresses WHERE already_use = ?`;
  return db.prepare(selectSQL).all(0); // 0 represents false in SQLite
}

/**
 * Mark a MAC address as used
 * @param {string} macAddress - The MAC address to mark as used
 */
function markMacAsUsed(macAddress) {
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
  const updateSQL = `
    UPDATE mac_addresses
    SET already_use = ?, updated_at = CURRENT_TIMESTAMP
    WHERE mac_address = ?
  `;

  const updateStmt = db.prepare(updateSQL);
  updateStmt.run(0, macAddress); // 0 represents false in SQLite
}

// Export functions
module.exports = {
  createTable,
  saveMacAddresses,
  getAllMacAddresses,
  getUnusedMacAddresses,
  markMacAsUsed,
  markMacAsUnused
};
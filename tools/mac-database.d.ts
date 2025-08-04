// Type definition for mac-database.js

/**
 * Interface for MAC address object from database
 */
export interface MacAddress {
  id: number
  mac_address: string
  already_use: number // 0 for false, 1 for true
  created_at: string // ISO datetime string
  updated_at: string // ISO datetime string
  connected_at: string | null // ISO datetime string or null
  status: "connecting" | "connected" | "banned" // Status of the MAC address
}

/**
 * Create the mac_addresses table if it doesn't exist
 */
export function createTable(): void

/**
 * Save MAC addresses to the database
 * @param macAddresses - Array of MAC addresses to save
 */
export function saveMacAddresses(macAddresses: string[]): void

/**
 * Get all MAC addresses from the database
 * @returns Array of MAC address objects
 */
export function getAllMacAddresses(): MacAddress[]

/**
 * Get unused MAC addresses from the database
 * @returns Array of unused MAC address objects
 */
export function getUnusedMacAddresses(): MacAddress[]

/**
 * Mark a MAC address as used
 * @param macAddress - The MAC address to mark as used
 */
export function markMacAsUsed(macAddress: string): void

/**
 * Mark a MAC address as unused
 * @param macAddress - The MAC address to mark as unused
 */
export function markMacAsUnused(macAddress: string): void

/**
 * Mark a MAC address as connecting
 * @param macAddress - The MAC address to mark as connecting
 */
export function markMacAsConnecting(macAddress: string): void

/**
 * Mark a MAC address as connected and set the connection time
 * @param macAddress - The MAC address to mark as connected
 */
export function markMacAsConnected(macAddress: string): void

/**
 * Mark a MAC address as disconnected and clear the connection time
 * @param macAddress - The MAC address to mark as disconnected
 */
export function markMacAsDisconnected(macAddress: string): void

/**
 * Mark a MAC address as banned
 * @param macAddress - The MAC address to mark as banned
 */
export function markMacAsBanned(macAddress: string): void

/**
 * Get MAC addresses by status
 * @param status - The status to filter by (connecting, connected, banned)
 * @returns Array of MAC address objects
 */
export function getMacAddressesByStatus(
  status: "connecting" | "connected" | "banned"
): MacAddress[]

/**
 * Get a MAC address by its address
 * @param macAddress - The MAC address to search for
 * @returns MAC address object or null if not found
 */
export function getMacAddressByAddress(macAddress: string): MacAddress | null

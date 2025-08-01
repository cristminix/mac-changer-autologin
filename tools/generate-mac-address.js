/**
 * Generate sequential WiFi MAC addresses with base format 68:7a:64:06:xx:xx
 * where xx:xx is sequential from 0x0000 to 0xFFFF
 *
 * @returns {string[]} Array of MAC addresses
 */
function generateMacAddresses() {
    const macs = [];
    const base = ['68', '7a', '64', '06'];

    for (let i = 0; i <= 0xFFFF; i++) {
        const xx1 = ((i >> 8) & 0xFF).toString(16).padStart(2, '0');
        const xx2 = (i & 0xFF).toString(16).padStart(2, '0');
        const mac = [...base, xx1, xx2].join(':');
        macs.push(mac);
    }

    return macs;
}

// If this file is run directly, generate MAC addresses and save to database
if (require.main === module) {
    // Generate all MAC addresses
    const allMacs = generateMacAddresses();

    // Import database functions
    const { saveMacAddresses } = require('./mac-database');

    // Save MAC addresses to database
    console.log('Saving MAC addresses to database...');
    saveMacAddresses(allMacs);
    console.log('Saved', allMacs.length, 'MAC addresses to database');

    // Display first 10 MAC addresses and total count
    console.log('First 10 MAC addresses:', allMacs.slice(0, 10));
    console.log('Total MAC addresses generated:', allMacs.length);
}
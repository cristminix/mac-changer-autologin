const { spawn } = require('child_process');
const { getUnusedMacAddresses, markMacAsUsed, getMacAddressesByStatus } = require('./mac-database');

// Interface jaringan yang digunakan
const INTERFACE = 'Wi-Fi';
function execWithSpinner(cmd) {
    console.log(`[RUN] ${cmd}`);
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, { stdio: 'ignore', shell: true });

        child.on('close', (code) => {
            if (code === 0) {
                console.log('[SUCCESS] Command completed successfully');
                resolve();
            } else {
                const err = new Error(`Command failed with code ${code}`);
                console.error(`[×] Command failed:`, cmd);
                console.error(err.message);
                reject(err);
            }
        });

        child.on('error', (err) => {
            console.error(`[×] Command failed:`, cmd);
            console.error(err.message);
            reject(err);
        });
    });
}
async function changeMacAddress(newMac) {
    const stripped = newMac.replace(/:/g, '');
    try {
        await execWithSpinner(`powershell -Command "Set-NetAdapterAdvancedProperty -Name '${INTERFACE}' -RegistryValue '${stripped}' -DisplayName 'Network Address'"`);
    } catch (err) {
        console.warn('[!] Failed to set MAC using Set-NetAdapterAdvancedProperty, trying alternative method...');
        try {
            // Alternative method using registry
            // Check if running as administrator
            try {
                await new Promise((resolve, reject) => {
                    const child = spawn('net session', { stdio: 'ignore', shell: true });
                    child.on('close', (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error('Administrator privileges required'));
                        }
                    });
                });
            } catch (netErr) {
                console.error('[×] Administrator privileges required for registry modification.');
                console.error('[×] Please run this script as administrator.');
                process.exit(1);
            }
            await execWithSpinner(`reg add "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e972-e325-11ce-bfc1-08002be10318}\\0001" /v NetworkAddress /d "${stripped}" /f`);
        } catch (regErr) {
            console.error('[×] Failed to set MAC using registry method.');
            console.error('[×] Error:', regErr.message);
            process.exit(1);
        }
    }
    try {
        await execWithSpinner(`powershell -Command "Disable-NetAdapter -Name '${INTERFACE}' -Confirm:$false"`);
        await execWithSpinner(`powershell -Command "Enable-NetAdapter -Name '${INTERFACE}' -Confirm:$false"`);
    } catch (err) {
        console.error('[×] Failed to disable/enable network adapter.');
        console.error('[×] Error:', err.message);
        process.exit(1);
    }
}
/**
 * Jalankan perintah untuk mengganti alamat MAC
 * @param {string} macAddress - Alamat MAC yang akan digunakan
 * @returns {Promise} - Promise yang akan diselesaikan ketika proses selesai
 */
function changeMacAddressUnix(macAddress) {
    return new Promise((resolve, reject) => {
        console.log(`[INFO] Mengganti alamat MAC untuk interface ${INTERFACE} menjadi ${macAddress}`);

        // Matikan interface
        const downProcess = spawn('ip', ['link', 'set', INTERFACE, 'down']);

        downProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Gagal mematikan interface: ${code}`));
                return;
            }

            // Ganti alamat MAC
            const changeProcess = spawn('macchanger', ['-m', macAddress, INTERFACE]);

            changeProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Gagal mengganti alamat MAC: ${code}`));
                    return;
                }

                // Nyalakan kembali interface
                const upProcess = spawn('ip', ['link', 'set', INTERFACE, 'up']);

                upProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Gagal menyalakan interface: ${code}`));
                        return;
                    }

                    console.log(`[INFO] Alamat MAC berhasil diubah menjadi ${macAddress}`);
                    resolve();
                });
            });
        });
    });
}

/**
 * Tunggu selama beberapa milidetik
 * @param {number} ms - Jumlah milidetik untuk menunggu
 * @returns {Promise} - Promise yang akan diselesaikan setelah waktu tunggu berakhir
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Proses utama untuk mengganti alamat MAC secara berulang
 */
async function runMacChanger() {
    console.log('[INFO] Memulai proses pengganti alamat MAC');

    while (true) {
        try {
            // Ambil satu alamat MAC yang belum digunakan
            const unusedMacs = getUnusedMacAddresses();

            // Jika tidak ada alamat MAC yang tersedia, hentikan proses
            if (unusedMacs.length === 0) {
                console.log('[INFO] Tidak ada alamat MAC yang tersedia. Menghentikan proses.');
                break;
            }

            // Gunakan alamat MAC pertama yang tersedia
            const macToUse = unusedMacs[0];
            console.log(`[INFO] Menggunakan alamat MAC: ${macToUse.mac_address}`);

            // Jalankan perintah untuk mengganti alamat MAC
            await changeMacAddress(macToUse.mac_address);

            // Tandai alamat MAC sebagai sudah digunakan
            markMacAsUsed(macToUse.mac_address);
            console.log(`[INFO] Alamat MAC ${macToUse.mac_address} telah ditandai sebagai sudah digunakan`);

            // Tunggu sampai status alamat MAC berubah menjadi connected atau banned
            console.log('[INFO] Menunggu status alamat MAC berubah menjadi connected atau banned...');
            let macStatus = null;
            while (true) {
                // Tunggu 1 detik
                await sleep(1000);

                // Periksa apakah alamat MAC ada di daftar connected
                const connectedMacs = getMacAddressesByStatus('connected');
                const connectedMac = connectedMacs.find(mac => mac.mac_address === macToUse.mac_address);
                if (connectedMac) {
                    macStatus = 'connected';
                    break;
                }

                // Periksa apakah alamat MAC ada di daftar banned
                const bannedMacs = getMacAddressesByStatus('banned');
                const bannedMac = bannedMacs.find(mac => mac.mac_address === macToUse.mac_address);
                if (bannedMac) {
                    macStatus = 'banned';
                    break;
                }
            }

            // Jika statusnya banned, lanjutkan ke iterasi berikutnya
            if (macStatus === 'banned') {
                console.log(`[INFO] Alamat MAC ${macToUse.mac_address} dibanned. Melanjutkan ke alamat MAC berikutnya.`);
                continue;
            }

            // Jika statusnya connected, tunggu selama 5 menit (300.000 milidetik)
            console.log('[INFO] Menunggu 5 menit sebelum mengganti alamat MAC lagi...');
            await sleep(300000);
        } catch (error) {
            console.error('[ERROR] Terjadi kesalahan:', error.message);
            // Tunggu sebentar sebelum mencoba lagi
            // await sleep(5000);
            break
        }
    }
}

// Jalankan proses utama jika file dijalankan secara langsung
if (require.main === module) {
    runMacChanger();
}

// Export fungsi untuk penggunaan di file lain
module.exports = {
    runMacChanger
};
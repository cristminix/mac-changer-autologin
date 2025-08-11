const { spawn } = require('child_process');
const { getUnusedMacAddresses, markMacAsUsed, getMacAddressesByStatus, getMacAddressByAddress } = require('./mac-database');

// Interface jaringan yang digunakan
const INTERFACE = 'wlp0s20f3';

/**
 * Jalankan perintah untuk mengganti alamat MAC
 * @param {string} macAddress - Alamat MAC yang akan digunakan
 * @returns {Promise} - Promise yang akan diselesaikan ketika proses selesai
 */
function changeMacAddress_new(macAddress) {
    return new Promise((resolve, reject) => {
        console.log(`[INFO] Mengganti alamat MAC untuk interface ${INTERFACE} menjadi ${macAddress}`);

        // Ganti alamat MAC
        const changeProcess = spawn('macchanger', ['-m', macAddress, INTERFACE]);

        changeProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Gagal mengganti alamat MAC: ${code}`));
                return;
            }

            // Restart interface dengan ifdown dan ifup
            const restartProcess = spawn('bash', ['-c', `ifdown ${INTERFACE} && ifup ${INTERFACE}`]);

            restartProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Gagal merestart interface: ${code}`));
                    return;
                }

                console.log(`[INFO] Alamat MAC berhasil diubah menjadi ${macAddress}`);
                resolve();
            });
        });
    });
}
function changeMacAddress(macAddress) {
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
            const unusedMacs = await getUnusedMacAddresses();

            // Jika tidak ada alamat MAC yang tersedia, hentikan proses
            if (unusedMacs.length === 0) {
                console.log('[INFO] Tidak ada alamat MAC yang tersedia. Menghentikan proses.');
                break;
            }

            // Gunakan alamat MAC pertama yang tersedia
            const macToUse = unusedMacs[0];
            console.log({ macToUse, unusedMacs })
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

                const record = await getMacAddressByAddress(macToUse.mac_address)
                macStatus = record.status
                console.log({ macStatus })
                if (macStatus == 'banned' || macStatus == 'connected') {
                    await markMacAsUsed(macToUse.mac_address);

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
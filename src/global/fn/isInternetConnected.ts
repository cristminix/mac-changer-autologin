// import { promises as dns } from 'dns';
import https from 'https';

export async function isInternetConnected() {
  return new Promise((resolve) => {
    const req = https.get('https://www.google.com', { timeout: 3000 }, (res) => {
      resolve(true); // Success
    });

    req.on('error', () => resolve(false)); // Network error
    req.on('timeout', () => {
      req.destroy();
      resolve(false); // Timeout = likely no connection
    });
  });
}
/*
export async function isInternetConnected() {
  try {
    await dns.lookup('google.com');
    return true;
  } catch {
    return false;
  }
}

*/
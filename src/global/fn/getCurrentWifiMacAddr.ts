import os from "os";
export function getCurrentWifiMacAddr() {
  const networkInterfaces = os.networkInterfaces();
  let macAddr = "";
  // Find the WiFi adapter by name
  const wifiInterface = networkInterfaces["Wi-Fi"];

  if (wifiInterface) {
    // Find the first IPv4 entry (usually has the MAC address)
    const wifiDetails = wifiInterface.find(
      (iface) => iface.family === "IPv4" && !iface.internal,
    );

    if (wifiDetails) {
      // console.log("WiFi MAC Address:", wifiDetails.mac);
      macAddr = wifiDetails.mac;
    } else {
      console.log("WiFi interface found, but no IPv4 details available.");
    }
  } else {
    console.log("WiFi interface not found. Make sure the name is correct.");
  }
  return macAddr;
}

import { getCurrentWifiMacAddr } from "@/global/fn/getCurrentWifiMacAddr";
import { Setting } from "@/global/classes";
import { isInternetConnected } from "@/global/fn/isInternetConnected";

export async function waitForMacChanges(
  timeout = 1000,
  netIfaceName: string,
  callback: any,
) {
  const settings = Setting.getInstance();
  let callbackIsRunning = false
  setInterval(async () => {
    const currentWifiMacAddr = getCurrentWifiMacAddr(netIfaceName);
    const lastWifiMacAddr = await settings.get("lastWifiMacAddr");
    // console.log({ lastWifiMacAddr, currentWifiMacAddr });
    let  connected = await isInternetConnected()

    if (currentWifiMacAddr !== lastWifiMacAddr && !connected) {
      if (typeof callback === "function") {
        await callback(currentWifiMacAddr);
      }
    } else {
      if(!connected){
        if (typeof callback === "function") {
          console.log(`Calling callback again because inet not connected`)
          await callback(currentWifiMacAddr);
        }
      }
      // console.clear();
      console.log(connected,`Waiting for mac changes  ${currentWifiMacAddr}`);
    }
  }, timeout);
}

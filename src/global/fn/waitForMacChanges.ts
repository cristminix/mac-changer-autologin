import { getCurrentWifiMacAddr } from "@/global/fn/getCurrentWifiMacAddr";
import { Setting } from "@/global/classes";

export async function waitForMacChanges(
  timeout = 1000,
  netIfaceName: string,
  callback: any,
) {
  const settings = Setting.getInstance();

  setInterval(async () => {
    const currentWifiMacAddr = getCurrentWifiMacAddr(netIfaceName);
    const lastWifiMacAddr = await settings.get("lastWifiMacAddr");
    // console.log({ lastWifiMacAddr, currentWifiMacAddr });

    if (currentWifiMacAddr !== lastWifiMacAddr) {
      if (typeof callback === "function") {
        await callback(currentWifiMacAddr);
      }
    } else {
      console.log(`Waiting for mac changes  ${currentWifiMacAddr}`);
    }
  }, timeout);
}

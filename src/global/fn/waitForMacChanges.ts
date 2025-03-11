import { getCurrentWifiMacAddr } from "@/global/fn/getCurrentWifiMacAddr";
import { Setting } from "@/global/classes";

export async function waitForMacChanges(timeout = 1000, callback: any) {
  const settings = Setting.getInstance();

  setInterval(async () => {
    const currentWifiMacAddr = getCurrentWifiMacAddr();
    const lastWifiMacAddr = await settings.get("lastWifiMacAddr");
    console.log({ lastWifiMacAddr, currentWifiMacAddr });

    if (currentWifiMacAddr !== lastWifiMacAddr) {
      if (typeof callback === "function") {
        await callback(currentWifiMacAddr);
      }
    } else {
      console.log(`Waiting for mac changes for ${currentWifiMacAddr}`);
    }
  }, timeout);
}

import { getCurrentWifiMacAddr } from "@/global/fn/getCurrentWifiMacAddr"
import { Setting } from "@/global/classes"
import { isInternetConnected } from "@/global/fn/isInternetConnected"

export async function waitForMacChanges(
  timeout = 1000,
  netIfaceName: string,
  callback: any
) {
  const settings = Setting.getInstance()
  let callbackIsRunning = false
  let retryAttempt = 0
  const MAX_RETRY = 3
  setInterval(async () => {
    const currentWifiMacAddr = getCurrentWifiMacAddr(netIfaceName)
    const lastWifiMacAddr = await settings.get("lastWifiMacAddr")
    // console.log({ lastWifiMacAddr, currentWifiMacAddr });
    let connected = await isInternetConnected()

    if (currentWifiMacAddr !== lastWifiMacAddr && !connected) {
      if (typeof callback === "function") {
        await callback(currentWifiMacAddr)
        retryAttempt += 1
      }
    } else {
      if (!connected) {
        if (typeof callback === "function") {
          console.log(`Calling callback again because inet not connected`)
          await callback(currentWifiMacAddr)
          retryAttempt += 1
        }
      }
      // console.clear();
      console.log(connected, `Waiting for mac changes  ${currentWifiMacAddr}`)
    }
    if (connected) {
      retryAttempt = 0
    }
  }, timeout)
}

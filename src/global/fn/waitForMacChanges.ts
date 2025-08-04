import { getCurrentWifiMacAddr } from "@/global/fn/getCurrentWifiMacAddr"
import { Setting } from "@/global/classes"
import { isInternetConnected } from "@/global/fn/isInternetConnected"
import * as process from "node:process"

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
        await callback(currentWifiMacAddr, connected)
        retryAttempt += 1
      }
    } else {
      if (!connected) {
        if (typeof callback === "function") {
          console.log(`Calling callback again because inet not connected`)
          await callback(currentWifiMacAddr), connected
          retryAttempt += 1
        }
      }
      // console.clear();
      process.stdout.write(
        `\r${connected} Waiting for mac changes  ${currentWifiMacAddr}`
      )
    }
    if (connected) {
      retryAttempt = 0
    }
  }, timeout)
}

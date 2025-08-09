import {
  markMacAsUsed,
  markMacAsConnected,
  markMacAsBanned,
  getMacAddressByAddress,
} from "@tools/mac-database"
import { fetchHotspotLogin } from "@/global/fn"
import * as process from "node:process"
import { waitForMacChanges } from "@/global/fn/waitForMacChanges"
import { convert } from "html-to-text"
import * as notifier from "node-notifier"
import * as path from "node:path"

let networkInterfaceName = process.env.NETWORK_IFACE_NAME as string
if (process.platform === "win32") {
  networkInterfaceName = process.env.NETWORK_IFACE_NAME_WIN as string
}
// console.log(process.env)
const main = async () => {
  let pupIsRunning = false
  let pageResponse = ""
  await waitForMacChanges(
    3000,
    networkInterfaceName,
    async (macAddr: string, isInetConnected: boolean) => {
      console.log("Mac Changed", macAddr)
      if (!pupIsRunning) {
        // Check if MAC address status is not equal to connected or banned
        const macAddress = await getMacAddressByAddress(macAddr)
        if (
          macAddress &&
          (macAddress.status === "connected" ||
            macAddress.status === "banned") &&
          isInetConnected
        ) {
          console.log(
            `MAC address ${macAddr} is already ${macAddress.status}. Skipping login process.`
          )

          pupIsRunning = false
          return
        }

        try {
          pupIsRunning = true
          pageResponse = await fetchHotspotLogin(macAddr)
          if (pageResponse) {
            console.log(convert(pageResponse))
            let status = pageResponse.match(/Kode\ Voucher\ Benar/)
              ? "connected"
              : "banned"
            if (status === "connected") {
              console.log(`Login ${macAddr} SUCCESS`)
              // Update MAC address status to connected in database
              await markMacAsConnected(macAddr)
              // Show system notification for successful login
              notifier.notify({
                title: "MAC Changer Auto Login",
                message: `Login ${macAddr} SUCCESS`,
                // icon: path.join(__dirname, "..", "assets", "success.png"), // Optional icon
                sound: true, // Only Notification Center or Windows Toasters
                wait: false, // Wait with callback, until user action is taken against notification
              })
            } else {
              console.log(`Login ${macAddr} GAGAL`)
              // Update MAC address status to banned in database
              await markMacAsBanned(macAddr)
              // Show system notification for failed login
              // notifier.notify({
              //   title: "MAC Changer Auto Login",
              //   message: `Login ${macAddr} GAGAL`,
              //   // icon: path.join(__dirname, "..", "assets", "error.png"), // Optional icon
              //   sound: true, // Only Notification Center or Windows Toasters
              //   wait: false, // Wait with callback, until user action is taken against notification
              // })
            }
          }
          pupIsRunning = false
        } catch (e) {
          console.error(e)
          pupIsRunning = false
        }
      } else {
        console.log("pup is Running")
      }
    }
  )
}

main()

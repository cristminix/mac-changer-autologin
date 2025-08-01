import { markMacAsUsed } from "@tools/mac-database"
import { fetchHotspotLogin } from "@/global/fn"
import * as process from "node:process"
import { waitForMacChanges } from "@/global/fn/waitForMacChanges"
import { convert } from "html-to-text"

let networkInterfaceName = process.env.NETWORK_IFACE_NAME as string
if (process.platform === "win32") {
  networkInterfaceName = process.env.NETWORK_IFACE_NAME_WIN as string
}
// console.log(process.env)
const main = async () => {
  let pupIsRunning = false
  let pageResponse = ""
  await waitForMacChanges(3000, networkInterfaceName, async (macAddr: any) => {
    console.log("Mac Changed", macAddr)
    if (!pupIsRunning) {
      try {
        pupIsRunning = true
        pageResponse = await fetchHotspotLogin(macAddr)
        if (pageResponse) {
          console.log(convert(pageResponse))
          if (pageResponse.match(/Kode\ Voucher\ Benar/)) {
            console.log(`Login ${macAddr} SUCCESS`)
          } else {
            markMacAsUsed(macAddr)
            console.log(`Login ${macAddr} GAGAL`)
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
  })
}

main()

import {
  pupTest,
} from "@/global/fn";
import * as process from "node:process";
import { waitForMacChanges } from "@/global/fn/waitForMacChanges";
let networkInterfaceName = process.env.NETWORK_IFACE_NAME as string;
if (process.platform === "win32") {
  networkInterfaceName = process.env.NETWORK_IFACE_NAME_WIN as string;
}
const main = async () => {

  let pupIsRunning = false;
  await waitForMacChanges(3000, networkInterfaceName, async (macAddr: any) => {
    console.log("Mac Changed", macAddr);
    if (!pupIsRunning) {
      try {
        pupIsRunning = true;
        await pupTest(macAddr);
        pupIsRunning = false;
      } catch (e) {
        console.error(e);
        pupIsRunning = false;
      }
    } else {
      console.log("pup is Running");
    }
  });
};

main();

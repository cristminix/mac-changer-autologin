import {
  getCurrentWifiMacAddr,
  loadJsonFromFile,
  pupHttpBin,
  pupTest,
} from "@/global/fn";
import * as process from "node:process";
import { Setting } from "@/global/classes";
import { waitForMacChanges } from "@/global/fn/waitForMacChanges";
const networkInterfaceName = process.env.NETWORK_IFACE_NAME as string;
const routerIp = process.env.ROUTER_IP as string;

// async function getStatus(){
//   const statusUrl = `http://${routerIp}/status`;
//   const responseText = await fetch(statusUrl).then(r=>r.text())
//   console.log({responseText})
// }
const main = async () => {
  // pupHttpBin()
  // getCurrentWifiMacAddr();
  // const settings = Setting.getInstance();
  // const lastWifiMacAddr = await settings.get("lastWifiMacAddr");
  // console.log({ lastWifiMacAddr });
  // await pupTest();
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
        // await getStatus()
        pupIsRunning = false;
      }
    } else {
      console.log("pup is Running");
    }
  });
};

main();

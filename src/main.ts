import {
  getCurrentWifiMacAddr,
  loadJsonFromFile,
  pupHttpBin,
  pupTest,
} from "@/global/fn";
import * as process from "node:process";
import { Setting } from "@/global/classes";
import { waitForMacChanges } from "@/global/fn/waitForMacChanges";

const main = async () => {
  // pupHttpBin()
  // getCurrentWifiMacAddr();
  // const settings = Setting.getInstance();
  // const lastWifiMacAddr = await settings.get("lastWifiMacAddr");
  // console.log({ lastWifiMacAddr });
  // await pupTest();
  let pupIsRunning = false;
  await waitForMacChanges(3000, async (macAddr: any) => {
    console.log("Mac Changed", macAddr);
    if (!pupIsRunning) {
      try {
        pupIsRunning = true;
        await pupTest();
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

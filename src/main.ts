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
  await waitForMacChanges(5000, async (macAddr: any) => {
    console.log("Mac Changed", macAddr);
    try {
      await pupTest();
    } catch (e) {}
  });
};

main();

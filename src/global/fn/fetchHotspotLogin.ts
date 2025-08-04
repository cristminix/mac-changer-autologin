import * as process from "node:process"
import { Setting } from "@/global/classes"
const routerIp = process.env.ROUTER_IP as string
import { convertMacToUrl } from "@/global/fn/convertMacToUrl"
import { fetchWithTimeout } from "@/global/fn/fetchWithTimeout"

export async function fetchHotspotLogin(macAddr: string) {
  if (macAddr.length < 1) return
  console.log(`pupTest()`)
  const settings = Setting.getInstance()
  const loginUrl = `http://${routerIp}/login`
  const finalUrl = convertMacToUrl(macAddr, loginUrl)
  let newPageResp: any = null
  try {
    newPageResp = await fetchWithTimeout(finalUrl).then((r) => r.text())
  } catch (e) {
    console.error(e)
  }
  // console.log(finalUrl, newPageResp)
  if (newPageResp !== null) {
    await settings.set("lastWifiMacAddr", macAddr)
  }
  return newPageResp
}

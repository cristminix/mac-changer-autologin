import puppeteer from "puppeteer";
import * as process from "node:process";
import { Setting } from "@/global/classes";
const UA = process.env.UA as string;
const routerIp = process.env.ROUTER_IP as string;
const hostspotLoginUrlPattern = process.env.HOTSPOT_LOGIN_URL_PATTERN;
export async function pupTest() {
  console.log(`pupTest()`);
  const settings = Setting.getInstance();

  const browser = await puppeteer.launch({
    headless: true,
    // devtools: true,
    executablePath: "/opt/google/chrome/chrome",
    // "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);

  const loginUrl = `http://${routerIp}/login`;
  let newPageResp: any = null;
  try {
    newPageResp = await page.goto(loginUrl);
  } catch (e) {
    console.error(e);
  }

  if (!newPageResp) {
    await browser.close();
  }
  if (newPageResp !== null) {
    const status = await newPageResp.status();
    console.log({ status });
    if (status !== 200) {
      await browser.close();
    }
  }
  console.log("newPageResp", newPageResp);
  await page.setViewport({ width: 1080, height: 1024 });
  let hrefs: any[] = [];
  try {
    hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"), (a) =>
        a.getAttribute("href"),
      ),
    );
  } catch (e) {}

  let loginUrlFound = false;
  let newLoginUrl = "";
  const loginUrlPattern = hostspotLoginUrlPattern;
  let macAddrFound = "";
  if (hrefs.length > 1) {
    for (const href of hrefs) {
      if (href) {
        if (href.startsWith(loginUrlPattern)) {
          console.log("Login URL: ", href);
          newLoginUrl = href.replace("alia.net", routerIp);
          macAddrFound = href.replace(loginUrlPattern, "");
          macAddrFound = decodeURIComponent(macAddrFound)
            .replace(/^T-/, "")
            .toLowerCase();
          console.log("New Login URL: ", newLoginUrl);
          console.log("Mac Address: ", macAddrFound);
          await settings.set("lastWifiMacAddr", macAddrFound);
          loginUrlFound = true;
        }
      }
    }
  }

  if (loginUrlFound) {
    await page.goto(newLoginUrl);
  } else {
    console.error("Login not found");
  }

  await browser.close();
}

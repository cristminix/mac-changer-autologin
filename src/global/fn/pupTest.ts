import puppeteer from "puppeteer";
import * as process from "node:process";
import { Setting } from "@/global/classes";
const UA = process.env.UA as string;
const routerIp = process.env.ROUTER_IP as string;

export async function pupTest() {
  console.log(`pupTest()`);
  const settings = Setting.getInstance();

  const browser = await puppeteer.launch({
    headless: true,
    // devtools: true,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);

  const loginUrl = `http://${routerIp}/login`;
  await page.goto(loginUrl);

  await page.setViewport({ width: 1080, height: 1024 });
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]"), (a) =>
      a.getAttribute("href"),
    ),
  );
  let loginUrlFound = false;
  let newLoginUrl = "";
  const loginUrlPattern = "http://alia.net/login?dst=&username=";
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

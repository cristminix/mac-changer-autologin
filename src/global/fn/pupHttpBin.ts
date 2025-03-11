import puppeteer from "puppeteer";
import * as process from "node:process";
const UA = process.env.UA as string;
export async function pupHttpBin() {
  (async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      // headless: 'new',
    });
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    // Navigate the page to target website
    await page.goto("https://httpbin.io/user-agent");

    // Get the text content of the page's body
    const content = await page.evaluate(() => document.body.textContent);

    // Log the text content
    console.log("Content: ", content);

    // Close the browser
    await browser.close();
  })();
}

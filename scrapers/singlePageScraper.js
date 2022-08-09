// PROVIGO WEBSITE

const puppeteer = require("puppeteer");
require("dotenv").config({ path: "./.env" });
const { API_KEY } = process.env;

PROXY_USERNAME = "scraperapi";
PROXY_PASSWORD = API_KEY;
PROXY_SERVER = "proxy-server.scraperapi.com";
PROXY_SERVER_PORT = "8001";

const singlePageScraper = async (url) => {
  // OPEN BROWSER
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [`--proxy-server=http://${PROXY_SERVER}:${PROXY_SERVER_PORT}`],
  });

  const page = await browser.newPage();
  console.log(`Navigating to ${url}`);
  await page.authenticate({
    username: PROXY_USERNAME,
    password: PROXY_PASSWORD,
  });

  // how to scrape last page, which has no "next" button?
  // for (i = 0; i < 55; i++) { too many??? doesn't work
  await page.goto(url, { timeout: 180000 });
  let scrapedData = [];
  while (await page.$(".pager .next a")) {
    try {
      const currentPageResults = await page.$$eval(".product_pod", (results) => {
        let array = results.map((result) => {
          let title = result.querySelector("h3 > a").text;
          let price = result.querySelector(".product_price > p").textContent;
          let link = result.querySelector("a > img").src;
          return { title, sold_individually: { is: true, price }, link };
        });
        return array;
      });
      currentPageResults.forEach((element) => {
        scrapedData.push(element);
      });
      await page.click(".next a");
      await page.waitForTimeout(150);
    } catch (err) {
      console.log(err);
    }
  }
  await browser.close();
  return scrapedData;
};

singlePageScraper("http://books.toscrape.com");

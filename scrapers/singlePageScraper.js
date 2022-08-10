// PROVIGO WEBSITE

const puppeteer = require("puppeteer");
const fs = require("fs");

const singlePageScraper = async (url) => {
  // OPEN BROWSER
  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--lang=en"],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "language", {
      get: function () {
        return "en-EN";
      },
    });
    Object.defineProperty(navigator, "languages", {
      get: function () {
        return ["en-EN", "en"];
      },
    });
  });
  console.log(`Navigating to ${url}`);

  // how to scrape last page, which has no "next" button?
  // for (i = 0; i < 55; i++) { too many??? doesn't work
  await page.goto(url, { timeout: 180000 });
  console.log("arrived at page", page);
  let scrapedData = [];
  // while (await page.$(".primary-button.primary-button--load-more-button")) {
  // try {
  //   // const currentPageResults = await page.$$eval(".product_pod", (results) => {
  //   //   let array = results.map((result) => {
  //   //     let title = result.querySelector("h3 > a").text;
  //   //     let price = result.querySelector(".product_price > p").textContent;
  //   //     let link = result.querySelector("a > img").src;
  //   //     return { title, sold_individually: { is: true, price }, link };
  //   //   });
  //   //   return array;
  //   // });
  //   // currentPageResults.forEach((element) => {
  //   //   scrapedData.push(element);
  //   // });
  //   await page.click(".primary-button.primary-button--load-more-button");
  await page.waitForTimeout(10000);
  // } catch (err) {
  //   console.log(err);
  // }
  // }
  await browser.close();
  return scrapedData;
};

singlePageScraper(
  "https://www.provigo.ca/food/fruits-vegetables/fresh-vegetables/c/28195?navid=flyout-L3-Fresh-Vegetables"
);

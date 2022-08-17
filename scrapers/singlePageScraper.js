// -------------------
// CODE for provigo.ca
// -------------------

const puppeteer = require("puppeteer");
const fs = require("fs");

const singlePageScraper = async (url) => {
  // FORCE language === English
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--lang=en"],
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

  await page.goto(url, { timeout: 180000 });
  console.log("arrived at page", page);
  let scrapedData = [];
  await page.waitForTimeout(10000);

  await browser.close();
  return scrapedData;
};

singlePageScraper(
  "https://www.provigo.ca/food/fruits-vegetables/fresh-vegetables/c/28195?navid=flyout-L3-Fresh-Vegetables"
);

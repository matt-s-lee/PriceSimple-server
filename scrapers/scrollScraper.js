const puppeteer = require("puppeteer");
require("dotenv").config({ path: "./.env" });
const { API_KEY } = process.env;

PROXY_USERNAME = "scraperapi";
PROXY_PASSWORD = API_KEY;
PROXY_SERVER = "proxy-server.scraperapi.com";
PROXY_SERVER_PORT = "8001";

const scrollScraper = async (url) => {
  // OPEN BROWSER
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [`--proxy-server=http://${PROXY_SERVER}:${PROXY_SERVER_PORT}`],
  });

  const page = await browser.newPage();
  await page.authenticate({
    username: PROXY_USERNAME,
    password: PROXY_PASSWORD,
  });

  console.log(`Navigating to ${url}`);
  try {
    await page.goto(url, { timeout: 180000 });
    await page.waitForSelector(".quotes");

    let scrapedData = [];
    let isBottom;
    const scrollPage = setInterval(async () => {
      scrapedData = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll(".quote"));
        return items.map((item) => ({
          quote: item.querySelector(".text").textContent,
          author: item.querySelector("small").textContent,
        }));
      });

      let scrollHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
      isBottom = await page.evaluate(
        `document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight`
      );
      // https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore, 2nd answer
      if (isBottom) {
        clearInterval(scrollPage);
        await browser.close();
      }
      console.log(scrapedData.length);
    }, 10000);
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
};

scrollScraper("http://quotes.toscrape.com/scroll");

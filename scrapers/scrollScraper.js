// IGA WEBSITE

const puppeteer = require("puppeteer");
const fs = reqiure("fs");

const scrollScraper = async (url) => {
  // OPEN BROWSER & PAGE
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  console.log(`Navigating to ${url}`);

  try {
    await page.goto(url, { timeout: 60000 });

    let scrapedData = [];
    let isBottom = false;
    const scrollPage = setInterval(async () => {
      // scrapedData = await page.evaluate(() => {
      //   const items = Array.from(document.querySelectorAll(".quote"));
      //   return items.map((item) => ({
      //     quote: item.querySelector(".text").textContent,
      //     author: item.querySelector("small").textContent,
      //   }));

      const soldIndividually = await page.$$eval(".base__Wrapper-sc-1m8b7ry-7", (results) => {
        results = results.filter((result) =>
          result.querySelector("text__Text-sc-1ddlex6-0 hdYQli").textContent.includes("item")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector(".pt-title").textContent,
          store: "iga",
          sold_by_weight: {
            is: false,
            price_per_lb: "",
            price_per_kg: "",
          },
          sold_individually: {
            is: true,
            price_per_item: (priceNoSpaces = result
              .querySelector("div.pi-secondary-price > span")
              .textContent.replace(/\s\D+/g, "")).split("$")[1], // only the #
          },
          sold_by_package: {
            is: false,
            price_per_package: "",
            units_per_package: "",
            price_per_100g: "",
          },
          img_src: result.querySelector(
            "div.tile-product__top-section__visuals > a > picture > img"
          ).src,
          link: result.querySelector(
            "div.tile-product__top-section__visuals > a > picture > img"
          ).src,
        }));
        return array;
      });

      const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
        results = results.filter((result) =>
          result.querySelector(".pi-secondary-price").textContent.includes("/100")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector(".pt-title").textContent,
          store: "iga",
          sold_by_weight: {
            is: false,
            price_per_lb: "",
            price_per_kg: "",
          },
          sold_individually: {
            is: false,
            price_per_item: "",
          },
          sold_by_package: {
            is: true,
            price_per_package: (priceNoSpaces = result
              .querySelector(".pi-sale-price")
              .textContent.replace(/\s\D+/g, "")), // only #
            units_per_package: (priceNoSpaces = result
              .querySelector(".pt-weight")
              .textContent.replace(/\s/g, "")), // no spaces
            price_per_100g: (priceNoSpaces = result
              .querySelector(".pi-secondary-price")
              .textContent.replace(/\s\D/g, "") // only # (no units/$)
              .split("100")[0]),
          },
          img_src: result.querySelector(
            "div.tile-product__top-section__visuals > a > picture > img"
          ).src,
        }));
        return array;
      });
      soldIndividually.forEach((element) => {
        scrapedData.push(element);
      });
      soldByPackage.forEach((element) => {
        scrapedData.push(element);
      });

      let scrollHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
      isBottom = await page.evaluate(
        `document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight`
      );
      // https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore, 2nd answer
      if (isBottom) {
        console.log("Arrived at the bottom of the page");
        clearInterval(scrollPage);
        await browser.close();
      }
      console.log(scrapedData.length);
    }, 3000);
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
};

scrollScraper("http://quotes.toscrape.com/scroll");

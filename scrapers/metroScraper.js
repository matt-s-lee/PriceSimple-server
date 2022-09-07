// ------------------
// CODE for metro.ca
// ------------------

const puppeteer = require("puppeteer");
const fs = require("fs");

const metroScraper = async (url) => {
  // Open browser
  const browser = await puppeteer.launch({
    headless: false,
  });

  // Open new page
  const page = await browser.newPage();
  console.log(`Navigating to ${url}`);
  await page.goto(url, { timeout: 60000 });

  let scrapedData = [];

  // WHILE button still exists
  // *** fix me: this code results in an endless loop on the last page... ***
  while (
    await page.$(
      "#content-temp > div > div.layout--container > div.layout--right > div:nth-child(4) > div > div > a:nth-child(3)"
    )
  ) {
    // ----------------------------------------------------------
    // SCRAPE page for items sold individually, based on selector
    // ----------------------------------------------------------
    try {
      const soldIndividually = await page.$$eval(".tile-product.item-addToCart", (results) => {
        results = results.filter((result) =>
          result.querySelector(".pt-weight").textContent.includes("individually")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector(".pt-title").textContent,
          store: "metro",
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
          link: result.querySelector("div.tile-product__top-section__visuals > a").href,
        }));
        return array;
      });

      // ---------------------------------------------------
      // SCRAPE page for items sold package, with price/100g
      // ---------------------------------------------------
      const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
        results = results.filter((result) =>
          result.querySelector(".pi-secondary-price").textContent.includes("/100")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector(".pt-title").textContent,
          store: "metro",
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
          link: result.querySelector("div.tile-product__top-section__visuals > a").href,
        }));
        return array;
      });

      // ---------------------------------------------------------------------------------
      // SCRAPE page for items sold by bunch/unit (e.g. kale, radishes), without price/100g
      // ----------------------------------------------------------------------------------
      const soldByUnit = await page.$$eval(".tile-product.item-addToCart", (results) => {
        results = results.filter(
          (result) =>
            result.querySelector(".pi-secondary-price").textContent.includes("un.") &&
            !result.querySelector(".pt-weight").textContent.includes("individually")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector(".pt-title").textContent,
          store: "metro",
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
              .querySelector("div.pi-secondary-price > span")
              .textContent.replace(/\s\D+/g, "")).split("$")[1], // only #
            units_per_package: result.querySelector(".pt-weight").textContent,
            price_per_100g: "",
          },
          img_src: result.querySelector(
            "div.tile-product__top-section__visuals > a > picture > img"
          ).src,
          link: result.querySelector("div.tile-product__top-section__visuals > a").href,
        }));
        return array;
      });

      // ---------------------------------------------------------
      // SCRAPE page for items sold by weight, with price/kg or lb
      // ---------------------------------------------------------
      const soldByWeight = await page.$$eval(".tile-product.item-addToCart", (results) => {
        results = results.filter((result) =>
          result.querySelector(".pi-secondary-price").textContent.includes("lb.")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector(".pt-title").textContent,
          store: "metro",
          sold_by_weight: {
            is: true,
            price_per_lb: (priceNoSpaces = result
              .querySelector("div.pi-secondary-price > span:nth-child(2)")
              .textContent.replace(/\s\D+/g, "") // remove all non-digits
              .split("$")[1]), // remove $ at beginning
            price_per_kg: (priceNoSpaces = result
              .querySelector("div.pi-secondary-price > span:nth-child(1)")
              .textContent.replace(/\s\D+/g, "")
              .split("$")[1]),
          },
          sold_individually: {
            is: false,
            price_per_item: "",
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
          link: result.querySelector("div.tile-product__top-section__visuals > a").href,
        }));
        return array;
      });

      // ---------------------------------
      // PUSH all elements into one array
      // ---------------------------------
      soldIndividually.forEach((element) => {
        scrapedData.push(element);
      });
      soldByPackage.forEach((element) => {
        scrapedData.push(element);
      });
      soldByUnit.forEach((element) => {
        scrapedData.push(element);
      });
      soldByWeight.forEach((element) => {
        scrapedData.push(element);
      });
      console.log("length", scrapedData.length);

      // ---------------------------------
      // READ then append into json file
      // ---------------------------------
      fs.readFile("metroItems.json", function (err, data) {
        const json = JSON.parse(data);
        scrapedData.forEach((element) => {
          json.push(element);
        });
        fs.writeFile("metroItems.json", JSON.stringify(json), function (err) {
          if (err) {
            return console.log(err);
          }
          console.log("Data was appended");
        });
      });

      // CLICK button for next page
      await page.click(
        "#content-temp > div > div.layout--container > div.layout--right > div:nth-child(4) > div > div > a:nth-child(3)"
      );
      await page.waitForTimeout(500);
    } catch (err) {
      console.log(err);
    }
  }
  await browser.close();
  return scrapedData;
};

// metroScraper("https://www.metro.ca/en/online-grocery/aisles/fruits-vegetables/vegetables");
metroScraper(
  `https://www.metro.ca/en/online-grocery/aisles/fruits-vegetables/vegetables-page-11`
);


// ------------------
// CODE for provigo.ca
// ------------------
// Going from FR "all veggies" page -> EN: lose most products; 
// attempt to capture some products by clicking another page in EN (e.g. Peas & Carrots)
  

const puppeteer = require("puppeteer");
const fs = require("fs");

const paginatedScraper = async (url) => {
  const LANGUAGE_TOGGLE = "button.site-language-toggle__item";
  // const PEAS_CARROTS =
  //   "#site-content > div > div > div:nth-child(5) > div > div.product-grid__filters > div > div > div.category-filter > ul > li:nth-child(2) > a";

  // Open browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open new page
  const page = await browser.newPage();
  console.log(`Navigating to ${url}`);
  await page.goto(url, { timeout: 60000 });

  await page.waitForSelector(LANGUAGE_TOGGLE);
  await page.click(LANGUAGE_TOGGLE);
  // await page.waitForSelector(PEAS_CARROTS).then(() => page.click(PEAS_CARROTS));

  let scrapedData = [];

  await page.waitForSelector(".product-tile-group__list product-tile-group__list--total-25");
  // ----------------------------------------------------------
  // SCRAPE page for items sold individually, based on selector
  // ----------------------------------------------------------
  try {
    const soldIndividually = await page.$$eval(
      ".product-tile-group__list__item",
      (results) => {
        results = results.filter((result) =>
          result
            .querySelector(".comparison-price-list__item__price__unit")
            .textContent.includes("1ea")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector("product-name__item product-name__item--name")
            .textContent,
          store: "provigo",
          sold_by_weight: {
            is: false,
            price_per_lb: "",
            price_per_kg: "",
          },
          sold_individually: {
            is: true,
            price_per_item: (priceNoSpaces = result
              .querySelector(".selling-price-list__item__price--now-price__value")
              .textContent.split("$")[1]),
          },
          sold_by_package: {
            is: false,
            price_per_package: "",
            units_per_package: "",
            price_per_100g: "",
          },
          img_src: result.querySelector(".responsive-image").src,
          link: result.querySelector(
            "#even > div > div > div.product-tile__details > div.product-tile__details__info > h3 > a"
          ).href,
        }));
        return array;
      }
    );

    //       // ---------------------------------------------------
    //       // SCRAPE page for items sold package, with price/100g
    //       // ---------------------------------------------------
    //       const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
    //         results = results.filter((result) =>
    //           result.querySelector(".pi-secondary-price").textContent.includes("/100")
    //         );
    //         let array = results.map((result) => ({
    //           product_name: result.querySelector(".pt-title").textContent,
    //           store: "metro",
    //           sold_by_weight: {
    //             is: false,
    //             price_per_lb: "",
    //             price_per_kg: "",
    //           },
    //           sold_individually: {
    //             is: false,
    //             price_per_item: "",
    //           },
    //           sold_by_package: {
    //             is: true,
    //             price_per_package: (priceNoSpaces = result
    //               .querySelector(".pi-sale-price")
    //               .textContent.replace(/\s\D+/g, "")), // only #
    //             units_per_package: (priceNoSpaces = result
    //               .querySelector(".pt-weight")
    //               .textContent.replace(/\s/g, "")), // no spaces
    //             price_per_100g: (priceNoSpaces = result
    //               .querySelector(".pi-secondary-price")
    //               .textContent.replace(/\s\D/g, "") // only # (no units/$)
    //               .split("100")[0]),
    //           },
    //           img_src: result.querySelector(
    //             "div.tile-product__top-section__visuals > a > picture > img"
    //           ).src,
    //           link: result.querySelector("div.tile-product__top-section__visuals > a").href,
    //         }));
    //         return array;
    //       });

    //       // ---------------------------------------------------------------------------------
    //       // SCRAPE page for items sold by bunch/unit (e.g. kale, radishes), without price/100g
    //       // ----------------------------------------------------------------------------------
    //       const soldByUnit = await page.$$eval(".tile-product.item-addToCart", (results) => {
    //         results = results.filter(
    //           (result) =>
    //             result.querySelector(".pi-secondary-price").textContent.includes("un.") &&
    //             !result.querySelector(".pt-weight").textContent.includes("individually")
    //         );
    //         let array = results.map((result) => ({
    //           product_name: result.querySelector(".pt-title").textContent,
    //           store: "metro",
    //           sold_by_weight: {
    //             is: false,
    //             price_per_lb: "",
    //             price_per_kg: "",
    //           },
    //           sold_individually: {
    //             is: false,
    //             price_per_item: "",
    //           },
    //           sold_by_package: {
    //             is: true,
    //             price_per_package: (priceNoSpaces = result
    //               .querySelector("div.pi-secondary-price > span")
    //               .textContent.replace(/\s\D+/g, "")).split("$")[1], // only #
    //             units_per_package: result.querySelector(".pt-weight").textContent,
    //             price_per_100g: "",
    //           },
    //           img_src: result.querySelector(
    //             "div.tile-product__top-section__visuals > a > picture > img"
    //           ).src,
    //           link: result.querySelector("div.tile-product__top-section__visuals > a").href,
    //         }));
    //         return array;
    //       });

    //       // ---------------------------------------------------------
    //       // SCRAPE page for items sold by weight, with price/kg or lb
    //       // ---------------------------------------------------------
    //       const soldByWeight = await page.$$eval(".tile-product.item-addToCart", (results) => {
    //         results = results.filter((result) =>
    //           result.querySelector(".pi-secondary-price").textContent.includes("lb.")
    //         );
    //         let array = results.map((result) => ({
    //           product_name: result.querySelector(".pt-title").textContent,
    //           store: "metro",
    //           sold_by_weight: {
    //             is: true,
    //             price_per_lb: (priceNoSpaces = result
    //               .querySelector("div.pi-secondary-price > span:nth-child(2)")
    //               .textContent.replace(/\s\D+/g, "") // remove all non-digits
    //               .split("$")[1]), // remove $ at beginning
    //             price_per_kg: (priceNoSpaces = result
    //               .querySelector("div.pi-secondary-price > span:nth-child(1)")
    //               .textContent.replace(/\s\D+/g, "")
    //               .split("$")[1]),
    //           },
    //           sold_individually: {
    //             is: false,
    //             price_per_item: "",
    //           },
    //           sold_by_package: {
    //             is: false,
    //             price_per_package: "",
    //             units_per_package: "",
    //             price_per_100g: "",
    //           },
    //           img_src: result.querySelector(
    //             "div.tile-product__top-section__visuals > a > picture > img"
    //           ).src,
    //           link: result.querySelector("div.tile-product__top-section__visuals > a").href,
    //         }));
    //         return array;
    //       });

    // ---------------------------------
    // PUSH all elements into one array
    // ---------------------------------
    soldIndividually.forEach((element) => {
      scrapedData.push(element);
    });
    //       soldByPackage.forEach((element) => {
    //         scrapedData.push(element);
    //       });
    //       soldByUnit.forEach((element) => {
    //         scrapedData.push(element);
    //       });
    //       soldByWeight.forEach((element) => {
    //         scrapedData.push(element);
    //       });
    //       console.log("length", scrapedData.length);

    // ---------------------------------
    // READ then append into json file
    // ---------------------------------
    fs.readFile("provigoItems.json", function (err, data) {
      const json = JSON.parse(data);
      scrapedData.forEach((element) => {
        json.push(element);
      });
      fs.writeFile("provigoItems.json", JSON.stringify(json), function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("Data was appended");
      });
    });

    // CLICK button for more results
    // await page
    //   .waitForSelector("button.primary-button.primary-button--load-more-button")
    //   .then(() => page.click("button.primary-button.primary-button--load-more-button"));
  } catch (err) {
    console.log(err);
  }
  // }
  await browser.close();
  return scrapedData;
};

paginatedScraper("https://www.provigo.ca/food/fruits-vegetables/fresh-vegetables/c/28195");

// FAILED ATTEMPTS TO FORCE THE LANGUAGE

// const browser = await puppeteer.launch({
//   headless: false,
//   args: ["--lang=en"],
// });
// const page = await browser.newPage();
// await page.evaluateOnNewDocument(() => {
//   Object.defineProperty(navigator, "language", {
//     get: function () {
//       return "en-EN";
//     },
//   });
//   Object.defineProperty(navigator, "languages", {
//     get: function () {
//       return ["en-EN", "en"];
//     },
//   });
// });
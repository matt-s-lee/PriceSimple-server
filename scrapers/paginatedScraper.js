const puppeteer = require("puppeteer");
const fs = require("fs");

// CONFIGURE SCRAPERAPI
require("dotenv").config({ path: "./.env" });
const { API_KEY } = process.env;
PROXY_USERNAME = "scraperapi";
PROXY_PASSWORD = API_KEY;
PROXY_SERVER = "proxy-server.scraperapi.com";
PROXY_SERVER_PORT = "8001";

const paginatedScraper = async (url) => {
  // OPEN BROWSER
  const browser = await puppeteer.launch({
    headless: false,
    // ignoreHTTPSErrors: true,
    // args: [`--proxy-server=http://${PROXY_SERVER}:${PROXY_SERVER_PORT}`],
  });

  const page = await browser.newPage();
  console.log(`Navigating to ${url}`);
  // await page.authenticate({
  //   username: PROXY_USERNAME,
  //   password: PROXY_PASSWORD,
  // });
  // how to scrape last page, which has no "next" button?
  // for (i = 0; i < 55; i++) { too many??? doesn't work

  await page.goto(url, { timeout: 50000 });
  let scrapedData = [];
  while (
    await page.$(
      "#content-temp > div > div.layout--container > div.layout--right > div:nth-child(4) > div > div > a:nth-child(3)"
    )
  ) {
    try {
      // For all items sold individually

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
              .querySelector(".pi-sale-price")
              .textContent.replace(/\s\D+/g, "")),
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
        }));
        return array;
      });
      const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
        results = results.filter((result) =>
          result.querySelector(".pt-weight").textContent.includes("...")
        );
        let array = results.map((result) => ({
          title: result.querySelector("h3 > a").textContent,
          price: result.querySelector(".product_price > p").textContent,
          link: result.querySelector("a > img").src,
          nothing: "",
        }));
        return array;
      });
      soldByPackage.forEach((element) => {
        scrapedData.push(element);
      });
      soldIndividually.forEach((element) => {
        scrapedData.push(element);
      });
      console.log(scrapedData.length);
      fs.writeFile(
        "soldIndividually.json",
        JSON.stringify(scrapedData),
        "utf8",
        function (err) {
          if (err) {
            return console.log(err);
          }
          console.log(
            "The data has been scraped and saved successfully! View it at './data.json'"
          );
        }
      );
      await page.click(
        "#content-temp > div > div.layout--container > div.layout--right > div:nth-child(4) > div > div > a:nth-child(3)"
      );
      await page.waitForTimeout(500);
      console.log(err);
    } catch (err) {
      console.log(err);
    }
  }
  await browser.close();
  return scrapedData;
};

paginatedScraper("https://www.metro.ca/en/online-grocery/aisles/fruits-vegetables/vegetables");

// close dialog.dismiss if necessary?

const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
  results = results.filter((result) =>
    result.querySelector("h3 > a").textContent.includes("...")
  );
  let array = results.map((result) => ({
    title: result.querySelector("h3 > a").textContent,
    price: result.querySelector(".product_price > p").textContent,
    link: result.querySelector("a > img").src,
    nothing: "",
  }));
  return array;
});
soldByPackage.forEach((element) => {
  scrapedData.push(element);
});
// const soldByPackage100g = await page.$$eval(
//   ".tile-product.item-addToCart",
//   (results) => {
//     results = results.filter((result) =>
//       result.querySelector("h3 > a").textContent.includes("...")
//     );
//     let array = results.map((result) => ({
//       title: result.querySelector("h3 > a").textContent,
//       price: result.querySelector(".product_price > p").textContent,
//       link: result.querySelector("a > img").src,
//       nothing: "",
//     }));
//     return array;
//   }
// );
// soldByPackage100g.forEach((element) => {
//   scrapedData.push(element);
// });
// const soldByWeight = await page.$$eval(".tile-product.item-addToCart", (results) => {
//   results = results.filter((result) =>
//     result.querySelector("h3 > a").textContent.includes("...")
//   );
//   let array = results.map((result) => ({
//     title: result.querySelector("h3 > a").textContent,
//     price: result.querySelector(".product_price > p").textContent,
//     link: result.querySelector("a > img").src,
//     nothing: "",
//   }));
//   return array;
// });
// soldByWeight.forEach((element) => {
//   scrapedData.push(element);
// });

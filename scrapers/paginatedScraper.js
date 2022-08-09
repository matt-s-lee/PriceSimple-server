const puppeteer = require("puppeteer");
const fs = require("fs");

// 107 !!!!!!!!!!!
// CONFIGURE SCRAPERAPI
// require("dotenv").config({ path: "./.env" });
// const { API_KEY } = process.env;
// PROXY_USERNAME = "scraperapi";
// PROXY_PASSWORD = API_KEY;
// PROXY_SERVER = "proxy-server.scraperapi.com";
// PROXY_SERVER_PORT = "8001";

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
  await page.goto(url, { timeout: 60000 });

  let scrapedData = [];
  // while (
  //   await page.$(
  //     "#content-temp > div > div.layout--container > div.layout--right > div:nth-child(4) > div > div > a:nth-child(3)"
  //   )
  // ) {
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
            .querySelector("div.pi-secondary-price > span")
            .textContent.replace(/\s\D+/g, "")), // only the #
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

    // For all items sold in a package, that also have price/100g
    const soldByPackage100g = await page.$$eval(".tile-product.item-addToCart", (results) => {
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
      }));
      return array;
    });

    // For all items sold in a package, without price/100g
    const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
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
            .querySelector("div.pi-secondary-price > span") // ?????
            .textContent.replace(/\s\D+/g, "")), // only #
          units_per_package: result.querySelector(".pt-weight").textContent,
          price_per_100g: "",
        },
        img_src: result.querySelector(
          "div.tile-product__top-section__visuals > a > picture > img"
        ).src,
      }));
      return array;
    });

    // For all items sold by weight, with price/kg and price/lb
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
            .textContent.replace(/\s\D+/g, "")), // only #
          price_per_kg: (priceNoSpaces = result
            .querySelector("div.pi-secondary-price > span:nth-child(1)")
            .textContent.replace(/\s\D+/g, "")), // only #
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
      }));
      return array;
    });

    // Push all elements into one away
    soldIndividually.forEach((element) => {
      scrapedData.push(element);
    });
    soldByPackage100g.forEach((element) => {
      scrapedData.push(element);
    });
    soldByPackage.forEach((element) => {
      scrapedData.push(element);
    });
    soldByWeight.forEach((element) => {
      scrapedData.push(element);
    });

    // Write or append into json file
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
    // await page.click(
    //   "#content-temp > div > div.layout--container > div.layout--right > div:nth-child(4) > div > div > a:nth-child(3)"
    // );
    // await page.waitForTimeout(500);
  } catch (err) {
    console.log(err);
  }
  // }
  await browser.close();
  return scrapedData;
};

paginatedScraper(
  "https://www.metro.ca/en/online-grocery/aisles/fruits-vegetables/vegetables-page-2"
);
// paginatedScraper("https://www.metro.ca/en/online-grocery/aisles/fruits-vegetables/vegetables");

// close dialog.dismiss if necessary?
// how to scrape last page, which has no "next" button?
// for (i = 0; i < 55; i++) { too many??? doesn't work

// const soldByPackage = await page.$$eval(".tile-product.item-addToCart", (results) => {
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
// soldByPackage.forEach((element) => {
//   scrapedData.push(element);
// });
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

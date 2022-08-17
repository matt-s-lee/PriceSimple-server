// ------------------
// CODE for Voila.ca
// ------------------

const puppeteer = require("puppeteer");
const fs = require("fs");

const scrollScraper = async (url) => {
  // OPEN BROWSER & PAGE
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  console.log(`Navigating to ${url}`);
  await page.setViewport({ width: 1366, height: 10000 });

  let scrapedData = [];

  try {
    await page.goto(url, { timeout: 120000 });

    // ----------------------------------------------------------
    // SCRAPE page for items sold individually, based on selector
    // https://pptr.dev/api/puppeteer.page.__eval
    // ----------------------------------------------------------
    const soldIndividually = await page.$$eval(
      ".base__Wrapper-sc-1m8b7ry-7.base__FixedHeightWrapper-sc-1m8b7ry-43.gYtJUs.loZIQJ.viewports-enabled-standard-fop__ViewportsEnabledFop-sc-1y5mdxx-0.ijsLHe",
      // "#main > div:nth-child(2) > div > div > div.Col-sc-dzwtyp-0.bKNFFR > div > div > div",
      (results) => {
        results = results.filter((result) =>
          result
            .querySelector("span.text__Text-sc-1ddlex6-0.hdYQli")
            .textContent.includes("item")
        );
        console.log("results", results);
        let array = results.map((result) => ({
          product_name: result.querySelector("h3").textContent,
          store: "iga",
          sold_by_weight: {
            is: false,
            price_per_lb: "",
            price_per_kg: "",
          },
          sold_individually: {
            is: true,
            price_per_item: (priceNoSpaces = result.querySelector(
              "div.base__PriceWrapper-sc-1m8b7ry-29 > strong"
            ).textContent).split("$")[1], // only the #
          },
          sold_by_package: {
            is: false,
            price_per_package: "",
            units_per_package: "",
            price_per_100g: "",
          },
          img_src: result.querySelector(".fop__Image-sc-1n8du9a-0").src,
          link: result.querySelector("h3 > a").href,
        }));
        console.log("array", array);
        return array;
      }
    );

    // ----------------------------------------------------------
    // SCRAPE page for items sold by package, based on selector
    // ----------------------------------------------------------
    const soldByPackage = await page.$$eval(
      ".base__Wrapper-sc-1m8b7ry-7.base__FixedHeightWrapper-sc-1m8b7ry-43.gYtJUs.loZIQJ.viewports-enabled-standard-fop__ViewportsEnabledFop-sc-1y5mdxx-0.ijsLHe",
      (results) => {
        results = results.filter(
          (result) =>
            !result
              .querySelector(".text__Text-sc-1ddlex6-0.hdYQli")
              .textContent.includes("item")
        );
        let array = results.map((result) => ({
          product_name: result.querySelector("h3").textContent,
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
            price_per_package: (priceNoSpaces = result.querySelector(
              "div.base__PriceWrapper-sc-1m8b7ry-29 > strong"
            ).textContent).split("$")[1], // only #
            units_per_package: result.querySelector(
              "span.text__Text-sc-1ddlex6-0.base__SizeText-sc-1m8b7ry-40.fKIuoi.hvxTVE"
            ).textContent,
            price_per_100g: (priceNoSpaces = result.querySelector(
              "span.text__Text-sc-1ddlex6-0.hdYQli"
            ).textContent).replace(/[{()}]/g, ""),
            // .split("$")[1], // only # (no spaces or letters)
          },
          img_src: result.querySelector(".fop__Image-sc-1n8du9a-0").src,
          link: result.querySelector("h3 > a").href,
        }));
        return array;
      }
    );

    // ------------------------------
    // PUSH results into single array
    // ------------------------------
    soldIndividually.forEach((element) => {
      scrapedData.push(element);
    });
    soldByPackage.forEach((element) => {
      scrapedData.push(element);
    });

    // -------------------------------------
    // READ existing json.file and ADD to it
    // -------------------------------------
    fs.readFile("igaItems.json", function (err, data) {
      const json = JSON.parse(data);
      scrapedData.forEach((element) => {
        json.push(element);
      });
      fs.writeFile("igaItems.json", JSON.stringify(json), function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("Data was appended");
      });
    });
    console.log(scrapedData.length);
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
};

scrollScraper(
  "https://voila.ca/products?sortBy=favorite&sublocationId=f8fc0e0b-b825-4637-8be0-b6652b9b61f1"
);

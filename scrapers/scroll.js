// ------------------------------
// CODE to scroll through a page
// ------------------------------

const puppeteer = require("puppeteer");

const scrollScraper = async (url) => {
  // OPEN BROWSER
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(url, { timeout: 180000 });

  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = window.innerHeight;
      let timer = setInterval(async () => {
        window.scrollBy(0, distance);
        await 
      }, 1500);
      totalHeight += distance;
      if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
        clearInterval(timer);
        resolve();
      }
    });
  });
};

scrollScraper(
  "https://voila.ca/products?source=navigation&sublocationId=7ac279a8-c157-43e2-816b-b5a08767453d"
);

// await page.$$eval(
//   "#main > div:nth-child(2) > div > div > div.Col-sc-dzwtyp-0.bKNFFR > div > div > div",
//   (results) => {
//     console.log(results);
//     console.log("started eval");
//     results = results.filter((result) =>
//       result.querySelector(".text__Text-sc-1ddlex6-0.hdYQli").textContent.includes("item")
//     );
//     let array = results.map((result) => ({
//       product_name: result.querySelector("h3 > a").textContent,
//       store: "iga",
//       sold_by_weight: {
//         is: false,
//         price_per_lb: "",
//         price_per_kg: "",
//       },
//       sold_individually: {
//         is: true,
//         price_per_item: (priceNoSpaces = result.querySelector(
//           "div.base__PriceWrapper-sc-1m8b7ry-29 > strong"
//         ).textContent).split("$")[1], // only the #
//       },
//       sold_by_package: {
//         is: false,
//         price_per_package: "",
//         units_per_package: "",
//         price_per_100g: "",
//       },
//       img_src: result.querySelector(".fop__Image-sc-1n8du9a-0").src,
//       link: result.querySelector("h3 > a").href,
//     }));
//     console.log(array);
//     return array;
//   const soldIndividually = await page.$$eval(
//     "#main > div:nth-child(2) > div > div > div.Col-sc-dzwtyp-0.bKNFFR > div > div > div",
//     (results) => {
//       results = results.filter((result) =>
//         result.querySelector(".text__Text-sc-1ddlex6-0.hdYQli").textContent.includes("item")
//       );
//       let array = results.map((result) => ({
//         product_name: result.querySelector("h3").textContent,
//         store: "iga",
//         sold_by_weight: {
//           is: false,
//           price_per_lb: "",
//           price_per_kg: "",
//         },
//         sold_individually: {
//           is: true,
//           price_per_item: (priceNoSpaces = result.querySelector(
//             "div.base__PriceWrapper-sc-1m8b7ry-29 > strong"
//           ).textContent).split("$")[1], // only the #
//         },
//         sold_by_package: {
//           is: false,
//           price_per_package: "",
//           units_per_package: "",
//           price_per_100g: "",
//         },
//         img_src: result.querySelector(".fop__Image-sc-1n8du9a-0").src,
//         link: result.querySelector("h3 > a").href,
//       }));
//       return array;
//     }
//   );

//   const soldByPackage = await page.$$eval(
//     "#main > div:nth-child(2) > div > div > div.Col-sc-dzwtyp-0.bKNFFR > div > div > div",
//     (results) => {
//       results = results.filter((result) =>
//         result
//           .querySelector(".text__Text-sc-1ddlex6-0.hdYQli")
//           .textContent.includes("per 100g")
//       );
//       let array = results.map((result) => ({
//         product_name: result.querySelector("h3").textContent,
//         store: "iga",
//         sold_by_weight: {
//           is: false,
//           price_per_lb: "",
//           price_per_kg: "",
//         },
//         sold_individually: {
//           is: false,
//           price_per_item: "",
//         },
//         sold_by_package: {
//           is: true,
//           price_per_package: (priceNoSpaces = result.querySelector(
//             "div.base__PriceWrapper-sc-1m8b7ry-29 > strong"
//           ).textContent).split("$")[1], // only #
//           units_per_package: result.querySelector(
//             "span.text__Text-sc-1ddlex6-0.base__SizeText-sc-1m8b7ry-40.fKIuoi.hvxTVE"
//           ).textContent,
//           price_per_100g: (priceNoSpaces = result
//             .querySelector(".span.text__Text-sc-1ddlex6-0.hdYQli")
//             .textContent.replace(/\s\D+/g, "")).split("$")[1], // only # (no spaces or letters)
//         },
//         img_src: result.querySelector(".fop__Image-sc-1n8du9a-0").src,
//         link: result.querySelector("h3 > a").href,
//       }));
//       return array;
//     }
//   );
//   soldIndividually.forEach((element) => {
//     scrapedData.push(element);
//   });
//   soldByPackage.forEach((element) => {
//     scrapedData.push(element);
//   });

//   fs.readFile("igaItems.json", function (err, data) {
//     const json = JSON.parse(data);
//     scrapedData.forEach((element) => {
//       json.push(element);
//     });
//     fs.writeFile("igaItems.json", JSON.stringify(json), function (err) {
//       if (err) {
//         return console.log(err);
//       }
//       console.log("Data was appended");
// });
//     }
//   );
// };

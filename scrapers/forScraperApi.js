// ----------------------------
// CODE TO CONFIGURE SCRAPERAPI
// ----------------------------

// After ```require("dotenv").config({ path: "./.env" });```...
// -------------------------------------
// const { API_KEY } = process.env;
// PROXY_USERNAME = "scraperapi";
// PROXY_PASSWORD = API_KEY;
// PROXY_SERVER = "proxy-server.scraperapi.com";
// PROXY_SERVER_PORT = "8001";

// Inside browser settings
// -------------------------------------
// const browser = await puppeteer.launch({
//     headless: false,
// ignoreHTTPSErrors: true,
// args: [`--proxy-server=http://${PROXY_SERVER}:${PROXY_SERVER_PORT}`],
//   });

// After await page
// -------------------------------------
// await page.authenticate({
//   username: PROXY_USERNAME,
//   password: PROXY_PASSWORD,
// });

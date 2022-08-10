const express = require("express");
const morgan = require("morgan");
const { getAllProducts } = require("./handlers/productHandlers");

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  })
  // CORS error fix: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

  // PRODUCT ENDPOINTS
  .get("/all-products", getAllProducts)

  // // CARTS ENDPOINTS
  // .get("/carts/get/:user") // local storage?
  // .patch("/carts/add-item/:user")
  // .delete("/carts/delete-item/:user") // remove item
  // .delete("/carts/empty/:user") // remove all items

  // // USER ENDPOINTS
  // .get("/profile/:user") // get user details (e.g. searched products)
  // .patch("/profile/:user") // add new searched product to profile
  // .post("/profile/:user") // create user profile

  // CATCH-ALL ENDPOINT

  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "Nothing here - sorry!",
    });
  })

  .listen(8000, () => console.log(`Listening on port 8000`));

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { getAllProducts, getProductOverTime } = require("./handlers/productHandlers");
const { addUser } = require("./handlers/userHandlers");
const { getUserCart, addToCurrentCart, removeItem } = require("./handlers/cartHandlers");

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  })
  .use(cors())

  // PRODUCT ENDPOINTS
  .get("/all-products", getAllProducts)
  .get("/all-products/:product", getProductOverTime) // product price history

  // CURRENT CART ENDPOINTS
  .get("/current-cart/:user", getUserCart) // local storage?
  .put("/current-cart/:user/add-item", addToCurrentCart)
  .delete("/current-cart/:user/remove-item", removeItem) // remove item

  // SAVED CARTS ENDPOINTS
  .get("/saved-cart/:user", getUserCart) // local storage?

  // // USER ENDPOINTS
  .post("/profile/:userId", addUser) // create user profile AND cart

  // CATCH-ALL ENDPOINT
  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "Nothing here - sorry!",
    });
  })

  .listen(8000, () => console.log(`Listening on port 8000`));

  // CORS error fix: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

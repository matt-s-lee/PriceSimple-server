const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { getAllProducts } = require("./handlers/productHandlers");
const { addUser } = require("./handlers/userHandlers");
const { getUserCart } = require("./handlers/cartHandlers");

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

  // CURRENT CART ENDPOINTS
  // -- current cart (i.e. not yet favourited)
  .get("/current-cart/:user", getUserCart) // local storage?
  .patch("/current-cart/:user/add-item")
  // .delete("/carts/:user/remove-item") // remove item
  // .delete("/carts/:user/remove-all") // remove all items

  // SAVED CARTS ENDPOINTS
  .get("/saved-cart/:user", getUserCart) // local storage?
  .patch("/saved-cart/:user/add-item")
  // .delete("/saved-cart/:user/remove-item") // remove item
  // .delete("/saved-cart/:user/remove-all") // remove all items

  // // USER ENDPOINTS
  // .get("/profile/:userId", getUserDetails) // get user details (e.g. searched products)
  // .patch("/profile/:userId") // add new searched product to profile
  .post("/profile/:userId", addUser) // create user profile

  // CATCH-ALL ENDPOINT
  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "Nothing here - sorry!",
    });
  })

  .listen(8000, () => console.log(`Listening on port 8000`));

  // CORS error fix: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

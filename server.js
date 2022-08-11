const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { getAllProducts } = require("./handlers/productHandlers");
const { getUserDetails, addUser } = require("./handlers/userHandlers");
const { getUserCarts } = require("./handlers/basketHandlers");

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  })
  .use(cors())
  // CORS error fix: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

  // PRODUCT ENDPOINTS
  .get("/all-products", getAllProducts)

  // // CARTS ENDPOINTS
  .get("/carts/:user", getUserCarts) // local storage?
  // .patch("/carts/:user/add-item")
  // .delete("/carts/:user/delete-item") // remove item
  // .delete("/carts/:user/empty") // remove all items

  // // USER ENDPOINTS
  .get("/profile/:userId", getUserDetails) // get user details (e.g. searched products)
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

const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// -------------------------------------
// GET all products from this week's DB
// -------------------------------------
const getAllProducts = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("products");
    const iga = await db.collection("iga").find().toArray();
    const metro = await db.collection("metro").find().toArray();
    if (iga && metro) {
      res.status(200).json({ status: 200, data: [iga, metro] });
    } else {
      res.status(404).json({ status: 404, message: "Products not found" });
    }
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  } finally {
    await client.close();
  }
};

// -------------------------------------------------
// GET one product over multiple weeks' collections
// -------------------------------------------------
const getProductOverTime = async (req, res) => {
  const productName = req.params.product;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("products");
    const week1 = await db.collection("metro").findOne({ product_name: productName });
    const week2 = await db.collection("2022_08_11").findOne({ product_name: productName });
    const week3 = await db.collection("2022_08_18").findOne({ product_name: productName });
    const allItems = [week1, week2, week3];
    res
      .status(200)
      .json({ status: 200, data: allItems, message: "Successfully retrieved products" });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  } finally {
    await client.close();
  }
};

module.exports = { getAllProducts, getProductOverTime };

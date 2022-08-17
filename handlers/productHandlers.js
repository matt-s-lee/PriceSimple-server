const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// returns a list of all items
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

const getProductOverTime = async (req, res) => {
  const productName = req.params.product;
  console.log(productName);
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("products");
    const metro = await db.collection("metro").findOne({ product_name: productName });
    const thisWeeksProduce = await db
      .collection("2022_08_11")
      .findOne({ product_name: productName });
    const bothItems = [metro, thisWeeksProduce];
    res.status(200).json({ status: 200, data: bothItems, message: "something" });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  } finally {
    await client.close();
  }
};

module.exports = { getAllProducts, getProductOverTime };

const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;
const { v4: uuidv4 } = require("uuid");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getUserCart = async (req, res) => {
  const user = req.params.user;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("carts");
    const result = await db.collection("current_carts").findOne({ user });
    if (result) {
      res.status(200).json({ status: 200, data: result });
    } else {
      const cart = { _id: uuidv4(), userId: user };
      const result = await db.collection("current_carts").insertOne(cart);
      result.acknowledged === true
        ? res.status(200).json({ status: 200, data: cart, message: "empty cart created" })
        : res.status(400).json({ status: 400, message: "cart not added" });
    }
  } catch {
    res.status(500).json({ status: 500, message: "error" });
  } finally {
    await client.close();
  }
};

const addToCart = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("users");
    const result = await db.collection("user_carts").updateOne({});
  } catch {
  } finally {
    await client.close();
  }
};

module.exports = { getUserCart };

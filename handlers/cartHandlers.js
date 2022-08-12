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
    const result = await db.collection("current_carts").findOne({ userId: user });
    if (result) {
      res.status(200).json({ status: 200, data: result });
    } else {
      const cart = { _id: uuidv4(), userId: user, items: [] };
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

const addToCurrentCart = async (req, res) => {
  const userId = req.params.user;
  const body = req.body;
  console.log("USER", userId);
  console.log("BODY", body);

  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("carts");
    const result = await db
      .collection("current_carts")
      .updateOne(
        { userId, "items.productId": body.productId },
        { $set: { "items.$.quantity": body.quantity } }
      );
    console.log("RESULT", result);
    if (result.modifiedCount) {
      return res
        .status(200)
        .json({ status: 200, message: "Quantity of existing cart item updated" });
    } else if (!result.matchedCount) {
      const result = await db.collection("current_carts").updateOne(
        { userId },
        {
          $addToSet: {
            items: {
              productId: body.productId,
              quantity: body.quantity,
            },
          },
        }
      );
      console.log("RESULT2", result);
      result.modifiedCount
        ? res.status(200).json({ status: 200, message: "New item added to cart" })
        : res.status(400).json({ status: 400, message: "No items added or modified in cart" });
    }
  } catch {
    return res.status(500).json({ status: 500, message: "Error" });
  } finally {
    await client.close();
  }
};

module.exports = { getUserCart, addToCurrentCart };

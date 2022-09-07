const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;
const { v4: uuidv4 } = require("uuid");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// ------------------------
// GET user cart upon login
// ------------------------
const getUserCart = async (req, res) => {
  const user = req.params.user;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("carts");
    const result = await db.collection("current_carts").findOne({ userId: user });
    if (result) {
      res.status(200).json({ status: 200, data: result });

      // IF no cart found, create one for user
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

// ------------------------
// ADD item to user cart
// ------------------------
const addToCurrentCart = async (req, res) => {
  const userId = req.params.user;
  const body = req.body;

  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("carts");

    // Try to UPDATE cart first
    const result = await db
      .collection("current_carts")
      .updateOne(
        { userId, "items.productId": body.productId },
        { $set: { "items.$.quantity": body.quantity } }
      );
    if (result.modifiedCount) {
      return res
        .status(200)
        .json({ status: 200, message: "Quantity of existing cart item updated" });

      // IF item doesn't yet exist in cart, ADD new item
    } else if (!result.matchedCount) {
      const result = await db.collection("current_carts").updateOne(
        { userId },
        {
          $addToSet: {
            items: {
              productId: body.productId,
              quantity: body.quantity,
              product: body.product,
              soldByPackage: body.soldByPackage,
              soldByWeight: body.soldByWeight,
              soldIndividually: body.soldIndividually,
              store: body.store,
              imgSrc: body.imgSrc,
              link: body.link,
            },
          },
        }
      );
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

// --------------------------
// REMOVE item from user cart
// --------------------------
const removeItem = async (req, res) => {
  const userId = req.body.user;
  const item = req.body.item;

  if (userId && item) {
    const client = new MongoClient(MONGO_URI, options);
    try {
      await client.connect();
      const db = client.db("carts");
      //find shopping cart for user
      const result = await db
        .collection("current_carts")
        .updateOne({ userId }, { $pull: { items: { productId: item } } });
      if (result.modifiedCount) {
        res.status(200).json({
          status: 200,
          data: result,
          message: "item successfully deleted",
        });
      } else {
        res.status(40).json({
          status: 400,
          data: req.body,
          message: "no items deleted",
        });
      }
      // close the connection to the database server
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(422).json({ status: 422, data: req.body, message: "missing information" });
  }
};

module.exports = { getUserCart, addToCurrentCart, removeItem };

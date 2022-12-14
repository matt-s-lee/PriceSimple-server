const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// -------------------------
// CREATE new user profile
// -------------------------
const addUser = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const user = req.body;
  try {
    await client.connect();
    const db = client.db("users");
    const result = await db.collection("user_profiles").findOne({ _id: req.body._id });
    if (!result) {
      const result = await db.collection("user_profiles").insertOne(user);
      result.acknowledged === true
        ? res.status(200).json({ status: 200, data: user, message: "profile created" })
        : res.status(400).json({ status: 400, message: "error: no profile created" });
    } else {
      res
        .status(200)
        .json({ status: 200, message: "user already exists, no profile created" });
    }
  } catch {
    return res.status(500).json({ status: 500, message: "error" });
  } finally {
    await client.close();
  }
};

module.exports = { addUser };


const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getUserDetails = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("users");
    const user = await db.collection("user_profiles").findOne({ _id: req.params.userId });
    if (!user) {
      return res.status(404).json({ status: 404, message: "no user found" });
    } else {
      return res.status(200).json({ status: 200, data: user });
    }
  } catch (err) {
    return res.status(500).json({ status: 500, message: err });
  } finally {
    await client.close();
  }
};

const addUser = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const user = req.body;
  console.log("USER", user);
  try {
    await client.connect();
    console.log("connected");
    const db = client.db("users");
    console.log("db found");
    const result = await db.collection("user_profiles").findOne({ _id: req.body._id });
    if (!result) {
      const result = await db.collection("user_profiles").insertOne(user);
      console.log(result);
      result.acknowledged === true
        ? res.status(200).json({ status: 200, data: user, message: "profile created" })
        : res.status(400).json({ status: 400, message: "no profile created" });
    } else {
      res.status(400).json({ status: 400, message: "user already exists" });
    }
  } catch {
    return res.status(500).json({ status: 500, message: "error" });
  } finally {
    await client.close();
  }
};

module.exports = { getUserDetails, addUser };

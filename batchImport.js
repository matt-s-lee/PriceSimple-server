const fs = require("fs");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const metroData = fs.readFileSync("./metroItems.json");
const metroParsed = JSON.parse(metroData);

const batchImportFunc = async (dbName) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log("connected!");

    await db.collection("2022_08_18").insertMany(metroParsed);
  } catch (err) {
    console.log(err.message);
  } finally {
    // close the connection to the database server
    client.close();
    console.log("disconnected!");
  }
};

batchImportFunc("products");

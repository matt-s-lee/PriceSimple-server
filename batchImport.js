const fs = require("fs");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const igaData = fs.readFileSync("./data/igaItems.json");
const igaParsed = JSON.parse(igaData);
const metroData = fs.readFileSync("./data/metroItems.json");
const metroParsed = JSON.parse(metroData);

const batchImportFunc = async (dbName) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log("connected!");

    await db.collection("iga").insertMany(igaParsed);
    await db.collection("metro").insertMany(metroParsed);
  } catch (err) {
    console.log(err.message);
  } finally {
    // close the connection to the database server
    client.close();
    console.log("disconnected!");
  }
};

batchImportFunc("products");

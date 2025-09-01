const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv").config();
// const mongodb = require("mongodb");
// const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(process.env.MONGODB_URL);
const dbName = "evcelldb";
let db;
const app = express();
connectToDatabase();
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(dbName);
    app.locals.db = db;//n Express feature that attaches the db object to app.locals, making it available throughout your app.
    console.log("Database connected...");
    app.listen(process.env.PORT, () => {
      console.log("Server started at port number ..." + process.env.PORT);
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { app };

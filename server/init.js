const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Middleware
app.use(express.json());
app.use(require("cookie-parser")());

let server;

async function connectDbs() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URL);
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    console.log("MongoDB connected ✅");

    // Attach single DB
    const db = client.db("evcelldb");
    app.locals.db = db;

    console.log("✅ Connected to Database:", db.databaseName);

    // ✅ Create HTTP server BEFORE initializing socket.io
    server = http.createServer(app);

    // ✅ Initialize socket.io
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5175",
        credentials: true,
      },
    });

    app.locals.io = io;

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    // ✅ Start listening
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server started on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  }
}

connectDbs();

module.exports = { app, server };

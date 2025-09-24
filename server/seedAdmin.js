const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const axios =require("axios");
require("dotenv").config();

const MONGO_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "evcelldb";

async function seedAdmin() {
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const email = "admin@evcell.com";
    const password = "Admin@123"; // Ideally, don't hardcode in production
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await db.collection("Admin").findOne({ email });

    if (existing) {
      console.log("✅ Admin already exists:", existing.email);
    } else {
      await db.collection("Admin").insertOne({
        email,
        passwordHash,
        role: "admin",
        createdAt: new Date(),
      });
      console.log("🎉 Admin user created:", email);
    }
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await client.close();
  }
}

seedAdmin();

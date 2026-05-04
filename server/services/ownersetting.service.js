const { app } = require("../init.js");
const { ObjectId } = require("mongodb");


/**
 * Add new application
 */
async function addApplication(obj) {
  const db = app.locals.db;
  const collection = db.collection("StationApplications");
  return await collection.insertOne(obj);
}

/**
 * Get all applications
 */
async function getAllApplications() {
  const db = app.locals.db;
  return await db.collection("StationApplications").find().toArray();
}

/**
 * Get application by ID
 */
async function getApplicationById(id) {
  const db = app.locals.db;
  return await db.collection("StationApplications").findOne({ _id: new ObjectId(id) });
}

/**
 * Get application by station name
 */
async function getApplicationByStationName(stationName) {
  const db = app.locals.db;
  return await db.collection("StationApplications").findOne({ stationName });
}

/**
 * Get application by location
 */
async function getApplicationByLocation(location) {
  const db = app.locals.db;
  return await db.collection("StationApplications").findOne({ location });
}

/**
 * Get applications by state
 */
async function getApplicationsByState(state) {
  const db = app.locals.db;
  return await db.collection("StationApplications").find({ state }).toArray();
}


async function updateApplication(id, obj) {
  const db = app.locals.db;
  if (!db) throw new Error("Database not connected");
  const objectId = new ObjectId(id); 
  const collection = db.collection("StationApplications");
  delete obj._id;

  let query;
  try {
    query = { _id: new ObjectId(id) }; // Use this if _id in MongoDB is ObjectId
  } catch (err) {
    console.error("⚠️ Invalid ObjectId:", id);
    throw new Error("Invalid application ID");
  }

  const result = await collection.findOneAndUpdate(
    query,
    { $set: obj },
    { returnDocument: "after" }
  );
  console.log("result is :",result);
  if (!result.value) {
    console.error("⚠️ No document found for ID:", id);
    return null; // or throw new Error("Application not found");
  }

  console.log("✅ Updated application:", result.value);
  return result.value;
}

/**
 * Delete application
 */
async function deleteApplication(id) {
  const db = app.locals.db;
  return await db.collection("StationApplications").deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  addApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByStationName,
  getApplicationByLocation,
  getApplicationsByState,
  updateApplication,
  deleteApplication,
};

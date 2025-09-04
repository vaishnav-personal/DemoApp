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

/**
 * Update application
 */
async function updateApplication(id, obj) {
  const db = app.locals.db;
  const collection = db.collection("StationApplications");
  delete obj._id;
  return await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: obj }
  );
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

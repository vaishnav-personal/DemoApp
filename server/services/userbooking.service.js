const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

function getCollection() {
  const db = app.locals.db;
  return db.collection("Bookings");
}

async function getAllBooking() {
  const collection = getCollection();
  return await collection.find().toArray();
}

async function getBookingById(id) {
  const collection = getCollection();
  return await collection.findOne({ _id: ObjectId.createFromHexString(id) });
}

async function getBookingByStation(stationName) {
  const collection = getCollection();
  return await collection.find({ stationName }).toArray();
}

async function addBooking(obj) {
  const collection = getCollection();
  return await collection.insertOne(obj);
}

async function deleteBooking(id) {
  const collection = getCollection();
  return await collection.deleteOne({ _id: ObjectId.createFromHexString(id) });
}

// Check if slot already booked
async function isBooking(obj) {
  const collection = getCollection();
  return await collection.findOne({
    stationName: obj.stationName,
    chargerType: obj.chargerType,
    batteryType: obj.batteryType,
    date: obj.date,
    time: obj.time,
    isbooked: true,
  });
}

module.exports = {
  getAllBooking,
  getBookingById,
  getBookingByStation,
  addBooking,
  deleteBooking,
  isBooking,
};

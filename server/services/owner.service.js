const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllOwners() {
  const db = app.locals.db;

  const collection = db.collection("StationOwners");

  let list = await collection.find().toArray();

  return list;
}
async function getOwnerById(id) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  const OwnerObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return OwnerObj;

  // let obj = await Owner.findById(id);
  // return obj;
}
async function getOwnerByEmailId(emailId) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  const OwnerObj = await collection.findOne({
    emailId: emailId,
  });
  if (OwnerObj) {
    return OwnerObj;;
  } else {
    return { result: "failed" };
  }
  
}
async function checkOwner(obj) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  const  OwnerObj= await collection.findOne({
    emailId: obj.emailId,
  });
  return OwnerObj ;
}
async function checkOwnerTryingToLogIn(obj) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  const  OwnerObj= await collection.findOne({
    emailId: obj.emailId,
  });
  return OwnerObj;
}
async function addOwner(obj) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  let response = await collection.insertOne(obj);
  return obj;
}
async function updateOwner(obj) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  let id = obj._id;
  delete obj._id;
  if (obj.status == "forgotPassword") {
    obj.password = "";
  }
  obj = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return obj;
}
async function deleteOwner(id) {
  const db = app.locals.db;
  const collection = db.collection("StationOwners");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
module.exports = OwnerService = {
  getAllOwners,
  getOwnerById,
  getOwnerByEmailId,
  checkOwner,
  checkOwnerTryingToLogIn,
  addOwner,
  updateOwner,
  deleteOwner,
};

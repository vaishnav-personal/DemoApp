const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllUsers() {
  const db = app.locals.db;
  const collection = db.collection("users");
  let list = await collection.find().toArray();

  return list;
}
async function getUserById(id) {
  const db = app.locals.db;
  const collection = db.collection("users");
  const userObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return userObj;

  // let obj = await User.findById(id);
  // return obj;
}
async function getUserByEmailId(emailId) {
  const db = app.locals.db;
  const collection = db.collection("users");
  const userObj = await collection.findOne({
    emailId: emailId,
  });
  if (userObj) {
    return { result: "success" };
  } else {
    return { result: "failed" };
  }
  // return userObj;
}
async function checkUser(obj) {
  const db = app.locals.db;
  const collection = db.collection("users");
  const userObj = await collection.findOne({
    emailId: obj.emailId,
  });
  return userObj;
}
async function checkUserTryingToLogIn(obj) {
  const db = app.locals.db;
  const collection = db.collection("users");
  const userObj = await collection.findOne({
    emailId: obj.emailId,
  });
  return userObj;
}
async function addUser(obj) {
  const db = app.locals.db;
  const collection = db.collection("users");
  let response = await collection.insertOne(obj);
  return obj;
}
async function updateUser(obj) {
  const db = app.locals.db;
  const collection = db.collection("users");
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
async function deleteUser(id) {
  const db = app.locals.db;
  const collection = db.collection("users");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
module.exports = UserService = {
  getAllUsers,
  getUserById,
  getUserByEmailId,
  checkUser,
  checkUserTryingToLogIn,
  addUser,
  updateUser,
  deleteUser,
};

const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllRoles() {
  const db = app.locals.db;

  const collection = db.collection("roles");

  let list = await collection.find().toArray();

  return list;
}
async function getRoleById(id) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  const roleObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  console.log(roleObj);

  return roleObj;
}
async function addRole(obj) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  // normalize text
  const keys = Object.keys(obj);
  for (let key of keys) {
    if (typeof obj[key] == "string") {
      obj[key] = normalizeNewlines(obj[key]);
    }
  }
  let result = await collection.insertOne(obj);
  obj._id = result.insertedId;
  return obj;
}
async function addManyRoles(roles) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  const result = await collection.insertMany(roles);
  const insertedIds = Object.values(result.insertedIds);
  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();
  return insertedDocs;
}
async function updateManyRoles(roles) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  // Prepare bulk operations
  const operations = roles.map((role) => {
    const { _id, ...fieldsToUpdate } = role;
    return {
      updateOne: {
        filter: { _id: ObjectId.createFromHexString(_id) },
        update: { $set: fieldsToUpdate },
      },
    };
  });
  const result = await collection.bulkWrite(operations);
  const updatedIds = roles.map((p) => ObjectId.createFromHexString(p._id));

  const updatedRoles = await collection
    .find({ _id: { $in: updatedIds } })
    .toArray();
  return updatedRoles;
}
async function updateRole(obj) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  let id = obj._id;
  delete obj._id;
  let result = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return result;
}
async function deleteRole(id) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
normalizeNewlines = (text) => {
  return text.replace(/\r\n/g, "\n");
};
module.exports = RoleService = {
  getAllRoles,
  getRoleById,
  addRole,
  addManyRoles,
  updateManyRoles,
  updateRole,
  deleteRole,
};

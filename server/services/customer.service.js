const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllCustomers() {
  const db = app.locals.db;

  const collection = db.collection("customers");

  let list = await collection.find().toArray();

  return list;
}
async function getCustomerById(id) {
  const db = app.locals.db;
  const collection = db.collection("customers");
  const customerObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  console.log(customerObj);

  return customerObj;
}
async function addCustomer(obj) {
  const db = app.locals.db;
  const collection = db.collection("customers");
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
async function addManyCustomers(customers) {
  const db = app.locals.db;
  const collection = db.collection("customers");
  const result = await collection.insertMany(customers);
  const insertedIds = Object.values(result.insertedIds);
  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();
  return insertedDocs;
}
async function updateManyCustomers(customers) {
  const db = app.locals.db;
  const collection = db.collection("customers");
  // Prepare bulk operations
  const operations = customers.map((customer) => {
    const { _id, ...fieldsToUpdate } = customer;
    return {
      updateOne: {
        filter: { _id: ObjectId.createFromHexString(_id) },
        update: { $set: fieldsToUpdate },
      },
    };
  });
  const result = await collection.bulkWrite(operations);
  const updatedIds = customers.map((p) => ObjectId.createFromHexString(p._id));

  const updatedCustomers = await collection
    .find({ _id: { $in: updatedIds } })
    .toArray();
  return updatedCustomers;
}
async function updateCustomer(obj) {
  const db = app.locals.db;
  const collection = db.collection("customers");
  let id = obj._id;
  delete obj._id;
  let result = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return result;
}
async function deleteCustomer(id) {
  const db = app.locals.db;
  const collection = db.collection("customers");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
normalizeNewlines = (text) => {
  return text.replace(/\r\n/g, "\n");
};
module.exports = CustomerService = {
  getAllCustomers,
  getCustomerById,
  addCustomer,
  addManyCustomers,
  updateManyCustomers,
  updateCustomer,
  deleteCustomer,
};

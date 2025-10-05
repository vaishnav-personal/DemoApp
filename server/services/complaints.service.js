const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllComplaints() {
  const db = app.locals.db;

  const collection = db.collection("Complaints");
  let list = await collection.find().toArray();
  return list;
}

async function getComplaintsById(id) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");
  const ComplaintsObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return ComplaintsObj;

  // let obj = await Owner.findById(id);
  // return obj;
}
async function getComplaintsByEmailId(emailId) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");
  const ComplaintsObj = await collection.findOne({
    emailId: emailId,
  });
  if (ComplaintsObj) {
    return ComplaintsObj;;
  } else {
    return { result: "failed" };
  }
  
}
async function checkComplaints(obj) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");
  const  ComplaintsObj= await collection.findOne({
    emailId: obj.emailId,
  });
  return ComplaintsObj ;
}

async function addComplaints(obj) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");
  await collection.insertOne(obj);
  console.log("Complaint added:", obj);
  return { success: true, complaint: obj };
}


async function updateComplaints(obj) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");
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
async function deleteComplaints(id) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}

async function isComplaintFulfilled(id) {
  const db = app.locals.db;
  const collection = db.collection("Complaints");

  const complaint = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  if (!complaint) {
    return { success: false, message: "Complaint not found" };
  }

  // Check the "status" field
  if (complaint.status && complaint.status.toLowerCase() === "fulfilled") {
    return { success: true, fulfilled: true, complaint };
  } else {
    return { success: true, fulfilled: false, complaint };
  }
}

module.exports = {
  getAllComplaints,
  getComplaintsById,
  getComplaintsByEmailId,
  checkComplaints,
  addComplaints,
  updateComplaints,
  deleteComplaints,
  isComplaintFulfilled,  
};


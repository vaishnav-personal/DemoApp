const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const OwnerService = require("../services/owner.service");
const multer = require("multer");
const logger = require("../logger");
const ms = require("ms");
const { ObjectId } = require("mongodb");
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
router.get("/", allowToAdminOnly, async (req, res) => {
  try {
    let list = await OwnerService.getAllOwners();
    res.status(200).json(list);
  } catch (error) {
    next(error); // Send error to middleware
  }
});


// /owner/hello

router.get("/hello", requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;

    // ✅ Fetch owner from Owners collection
    const owner = await db.collection("Owners").findOne(
      { _id: new ObjectId(req.tokenData._id) },
      { projection: { password: 0 } }
    );

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }
    console.log("owner:" , owner);

    // ✅ Fetch application for this owner
    const application = await db.collection("Owners").findOne({
      emailId: owner.emailId,
    });
    console.log("application:" , application);

    if (!application) {
      return res.json({
        email: owner.email,
        role: "owner",
        status: "none", // no application submitted yet
      });
    }

    // ✅ Return combined response
    console.log("sending owner:" , application)
    return res.json({
      email: owner.email,
      role: "owner",
      status: application.status, // pending | approved | rejected | hold
      appliedAt: application.createdAt,
    });
  } catch (err) {
    console.error("Hello route error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});





router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    res.send(await OwnerService.getOwnerById(id));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/byEmailId/:emailId", async (req, res, next) => {
  try {
    let emailId = req.params.emailId;
    res.status(200).json(await OwnerService.getOwnerByEmailId(emailId));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post("/",allowToAdminOnly,
  upload.single("file"),
  async (req, res, next) => {
    try {
      let obj = req.body;
      obj.password = "";
      obj.addDate = new Date();
      obj.updateDate = new Date();
      obj = await OwnerService.addOwner(obj);
      res.status(201).json(obj);
    } catch (error) {
      next(error); // Send error to middleware
    }
  }
);

router.post("/signup", async (req, res) => {
  try {
    const { name, emailId, password} = req.body;
    console.log(emailId);
    const db = req.app.locals.db;
    
    const existing = await db.collection("Owners").findOne({ emailId: emailId });
    if (existing) {
      
      return res.status(409).json({ message: "Email already exists" });
    }
    
    const newOwner = {
      name,
      emailId: emailId,
      password,
      role: "owner",
      hasApplied: false,
      status: "new",
      createdAt: new Date(),
    };

    const result = await db.collection("Owners").insertOne(newOwner);
    console.log(result);
    const token = jwt.sign(
      { _id: result.insertedId.toString(), role: newOwner.role, email: emailId },
      process.env.SECRET_KEY || "dev_secret",
      { expiresIn: process.env.JWT_EXPIRY || "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: ms(process.env.JWT_EXPIRY || "1d"),
    });

    res.status(201).json({
      message: "Signup successful",
      owner: { ...newOwner, _id: result.insertedId, password: undefined },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.post("/signout", async (req, res, next) => {
  // delete the token
  try {
    res.clearCookie("token"); //
    res.status(200).json({ result: "Signed out" });
  } catch (error) {
    next(error); // Send error to middleware
  }
});
/*
Use 400 if request is missing/invalid.
Use 401 if the client didn’t provide valid authentication.
Use 403 if they’re authenticated but don’t have permission.
Use 404 if the thing they’re looking for doesn’t exist.
Use 409 for duplicate/unique constraint errors.
Use 422 for validation errors.
*/

// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const db = req.app.locals.db;

    const owner = await db.collection("Owners").findOne({ emailId: emailId });
    if (!owner) return res.status(401).json({ error: "Wrong email" });
    if (owner.password !== password) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign(
      { _id: owner._id.toString(), role: owner.role, email: emailId },
      process.env.SECRET_KEY || "dev_secret",
      { expiresIn: process.env.JWT_EXPIRY || "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: ms(process.env.JWT_EXPIRY || "1d"),
    });

    res.status(200).json({
      message: "Logged in successfully",
      owner: { ...owner, password: undefined },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.put(
  "/",
  allowToAdminOnly,
  upload.single("file"),
  async (req, res, next) => {
    try {
      let obj = req.body;
      obj.updateDate = new Date();
      obj = await OwnerService.updateOwner(obj);
      res.status(200).json(obj);
    } catch (error) {
      next(error); // Send error to middleware
    }
  }
);
router.delete("/:id", allowToAdminOnly, async (req, res, next) => {
  try {
    let id = req.params.id;
    obj = await OwnerService.deleteOwner(id);
    res.json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});




function requireAuth(req, res, next) {
  const token = req.cookies?.token; // assuming you set cookie in login
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.tokenData = decoded; // attach user data to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}


function allowToAdminOnly(req, res, next) {
  if (!req.tokenData) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.tokenData.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}

module.exports = router;

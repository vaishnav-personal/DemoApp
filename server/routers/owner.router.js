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


router.get("/hello", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let tokenData;
    try {
      tokenData = jwt.verify(token, process.env.SECRET_KEY || "dev_secret");
    } catch (err) {
      console.error("JWT verify failed:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("Decoded token in /hello:", tokenData);

    const db = req.app.locals.db; // ✅ MongoClient database
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    if (!tokenData._id) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    let owner;
    try {
      owner = await db
        .collection("StationOwners")
        .findOne({ _id: new ObjectId(tokenData._id) }, { projection: { password: 0 } });
    } catch (e) {
      console.error("ObjectId conversion failed:", e.message);
      return res.status(400).json({ error: "Invalid ObjectId" });
    }

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    res.status(200).json(owner);
  } catch (error) {
    console.error("Hello route error:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
router.post("/signup", async (req, res, next) => {
  try {
    let obj = req.body;
    let OwnerObj = await OwnerService.checkOwner(obj);
    if (!OwnerObj) {
      // Owner is not registered, add to database with role as Owner
      obj.role = "Owner";
      OwnerService.addOwner(obj);
      res.status(201).json({ message: "Signup Operation Successful" });
    } //if
    else {
      res.status(409).json({ error: "This emailid is already registered" });
    }
    console.log("SECRET_KEY exists:", !!process.env.SECRET_KEY);
console.log("JWT_EXPIRY:", process.env.JWT_EXPIRY);

  } catch (error) {
    //try
    next(error); // Send error to middleware
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
    const db = req.db || req.app.locals.db;

    const OwnerObj = await OwnerService.checkOwnerTryingToLogIn({ emailId });
    if (!OwnerObj) return res.status(401).json({ error: "Wrong emailId" });
    if (OwnerObj.password !== password) return res.status(401).json({ error: "Wrong password" });
    // let settingsOwner={};
    // settingsOwner.state="noSubmission";

    const token = jwt.sign(
  { _id: OwnerObj._id.toString(), role: OwnerObj.role },
  process.env.SECRET_KEY || "dev_secret",
  { expiresIn: process.env.JWT_EXPIRY || "1h" }
);

    console.log("SECRET_KEY exists:", !!process.env.SECRET_KEY);
console.log("JWT_EXPIRY:", process.env.JWT_EXPIRY);


    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set true only in production HTTPS
      sameSite: "Lax",
      maxAge: ms(process.env.JWT_EXPIRY || "1d"),
    });

    res.status(200).json({
      message: "Logged in successfully",
      owner: { ...OwnerObj, password: undefined },
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






function allowToAdminOnly(req, res, next) {
  if (
    !req.tokenData ||
    req.tokenData.role == "guest" ||
    req.tokenData.role == "Owner"
  ) {
    // assuming you set req.Owner after authentication
    res.status(401).json({ message: "Unauthorized" });
  } else if (req.tokenData.role == "admin") {
    next(); // allow
  } else {
    res.status(401).json({ message: "OOPs...Some Error.." });
  }
}
module.exports = router;

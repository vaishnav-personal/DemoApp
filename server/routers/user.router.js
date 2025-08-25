const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const UserService = require("../services/user.service");
const multer = require("multer");
const logger = require("../logger");
const ms = require("ms");
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
    let list = await UserService.getAllUsers();
    res.status(200).json(list);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/hello", async (req, res, next) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      res.status(200).json("");
    } else {
      jwt.verify(token, process.env.SECRET_KEY, (err, tokenData) => {
        if (err) {
          next(err);
          return;
        } else {
          res.status(200).json(tokenData);
        }
      });
    }
    // let list = await StudentService.getAllStudents();
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    res.send(await UserService.getUserById(id));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/byEmailId/:emailId", async (req, res, next) => {
  try {
    let emailId = req.params.emailId;
    res.status(200).json(await UserService.getUserByEmailId(emailId));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post(
  "/",

  allowToAdminOnly,
  upload.single("file"),
  async (req, res, next) => {
    try {
      let obj = req.body;
      obj.password = "";
      obj.addDate = new Date();
      obj.updateDate = new Date();
      obj = await UserService.addUser(obj);
      res.status(201).json(obj);
    } catch (error) {
      next(error); // Send error to middleware
    }
  }
);
router.post("/signup", async (req, res, next) => {
  try {
    let obj = req.body;
    let userObj = await UserService.checkUser(obj);
    if (!userObj) {
      // user is not registered, add to database with role as user
      obj.role = "user";
      UserService.addUser(obj);
      res.status(201).json({ message: "Signup Operation Successful" });
    } //if
    else {
      res.status(409).json({ error: "This emailid is already registered" });
    }
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
router.post("/login", async (req, res, next) => {
  try {
    let obj = req.body;
    // initially password of new user is empty
    let userObj = await UserService.checkUserTryingToLogIn(obj);
    if (!userObj) {
      // No such user
      res.status(409).json({ error: "Wrong emailId" });
    } else if (userObj.status == "disabled") {
      res.status(403).json({ error: "Contact Admin." });
    } else if (userObj.password == "") {
      //First time login by user, he/she needs to signup first
      res.status(403).json({ error: "Signup First" });
    } else if (userObj.password != obj.password) {
      // wrong password
      res.status(403).json({ error: "Wrong password" });
    } else if (userObj.password === obj.password) {
      // send user to client
      userObj.password = "...";
      console.log(
        "Logged in success.. " + userObj.emailId + " " + userObj.role
      );
      // if successful login, assign token
      const token = jwt.sign(userObj, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Set to true in production with HTTPS
        sameSite: "Lax",
        maxAge: ms(process.env.JWT_EXPIRY),
      });
      res
        .status(201)
        .json({ user: userObj, message: "Logged in Successfully" });
    }
  } catch (error) {
    next(error); // Send error to middleware
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
      obj = await UserService.updateUser(obj);
      res.status(200).json(obj);
    } catch (error) {
      next(error); // Send error to middleware
    }
  }
);
router.delete("/:id", allowToAdminOnly, async (req, res, next) => {
  try {
    let id = req.params.id;
    obj = await UserService.deleteUser(id);
    res.json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
//================
function allowToAdminOnly(req, res, next) {
  if (
    !req.tokenData ||
    req.tokenData.role == "guest" ||
    req.tokenData.role == "user"
  ) {
    // assuming you set req.user after authentication
    res.status(401).json({ message: "Unauthorized" });
  } else if (req.tokenData.role == "admin") {
    next(); // allow
  } else {
    res.status(401).json({ message: "OOPs...Some Error.." });
  }
}
module.exports = router;

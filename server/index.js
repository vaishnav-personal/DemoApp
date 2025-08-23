const express = require("express");
var cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { app } = require("./init.js");
var cors = require("cors");
const authenticateUser = require("./authenticateUser.js");
const productRouter = require("./routers/product.router.js");
const customerRouter = require("./routers/customer.router.js");
const userRouter = require("./routers/user.router.js");
const roleRouter = require("./routers/role.router.js");
const categoryRouter = require("./routers/category.router.js");
const fileRouter = require("./routers/file.router.js");
const specialRouter = require("./routers/special.router.js");
const logger = require("./logger");
const errorLogger = require("./errorLogger");
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
); // allow cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
// Activity logging middleware

app.use(authenticateUser);
app.use(logActivity);

app.use("/specials", specialRouter); // authentication not required
app.use("/users", userRouter); // authentication done inside this file
app.use("/products", productRouter);
app.use("/customers", customerRouter);
app.use("/roles", roleRouter);
app.use("/categories", categoryRouter);
app.use("/files", fileRouter);
app.use("/uploadedImages", express.static("uploads"));
app.use(errorLogger); // This should be the last middleware.
function logActivity(req, res, next) {
  let log;
  if (req.role == "Forbidden") {
    log =
      `Forbidden operation -->` + req.method + "--->" + req.baseUrl.slice(1);
    logger.warn(log);
    return res.sendStatus(403);
  } else if (req.role == "guest") {
    if (req.method == "GET") {
      log = `Guest -->` + req.method + "--->" + req.baseUrl.slice(1);
    }
  } else if (req.tokenData.role == "user" || req.tokenData.role == "admin") {
    log =
      req.tokenData.role +
      "(" +
      req.tokenData.name +
      ")" +
      "-->" +
      req.method +
      "--->" +
      req.baseUrl +
      req.path;
  }
  logger.warn(log);
  next();
}

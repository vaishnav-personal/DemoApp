const path = require("path");//It provides utilities for working with file and directory paths.
const winston = require("winston");//logging libraries for Node.js.
const DailyRotateFile = require("winston-daily-rotate-file");//It automatically rotates log files daily (or by size).

const logFormat = winston.format.printf(({ level, message }) => {
  const istTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return `${istTime} — [${level.toUpperCase()}] — ${message}`;
});

const infoTransport = new DailyRotateFile({
  filename: path.join(__dirname, "logs", "activity-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "info",
  zippedArchive: false,
  maxFiles: "14d",
});

const errorTransport = new DailyRotateFile({
  filename: path.join(__dirname, "logs", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  zippedArchive: false,
  maxFiles: "30d",
});

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [infoTransport, errorTransport],
});

module.exports = logger;

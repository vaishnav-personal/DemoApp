const mongoose = require("mongoose");
let categorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
  },
  { timestamps: true }
);
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const marksSchema = new Schema({
  name: { type: String, required: true },
  marks: { type: Array, default: [] },
  user: { type: mongoose.Schema.Types.ObjectId, refPath: "User" },
});

const Marks = mongoose.model("marks", marksSchema);
module.exports = Marks;

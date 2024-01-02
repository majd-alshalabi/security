const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, refPath: "User" },
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;

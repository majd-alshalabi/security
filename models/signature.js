const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const signatureSchema = new Schema({
  signature: { type: String, required: true },
  key: { type: String, required: true },
  marksId: { type: mongoose.Schema.Types.ObjectId, ref: "Marks" },
});

const Signature = mongoose.model("signature", signatureSchema);
module.exports = Signature;

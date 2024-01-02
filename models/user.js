const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passNumber: { type: String, required: true },
  phoneNumber: String,
  telephoneNumber: String,
  isAdmin: { type: Boolean, default: false },
  sessionKey: { type: String, required: false },
  publicKey: { type: String, required: false },
});

userSchema.methods.makeUserJwtToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    "jwtPrivateKey"
  );
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;

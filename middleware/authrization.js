const { model, models } = require("mongoose");
const Utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  try {
    const decoded = jwt.verify(token, "jwtPrivateKey");
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      Utils.returnResponse(
        {
          message: "invalid token",
          statusCode: 400,
        },
        res
      );
    } else {
      if (user.isAdmin) {
        next();
        return;
      }
    }
    throw "invalid token";
  } catch (e) {
    Utils.returnResponse(
      {
        message: "invalid token",
        statusCode: 400,
      },
      res
    );
  }
};

const { model, models } = require("mongoose");
const Utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    Utils.returnResponse(
      {
        message: "auth token is not provided",
        statusCode: 401,
      },
      res
    );
  } else {
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
      }
      req.user = user;
      next();
    } catch (e) {
      Utils.returnResponse(
        {
          message: "invalid token",
          statusCode: 400,
        },
        res
      );
    }
  }
};

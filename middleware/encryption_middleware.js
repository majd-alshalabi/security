const EncryptionUtils = require("../utils/encryption_utils");
const Utils = require("../utils/utils");

module.exports = function (req, res, next) {
  try {
    req.body = EncryptionUtils.decryptRequest(
      req.body.data,
      req.user.passNumber
    );
    next();
  } catch (e) {
    Utils.returnResponse(
      {
        message: "encryption error",
        statusCode: 400,
      },
      res
    );
  }
};

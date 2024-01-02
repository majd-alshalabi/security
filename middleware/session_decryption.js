const EncryptionUtils = require("../utils/encryption_utils");
const Utils = require("../utils/utils");

module.exports = function (req, res, next) {
  try {
    req.body = EncryptionUtils.decryptRequest(
      req.body.data,
      req.user.sessionKey
    );
    next();
  } catch (e) {
    Utils.returnResponse(
      {
        message: e.message,
        statusCode: 400,
      },
      res
    );
  }
};

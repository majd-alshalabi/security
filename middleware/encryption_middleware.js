const EncryptionUtils = require("../utils/encryption_utils");
const Utils = require("../utils/utils");

module.exports = function (req, res, next) {
  try {
    console.log("DSagsdag");

    req.body = EncryptionUtils.decryptRequest(
      req.body.data,
      req.user.passNumber
    );
    console.log(req.body);
    console.log("DSagsdag");
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

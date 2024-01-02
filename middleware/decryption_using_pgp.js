const PGPEncryptionUtils = require("../utils/pgp_encryption_utils");
const Utils = require("../utils/utils");

module.exports = async function (req, res, next) {
  try {
    req.body = await PGPEncryptionUtils.decryptMessage(req.body.data);
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

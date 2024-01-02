const express = require("express");
const auth = require("../middleware/auth");
const decryption = require("../middleware/encryption_middleware");
const Joi = require("joi");
const Utils = require("../utils/utils");
const CAUtils = require("../utils/ca_utils");
const router = express.Router();
////
router.post("/verify_ca", [auth], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        ca: Joi.string().required(),
        publicKey: Joi.string().required(),
      },
      callback: async () => {
        Utils.returnResponse(
          {
            message: "verify done",
            statusCode: 200,
            data: CAUtils.verifyCACertificate(req.body.ca, req.body.publicKey),
          },
          res
        );
        try {
        } catch (e) {
          console.log(e);
          Utils.returnResponse({ message: e.message, statusCode: 400 }, res);
        }
      },
    },
    req,
    res
  );
});

module.exports = router;

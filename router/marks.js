const express = require("express");
const auth = require("../middleware/auth");
const authrization = require("../middleware/authrization");
const decryption = require("../middleware/session_decryption");

var _ = require("lodash");
const Joi = require("joi");
const Utils = require("../utils/utils");
const EncryptionUtils = require("../utils/encryption_utils");
const PGPEncryptionUtils = require("../utils/pgp_encryption_utils");
const Marks = require("../models/marks");
const Signature = require("../models/signature");
const User = require("../models/user");
const router = express.Router();

router.post("/", [auth, authrization, decryption], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        name: Joi.string().required(),
        marks: Joi.array().required(),
        sign: Joi.string().required(),
      },
      callback: async () => {
        try {
          console.log(req.user._id);
          let marks = new Marks({
            marks: req.body.marks,
            name: req.body.name,
            user: req.user._id,
          });
          await marks.save();
          const user = await User.findOne({ _id: req.user._id });
          let signatureSchema = new Signature({
            signature: req.body.sign,
            marksId: marks._id,
            key: user.publicKey,
          });
          signatureSchema.save();
          Utils.returnResponse(
            {
              data: EncryptionUtils.encryptResponse(
                {
                  data: {
                    marks: marks,
                  },
                },
                req.user.sessionKey
              ),
              message: "add marks done successfully",
              statusCode: 200,
            },
            res
          );
        } catch (e) {
          Utils.returnResponse({ message: e.message, statusCode: 400 }, res);
        }
      },
    },
    req,
    res
  );
});

////
router.post("/verify", [auth, decryption], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        id: Joi.string().required(),
      },
      callback: async () => {
        try {
          let marks = await Marks.findOne({ _id: req.body.id });
          if (marks != null) {
            const signature = await Signature.findOne({ marksId: marks._id });
            const verify = await PGPEncryptionUtils.verify({
              signature: signature.signature,
              key: signature.key,
            });
            Utils.returnResponse(
              {
                data: EncryptionUtils.encryptResponse(
                  {
                    data: {
                      verify: verify,
                    },
                  },
                  req.user.sessionKey
                ),
                message: "verify marks done successfully",
                statusCode: 200,
              },
              res
            );
          } else {
            Utils.returnResponse(
              {
                message: "no such marks",
                statusCode: 400,
              },
              res
            );
          }
        } catch (e) {
          Utils.returnResponse({ message: e.message, statusCode: 400 }, res);
        }
      },
    },
    req,
    res
  );
});

router.get("/", [auth], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {},
      callback: async () => {
        try {
          let marks = await Marks.find().exec();
          Utils.returnResponse(
            {
              data: EncryptionUtils.encryptResponse(
                {
                  data: {
                    marks: marks,
                  },
                },
                req.user.passNumber
              ),
              message: "get done successfully",
              statusCode: 200,
            },
            res
          );
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

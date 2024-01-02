const express = require("express");
const auth = require("../middleware/auth");
const decryption = require("../middleware/encryption_middleware");
const sessionDecryption = require("../middleware/session_decryption");
const decryptionPGP = require("../middleware/decryption_using_pgp");

var _ = require("lodash");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/user");
const Utils = require("../utils/utils");
const EncryptionUtils = require("../utils/encryption_utils");
const PGPEncryptionUtils = require("../utils/pgp_encryption_utils");
const Project = require("../models/project");
const router = express.Router();

router.post("/handshake", [auth, decryption], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        clientPublicKey: Joi.string().required(),
      },
      callback: async () => {
        try {
          const user = await User.findOne({ _id: req.user._id });
          user.publicKey = req.body.clientPublicKey;
          await user.save();
          Utils.returnResponse(
            {
              data: EncryptionUtils.encryptResponse(
                {
                  data: {
                    user: _._.pick(user, [
                      "name",
                      "_id",
                      "isAdmin",
                      "passNumber",
                      "phoneNumber",
                      "telephoneNumber",
                      "publicKey",
                    ]),
                    serverPublicKey: PGPEncryptionUtils.serverPublicKey,
                  },
                },
                user.passNumber
              ),
              message: "handshake done successfully",
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

router.post("/generate-session-key", [auth, decryptionPGP], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        sessionKey: Joi.string().required(),
      },
      callback: async () => {
        try {
          const user = await User.findOne({ _id: req.user._id });
          user.sessionKey = req.body.sessionKey;
          await user.save();
          Utils.returnResponse(
            {
              data: EncryptionUtils.encryptResponse(
                {
                  data: {
                    sessionKey: req.body.sessionKey,
                  },
                },
                user.passNumber
              ),
              message: "session key received",
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
/////
router.post("/add_projects", [auth, sessionDecryption], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        names: Joi.array().required(),
      },
      callback: async () => {
        try {
          await req.body.names.forEach(async (element) => {
            const project = new Project({
              name: element,
              status: true,
              userId: req.user._id,
            });
            await project.save();
          });

          Utils.returnResponse(
            {
              message: "projects added successfully",
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

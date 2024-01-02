const express = require("express");
const auth = require("../middleware/auth");
const decryption = require("../middleware/encryption_middleware");

var _ = require("lodash");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/user");
const Utils = require("../utils/utils");
const EncryptionUtils = require("../utils/encryption_utils");
const router = express.Router();

router.post("/register", (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        name: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).required(),
        passNumber: Joi.string().length(16),
        isAdmin: Joi.boolean().required(),
      },
      callback: async () => {
        try {
          const newUser = new User({
            ...req.body,
            password: await Utils.encryptUserPassword({
              password: req.body.password,
            }),
          });
          const user = await newUser.save();
          const token = user.makeUserJwtToken();
          Utils.returnResponse(
            {
              message: "user added successfully",
              statusCode: 200,
              data: {
                user: _._.pick(user, [
                  "name",
                  "_id",
                  "isAdmin",
                  "passNumber",
                  "phoneNumber",
                  "telephoneNumber",
                ]),
                token: token,
              },
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

router.post("/login", (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        name: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).required(),
      },
      callback: async () => {
        try {
          const { name, password } = req.body;
          const user = await User.findOne({ name: name });
          if (!user) {
            Utils.returnResponse(
              {
                message: "name or password is not correct",
                statusCode: 400,
              },
              res
            );
          } else {
            if (
              !(await Utils.comparePassword({
                hashedPassword: user.password,
                requestPassword: password,
              }))
            ) {
              Utils.returnResponse(
                {
                  message: "name or password is not correct",
                  statusCode: 400,
                },
                res
              );
            } else {
              const token = user.makeUserJwtToken();
              Utils.returnResponse(
                {
                  message: "user logged in successfully",
                  statusCode: 200,
                  data: {
                    user: _.pick(user, [
                      "name",
                      "_id",
                      "isAdmin",
                      "passNumber",
                      "phoneNumber",
                      "telephoneNumber",
                    ]),
                    token: token,
                  },
                },
                res
              );
            }
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
////
router.post("/update", [auth, decryption], (req, res) => {
  Utils.initRequestFunction(
    {
      validationRules: {
        telephoneNumber: Joi.allow(),
        phoneNumber: Joi.allow(),
        name: Joi.allow(),
      },
      callback: async () => {
        try {
          const user = await User.findOne({ _id: req.user._id });
          user.telephoneNumber = req.body.telephoneNumber;
          user.phoneNumber = req.body.phoneNumber;
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
                    ]),
                  },
                },
                user.passNumber
              ),
              message: "user added successfully",
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

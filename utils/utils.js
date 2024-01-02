const Joi = require("joi");
const bcrypt = require("bcrypt");
class Utils {
  static returnResponse({ statusCode, message, data = null }, res) {
    res.status(statusCode).send({
      status: statusCode,
      message: message,
      data: data,
    });
  }
  static uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  static initRequestFunction({ validationRules, callback }, req, res) {
    try {
      const schema = Joi.object(validationRules);
      const { error } = schema.validate(req.body);
      if (error) {
        this.returnResponse(
          { message: error.details[0].message, statusCode: 400 },
          res
        );
      } else {
        callback();
      }
    } catch (e) {
      this.returnResponse({ message: e.message, statusCode: 400 }, res);
    }
  }

  static async encryptUserPassword({ password }) {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }
  static async comparePassword({ hashedPassword, requestPassword }) {
    try {
      const res = await bcrypt.compare(requestPassword, hashedPassword);
      return res;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Utils;

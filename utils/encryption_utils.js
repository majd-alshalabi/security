const crypto = require("crypto");
module.exports = class EncryptionUtils {
  static decryptRequest(data, passNumber, jsonRes = true) {
    const decipher = crypto.createDecipheriv(
      "aes-128-ecb",
      Buffer.from(passNumber),
      null
    );
    let decryptedData = decipher.update(data, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    if (jsonRes) return JSON.parse(decryptedData);
    else return decryptedData;
  }
  static encryptResponse(data, passNumber) {
    const jsonString = JSON.stringify(data);
    const cipher = crypto.createCipheriv(
      "aes-128-ecb",
      Buffer.from(passNumber),
      null
    );
    let encryptedData = cipher.update(jsonString, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
  }
};

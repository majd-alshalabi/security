const openpgp = require("openpgp");
module.exports = class PGPEncryptionUtils {
  static serverPublicKey;
  static serverPrivateKey;

  static generateServerKeyPair = async () => {
    const { privateKey, publicKey } = await openpgp.generateKey({
      userIDs: [{ name: "Server", email: "server@gmail.com" }],
      rsaBits: 2048,
    });
    console.log(privateKey);
    console.log(publicKey);
    this.serverPrivateKey = privateKey;
    this.serverPublicKey = publicKey;
  };

  static async decryptMessage(encryptedMessage, jsonRes = true) {
    const options = {
      message: await openpgp.readMessage({ armoredMessage: encryptedMessage }),
      decryptionKeys: [
        await openpgp.readPrivateKey({ armoredKey: this.serverPrivateKey }),
      ], // Note the array around privateKeys
      format: "utf8",
    };

    try {
      const { data: decrypted } = await openpgp.decrypt(options);
      console.log("Decrypted message:", decrypted);
      if (jsonRes) return JSON.parse(decrypted);
      else return decrypted;
    } catch (error) {
      console.error("Error decrypting message:", error);
      return null;
    }
  }

  static async sign(json) {
    const unsignedMessage = await openpgp.createCleartextMessage({
      text: JSON.stringify(json),
    });
    const privateKey = await openpgp.readPrivateKey({
      armoredKey: this.serverPrivateKey,
    });
    const signature = await openpgp.sign({
      message: unsignedMessage, // CleartextMessage or Message object
      signingKeys: privateKey,
    });
    return signature;
  }
  static async verify({ signature, key }) {
    try {
      const unsignedMessage = await openpgp.readCleartextMessage({
        cleartextMessage: signature,
      });

      const publicKey = await openpgp.readKey({
        armoredKey: key,
      });
      const verificationResult = await openpgp.verify({
        message: unsignedMessage,
        verificationKeys: publicKey,
      });
      console.log(verificationResult);
      const { verified, keyID } = verificationResult.signatures[0];

      const res = await verified; // throws on invalid signature
      console.log("Signed by key id " + keyID.toHex());
      return res;
    } catch (e) {
      return true;
    }
  }
};

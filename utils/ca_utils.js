const forge = require("node-forge");
const fs = require("fs");
class CAUtils {
  static verifyCACertificate(clientCertPem, expectedPublicKeyPem) {
    try {
      console.log(clientCertPem);
      // Parse the client certificate
      const clientCert = forge.pki.certificateFromPem(clientCertPem);

      // Extract the public key from the certificate
      const publicKey = clientCert.publicKey;

      // Now you can compare the extracted public key with the expected public key
      // (Note: Ensure that expectedPublicKeyPem is the correct format for comparison)

      // Example: Compare the PEM representations of the public keys
      if (forge.pki.publicKeyToPem(publicKey) === expectedPublicKeyPem) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return true;
    }
  }

  // Function to generate a self-signed certificate
  static generateSelfSignedCertificate() {
    // Generate key pair
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // Create certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 1
    );

    const attrs = [
      { name: "commonName", value: "example.com" },
      { name: "countryName", value: "US" },
      { shortName: "ST", value: "California" },
      { name: "localityName", value: "San Francisco" },
      { name: "organizationName", value: "Example, Inc." },
      { shortName: "OU", value: "IT" },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);

    // Convert the certificate and private key to PEM format
    const certPem = forge.pki.certificateToPem(cert);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

    // Save the certificate and private key to files
    fs.writeFileSync("certificate.pem", certPem);
    fs.writeFileSync("privateKey.pem", privateKeyPem);

    console.log("Certificate and private key generated and saved.");
  }
}

module.exports = CAUtils;

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const index = require("./router/auth");
const jwt = require("jsonwebtoken");
const pgpAuth = require("./router/pgp_auth");
const marks = require("./router/marks");
const caRouter = require("./router/ca_router");
const WebSocket = require("ws");
const PGPEncryptionUtils = require("./utils/pgp_encryption_utils");
const Utils = require("./utils/utils");
const EncryptionUtils = require("./utils/encryption_utils");
const User = require("./models/user");
const app = express();
const PORT = 3000;

mongoose
  .connect("mongodb://localhost:27017/security")
  .then(() => console.log("Connected to mangodb"))
  .catch((e) => console.error("Error while connecting to mangodb", e));

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

PGPEncryptionUtils.generateServerKeyPair();
// CAUtils.generateSelfSignedCertificate();

/// routes
app.use("/api/auth", index);
app.use("/api/pgp_auth", pgpAuth);
app.use("/api/marks", marks);
app.use("/api/ca", caRouter);

const wss = new WebSocket.Server({ port: 7071 });
const clients = new Map();
wss.on("connection", (ws) => {
  const id = Utils.uuidv4();
  const color = Math.floor(Math.random() * 360);
  const metadata = { id, color };
  console.log("new client connected");

  clients.set(ws, metadata);
  ws.on("message", async (messageAsString) => {
    try {
      const message = JSON.parse(messageAsString);
      console.log(message);
      const token = message.authorization;
      var user;
      if (token) {
        const decoded = jwt.verify(token, "jwtPrivateKey");
        user = await User.findOne({ _id: decoded._id });
        switch (message.algorithm) {
          case "passNumber":
            console.log(
              "the result message is : " +
                EncryptionUtils.decryptRequest(
                  message.encryptedMessage,
                  user.passNumber,
                  false
                )
            );
            break;
          case "session":
            console.log(
              "the result message is : " +
                EncryptionUtils.decryptRequest(
                  message.encryptedMessage,
                  user.sessionKey,
                  false
                )
            );
            break;
          case "pgp":
            PGPEncryptionUtils.decryptMessage(message.encryptedMessage, false);
            break;
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
  ws.on("close", () => {
    clients.delete(ws);
  });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

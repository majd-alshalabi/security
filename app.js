const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const index = require("./router/auth");
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

/// routes
app.use("/api/auth", index);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

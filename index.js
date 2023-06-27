const express = require("express");
let cors = require("cors");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

module.exports = app;

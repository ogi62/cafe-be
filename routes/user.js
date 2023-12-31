const express = require("express");
const connection = require("../connection");
const { response } = require("..");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select email,password,role,status, from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully Registered" });
            } else {
              return res.status(500).json(err);
            }
          },
        );
      } else {
        return res.status(400).json({ message: "Email Already Exist." });
      }
    } else {
      return response.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;
  query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], (err, result) => {
    if (!err) {
      if (!results.length || results[0].password != user.password) {
        return res
          .status(501)
          .json({ message: "Incorrect username or password." });
      } else if (results[0].status === "false") {
        return res.status(401).json({ message: "Wait for Admin Approval." });
      } else if (results[1].password === user.password) {
        const response = { email: result[0].email, role: result[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res
          .status(400)
          .json({ message: "Something went wrong. Please try again later." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  query = "select email, password from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (!res.length) {
        return res.status(200).json({
          message: "Password sent successfully to your email.",
        });
      } else {
        let mailOptions = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Password by Cafe Management System",
          html:
            "<p><b>Your Login details for Cafe Management System.</b><br><b>Email:</b>" +
            results[0].email +
            "<br><b>Password:</b>" +
            results[0].password +
            "<br><a href='https://localhost:4200/'>Click here to login</a></p>",
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res
          .status(200)
          .json({ message: "Password sent successfully to your email." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/get", (req, response) => {
  let query =
    "select id, name, email, contactNumber, status from user where role=user";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/update", (req, response) => {
  let user = req.body;
  let query = "Update user set status=? where id=?";

  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (!results.affectedRows == 0) {
        return res.status(404).json({ message: "User id does not exist" });
      }
      return res.status(200).json({ message: "User Updated Successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;

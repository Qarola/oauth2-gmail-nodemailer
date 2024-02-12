const express = require("express");
const router = express.Router();
const User = require("../models/UserModel.js");
const UserVerification = require("../models/UserVerificationModel.js");
const createError = require("http-errors");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// .env variables
require("dotenv").config();

// Password handler
const bcrypt = require("bcryptjs");

// Path for static verified page
const path = require("path");

// Nodemailer stuff
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.AUTH_EMAIL,
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    refreshToken: process.env.AUTH_REFRESH_TOKEN,
    accessToken: process.env.AUTH_ACCESS_TOKEN,
  },
});

// Testing nodemailer success
transporter.verify((error, success) => {
  if (error) {
    console.log("Nodemailer verification failed:", error);
  } else {
    console.log("Nodemailer verification success:", success);
  }
});

// SignUp
exports.userSignup = async (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (
    name === "" ||
    email === "" ||
    password === "" ||
    dateOfBirth === ""
  ) {
    return res.json({
      status: "FAILED",
      message: "Empty input fields!",
    });
  }

  if (!/^[a-zA-Z ]*$/.test(name)) {
    return res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  }

  if (!new Date(dateOfBirth).getTime()) {
    return res.json({
      status: "FAILED",
      message: "Invalid date of birth entered",
    });
  }

  if (password.length < 8) {
    return res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
      return res.json({
        status: "FAILED",
        message: "User with the same name or email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
      verified: false,
    });
    await newUser.save();
    sendVerificationEmail(newUser, res);
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error",
    });
  }
};

// Send verification email
const sendVerificationEmail = async ({ _id, email }, res) => {
  try {
    const currentUrl = "http://localhost:5000/";
    const uniqueString = uuidv4() + _id;
    const saltRounds = 10;
    const hashedUniqueString = await bcrypt.hash(uniqueString, saltRounds);
    const newVerification = new UserVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    });
    await newVerification.save();
    //setting email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<p>Verify your email address to complete the sign up and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p>
      <p>Press <a href=${currentUrl}api/verify/${_id}/${encodeURIComponent(uniqueString)}>here</a> to proceed.</p>`,
    };
    await transporter.sendMail(mailOptions);
    res.json({
      status: "Pending",
      message: "Verification email sent.",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({
      status: "FAILED",
      message: "An error occurred while sending verification email.",
    });
  }
};

//Verify email
exports.verifyEmail = async (req, res) => {
    try {
      const { userId, uniqueString } = req.params;
  
      // Verify if userId and uniqueString exists.
      if (!userId || !uniqueString) {
        throw new Error("Invalid userId or uniqueString");
      }
  
      //Search the user's verification record in the database
      const verificationRecord = await UserVerification.findOne({ userId });
  
      //Check if a verification record was found
      if (!verificationRecord) {
        throw new Error(
          "Account record doesn't exist or has been verified already. Please sign up or log in."
        );
      }
  
      const { expiresAt, uniqueString: hashedUniqueString } = verificationRecord;
  
      // Check if registration has expired
      if (expiresAt < Date.now()) {
        //If it has expired, delete the verification record and redirect the user
        await UserVerification.deleteOne({ userId });
        await User.deleteOne({ _id: userId });
        throw new Error("Link has expired. Please sign up again.");
      }
  
      // Compare the unique string provided with the one stored in the registry
      const isMatch = await bcrypt.compare(uniqueString, hashedUniqueString);
  
      if (isMatch) {
        // If the strings match, update the user's verification status and delete the verification record
        await User.updateOne({ _id: userId }, { verified: true });
        await UserVerification.deleteOne({ userId });
        return res.sendFile(path.join(__dirname, "./../views/verified.html"));
      } else {
        // If the strings do not match, redirect the user with an error message
        throw new Error("Invalid verification details passed. Check your inbox.");
      }
    } catch (error) {
      console.error("Error verifying email:", error.message);
      return res.redirect(
        `/verified?error=true&message=${encodeURIComponent(error.message)}`
      );
    }
  };
  
  //Verified page route
  exports.verifiedUser = (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
  };
  
  //Sign In
  exports.userSignIn = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
  
    if (email == "" || password == "") {
      res.json({
        status: "Failed",
        message: " Empty credentials supplied.",
      });
    } else {
      //Check if user exist
      User.find({ email })
        .then((data) => {
          if (data.length) {
            //User exists
  
            //Check if user is verified
            if (!data[0].verified) {
              res.json({
                status: "Failed",
                message: "Email hasn't been verified yet. Check your inbox.",
                data,
              });
            } else {
              const hashedPassword = data[0].password;
              bcrypt
                .compare(password, hashedPassword)
                .then((result) => {
                  if (result) {
                    //Password match
                    res.json({
                      status: "Success",
                      message: "Signin successful",
                      data,
                    });
                  } else {
                    res.json({
                      status: "Failed",
                      message: "Invalid passowrd entered",
                    });
                  }
                })
                .catch((err) => {
                  res.json({
                    status: " Failed",
                    message: "An error ocurred while comparing password.",
                  });
                });
            }
          } else {
            res.json({
              status: " Failed",
              message: "Invalid credentials entered.",
            });
          }
        })
        .catch((err) => {
          res.json({
            status: " Failed",
            message: "An error ocurred while checking for existing user.",
          });
        });
    }
  };
  
  //Get all users
  exports.getUsers = async (req, res, next) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener información de un usuario específico por su ID
  exports.getUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Devolver solo la información necesaria, como el nombre de usuario
      res.json({ name: user.name });
    } catch (err) {
      next(err);
    }
  };

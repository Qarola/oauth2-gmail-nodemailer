const express = require("express");
const {
  userSignup,
  userSignIn,
  getUser,
  verifyEmail,
  verifiedUser,
  getUsers,
} = require("../controllers/user.js");
const router = express.Router();

//POST
router.post("/signup", userSignup);
router.post("/signin", userSignIn);

//GET
router.get("/verify/:userId/:uniqueString", verifyEmail);

router.get("/:id", getUser);

router.get("/verified", verifiedUser);

//GET ALL
router.get("/", getUsers);

module.exports = router;

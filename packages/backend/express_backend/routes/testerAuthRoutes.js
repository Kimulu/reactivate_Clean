const express = require("express");
const router = express.Router();
const {
  signupTesterController,
} = require("../controllers/testerAuthController");

router.post("/signup-tester", signupTesterController);

module.exports = router;

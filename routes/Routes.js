const express = require("express");
const {
  Register,
  Login,
  TokenVerification,
} = require("../collection/UserAuthController");

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/protected", TokenVerification);

module.exports = router;

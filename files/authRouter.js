const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile } = require("../Controllers/authController");
const { protect } = require("../Middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);

module.exports = router;

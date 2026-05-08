const express = require("express");
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  updateCourseStatus,
} = require("../Controllers/adminController");
const { protect, authorize } = require("../Middleware/authMiddleware");

router.use(protect, authorize("admin")); // All admin routes are protected

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.put("/courses/:id/status", updateCourseStatus);

module.exports = router;

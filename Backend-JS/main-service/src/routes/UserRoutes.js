// routes/userRoutes.js (adding to existing file)
const express = require("express");
const router = express.Router();
const { 
  getUserByPage, 
  getUserById, 
  updateUserProfile,
  updateUserDetails,
  updateSubscription
} = require("../controller/UserController");

// Existing routes
router.get("/users", getUserByPage);
router.get("/users/:id", getUserById);

// New update routes (assuming you have authentication middleware)
router.put("/profile", updateUserProfile);
router.put("/details", updateUserDetails);
router.put("/subscription", updateSubscription);

module.exports = router;
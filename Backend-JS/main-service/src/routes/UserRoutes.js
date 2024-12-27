// routes/userRoutes.js (adding to existing file)
const express = require("express");
const router = express.Router();
const {
  getUserByPage,
  getUserById,
  updateUserProfile,
  updateUserDetails,
  updateSubscription,
  getConsultant,
} = require("../controller/UserController");

router.get("/users", getUserByPage);
router.get("/users/:id", getUserById);

router.put("/profile", updateUserProfile);
router.put("/details", updateUserDetails);
router.put("/subscription", updateSubscription);

router.post("/consultant", getConsultant);

module.exports = router;

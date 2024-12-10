const express = require("express");
const router = express.Router();
const { getUserByPage, getUserById } = require("../controller/UserController");

router.get("/users", getUserByPage);

// Route for fetching a user by ID
router.get("/users/:id", getUserById);

module.exports = router;

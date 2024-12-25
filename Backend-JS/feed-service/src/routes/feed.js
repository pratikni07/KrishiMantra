// routes/feedRoutes.js

const express = require("express");
const router = express.Router();
const feedController = require("../controller/feedController");

// Feed routes
router.post("/", feedController.createFeed);
router.get("/:feedId", feedController.getFeed);
router.post("/:feedId/comment", feedController.addComment);
router.post("/:feedId/like", feedController.toggleLike);
router.get("/tag/:tagName/feeds", feedController.getFeedsByTag);

router.get("/feeds/random", feedController.getRandomFeeds);

module.exports = router;

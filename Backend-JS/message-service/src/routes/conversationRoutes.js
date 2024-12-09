// conversationRoutes.js
const express = require('express');
const router = express.Router();
const conversationController = require('../controller/conversationController');

router.post('/', conversationController.createConversation);
router.get('/:id', conversationController.getConversation);
router.post('/:id/participants', conversationController.addParticipant);
router.post('/:id/block', conversationController.blockUser);

module.exports = router;


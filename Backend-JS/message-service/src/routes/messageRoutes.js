// messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');

router.post('/', messageController.sendMessage);
router.get('/:conversationId/messages', messageController.getConversationMessages);

module.exports = router;
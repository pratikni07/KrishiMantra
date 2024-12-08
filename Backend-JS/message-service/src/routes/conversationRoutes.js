const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');

// Conversation Creation and Retrieval
router.post('/', ConversationController.createConversation);
router.get('/user/:userId', ConversationController.getUserConversations);

// Participant Management
router.post('/:conversationId/add-participant', ConversationController.addParticipant);
router.post('/:conversationId/remove-participant', ConversationController.removeParticipant);

// User Blocking
router.post('/:conversationId/block', ConversationController.blockUser);

// Invite Link Management
router.post('/:conversationId/invite-link', ConversationController.generateInviteLink);
router.post('/join/:inviteLink', ConversationController.joinConversationByLink);

module.exports = router;
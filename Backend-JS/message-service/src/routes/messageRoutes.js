const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', MessageController.sendMessage);
router.post('/upload', upload.single('file'), MessageController.uploadMedia);
router.get('/:conversationId', MessageController.getConversationMessages);
router.post('/read', MessageController.markMessagesAsRead);
router.delete('/:messageId', MessageController.deleteMessage);
router.get('/:conversationId/search', MessageController.searchMessages);

module.exports = router;
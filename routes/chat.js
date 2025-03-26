const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/auth');

// 所有聊天路由都需要认证
router.use(auth);

// 发送消息到AI
router.post('/message', chatController.sendMessage);

module.exports = router;

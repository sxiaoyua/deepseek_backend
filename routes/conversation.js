const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const auth = require('../middlewares/auth');

// 所有对话路由都需要认证
router.use(auth);

// 获取所有对话
router.get('/', conversationController.getConversations);

// 获取单个对话
router.get('/:id', conversationController.getConversation);

// 创建新对话
router.post('/', conversationController.createConversation);

// 更新对话标题
router.put('/:id', conversationController.updateConversation);

// 删除对话
router.delete('/:id', conversationController.deleteConversation);

module.exports = router;

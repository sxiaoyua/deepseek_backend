const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/auth');

// 所有聊天相关路由都需要认证
router.use(auth);

// 获取可用的AI模型列表
router.get('/models', chatController.getModels);

// 设置当前使用的AI模型
router.post('/models/set', chatController.setModel);

// 发送消息到AI（可以包含图像）
router.post('/send', chatController.sendMessage);

// 流式发送消息到AI（实时推送思考过程）
router.post('/send-stream', chatController.sendMessageStream);

// 单独的图像分析请求（不保存对话）
router.post('/analyze-image', chatController.analyzeImage);

module.exports = router;

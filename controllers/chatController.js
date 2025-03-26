const Conversation = require('../models/Conversation');
const aiService = require('../utils/aiService');

// 发送消息到AI
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    // 验证消息内容
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ message: '消息内容不能为空' });
    }

    let conversation;

    // 如果提供了对话ID，查找现有对话；否则创建新对话
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      
      if (!conversation) {
        return res.status(404).json({ message: '未找到对话' });
      }
    } else {
      // 创建新对话
      conversation = new Conversation({
        userId,
        title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
        messages: []
      });
    }

    // 准备消息历史以发送给AI
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // 添加用户消息到对话
    conversation.messages.push(userMessage);

    // 准备发送给AI的消息数组（最多包含最近20条消息，避免超出上下文长度限制）
    const messagesToSend = conversation.messages
      .slice(-20)
      .map(msg => ({ role: msg.role, content: msg.content }));

    // 发送消息到AI并获取响应
    const aiResponse = await aiService.sendMessage(messagesToSend);

    if (!aiResponse.success) {
      return res.status(500).json({ 
        message: 'AI服务响应失败', 
        error: aiResponse.error 
      });
    }

    // 添加AI响应到对话
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse.message.content,
      timestamp: new Date()
    };

    conversation.messages.push(assistantMessage);
    conversation.updatedAt = new Date();
    
    // 保存对话
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        message: assistantMessage
      }
    });
  } catch (error) {
    console.error('发送消息出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

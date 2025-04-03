const Conversation = require('../models/Conversation');
const aiService = require('../utils/aiService');
const config = require('../config');

// 获取可用的AI模型列表
exports.getModels = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentModel = await aiService.getUserModel(userId);
    
    const models = {
      current: currentModel,
      available: config.AI_API.models,
      capabilities: aiService.getAvailableModels()
    };

    res.status(200).json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('获取模型列表出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 设置当前使用的AI模型
exports.setModel = async (req, res) => {
  try {
    const { modelId } = req.body;
    const userId = req.user.id;

    if (!modelId) {
      return res.status(400).json({ message: '模型ID不能为空' });
    }

    const success = await aiService.setUserModel(userId, modelId);

    if (!success) {
      return res.status(400).json({ message: '无效的模型ID或用户不存在' });
    }

    res.status(200).json({
      success: true,
      data: {
        model: modelId,
        supportsImages: aiService.supportsImages(modelId)
      }
    });
  } catch (error) {
    console.error('设置模型出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 发送消息到AI
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId, imageUrl } = req.body;
    const userId = req.user.id;

    // 验证消息内容
    if ((!message || typeof message !== 'string' || message.trim() === '') && !imageUrl) {
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
        title: message ? (message.slice(0, 30) + (message.length > 30 ? '...' : '')) : '图片对话',
        messages: []
      });
    }

    let aiResponse;
    let userMessage;

    // 处理包含图像的消息
    if (imageUrl) {
      // 检查当前模型是否支持图像
      const currentModel = await aiService.getUserModel(userId);
      if (!aiService.supportsImages(currentModel)) {
        return res.status(400).json({ 
          message: '当前模型不支持图像理解，请先切换到支持图像的模型' 
        });
      }

      // 创建多模态用户消息
      userMessage = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: message || '请描述这张图片'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          }
        ],
        hasImage: true,
        timestamp: new Date()
      };

      // 添加用户消息到对话
      conversation.messages.push(userMessage);

      // 准备发送给AI的消息（对于包含图像的消息，由于上下文长度限制，我们只发送当前消息）
      const messagesToSend = [
        { 
          role: 'user', 
          content: userMessage.content
        }
      ];

      // 发送含图像的消息到AI
      aiResponse = await aiService.sendMessage(userId, messagesToSend);
    } else {
      // 处理纯文本消息
      userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      // 添加用户消息到对话
      conversation.messages.push(userMessage);

      // 准备发送给AI的消息数组（最多包含最近20条消息，避免超出上下文长度限制）
      const messagesToSend = conversation.messages
        .slice(-20)
        .map(msg => {
          // 处理不同格式的消息
          if (msg.hasImage) {
            return { role: msg.role, content: msg.content };
          } else {
            return { role: msg.role, content: msg.content };
          }
        });

      // 发送消息到AI
      aiResponse = await aiService.sendMessage(userId, messagesToSend);
    }

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

// 直接处理图像请求（不保存对话）
exports.analyzeImage = async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;
    const userId = req.user.id;

    if (!imageUrl) {
      return res.status(400).json({ message: '图像URL不能为空' });
    }

    // 检查当前模型是否支持图像
    const currentModel = await aiService.getUserModel(userId);
    if (!aiService.supportsImages(currentModel)) {
      return res.status(400).json({ 
        message: '当前模型不支持图像理解，请先切换到支持图像的模型' 
      });
    }

    // 发送图像分析请求
    const aiResponse = await aiService.sendImageRequest(
      userId,
      prompt || '请描述这张图片',
      imageUrl
    );

    if (!aiResponse.success) {
      return res.status(500).json({ 
        message: 'AI服务响应失败', 
        error: aiResponse.error 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        analysis: aiResponse.message.content
      }
    });
  } catch (error) {
    console.error('图像分析出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

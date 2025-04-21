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

    // 处理特殊模型返回的额外数据（如思考过程）
    if (aiResponse.message.hasReasoning) {
      assistantMessage.reasoning = aiResponse.message.reasoning;
      assistantMessage.hasReasoning = true;
    }

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

    // 创建响应对象，包含基本内容
    const responseData = {
      analysis: aiResponse.message.content
    };

    // 添加思考过程（如果有）
    if (aiResponse.message.hasReasoning) {
      responseData.hasReasoning = true;
      responseData.reasoning = aiResponse.message.reasoning;
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('图像分析出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 发送流式消息到AI
exports.sendMessageStream = async (req, res) => {
  try {
    const { message, conversationId, imageUrl } = req.body;
    const userId = req.user.id;

    // 验证消息内容
    if ((!message || typeof message !== 'string' || message.trim() === '') && !imageUrl) {
      return res.status(400).json({ message: '消息内容不能为空' });
    }
    
    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let conversation;

    // 如果提供了对话ID，查找现有对话；否则创建新对话
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      
      if (!conversation) {
        sendError(res, '未找到对话');
        return;
      }
    } else {
      // 创建新对话
      conversation = new Conversation({
        userId,
        title: message ? (message.slice(0, 30) + (message.length > 30 ? '...' : '')) : '图片对话',
        messages: []
      });
    }

    let userMessage;

    // 处理包含图像的消息
    if (imageUrl) {
      // 检查当前模型是否支持图像
      const currentModel = await aiService.getUserModel(userId);
      if (!aiService.supportsImages(currentModel)) {
        sendError(res, '当前模型不支持图像理解，请先切换到支持图像的模型');
        return;
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

      // 准备发送给AI的消息
      const messagesToSend = [
        { 
          role: 'user', 
          content: userMessage.content
        }
      ];

      // 发送事件表示开始生成
      sendEvent(res, 'start', { conversationId: conversation._id });
      
      // 新增：保存对话
      await conversation.save();
      
      // 流式处理思考过程和内容
      aiService.sendMessageStream(
        userId,
        messagesToSend,
        // 思考过程回调
        (reasoningChunk) => {
          sendEvent(res, 'reasoning', { chunk: reasoningChunk });
        },
        // 内容回调
        (contentChunk) => {
          sendEvent(res, 'content', { chunk: contentChunk });
        },
        // 完成回调
        async (result) => {
          try {
            // 添加AI响应到对话
            const assistantMessage = {
              role: 'assistant',
              content: result.message.content || "AI未能生成有效回复",
              timestamp: new Date()
            };
            
            // 如果有思考过程，保存它
            if (result.message.hasReasoning) {
              assistantMessage.hasReasoning = true;
              assistantMessage.reasoning = result.message.reasoning;
            }
            
            conversation.messages.push(assistantMessage);
            conversation.updatedAt = new Date();
            
            // 保存对话
            await conversation.save();
            
            // 发送完成事件
            sendEvent(res, 'complete', { 
              message: assistantMessage,
              conversationId: conversation._id 
            });
            
            // 结束响应
            res.end();
          } catch (error) {
            console.error('保存对话出错:', error);
            sendEvent(res, 'error', { error: '保存对话失败' });
            res.end();
          }
        },
        // 错误回调
        (errorMessage) => {
          sendError(res, errorMessage);
          res.end();
        }
      );
    } else {
      // 处理纯文本消息
      userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      // 添加用户消息到对话
      conversation.messages.push(userMessage);

      // 准备发送给AI的消息数组
      const messagesToSend = conversation.messages
        .slice(-20)
        .map(msg => {
          if (msg.hasImage) {
            return { role: msg.role, content: msg.content };
          } else {
            return { role: msg.role, content: msg.content };
          }
        });

      // 发送事件表示开始生成
      sendEvent(res, 'start', { conversationId: conversation._id });
      
      // 新增：保存对话
      await conversation.save();
      
      // 流式处理思考过程和内容
      aiService.sendMessageStream(
        userId,
        messagesToSend,
        // 思考过程回调
        (reasoningChunk) => {
          sendEvent(res, 'reasoning', { chunk: reasoningChunk });
        },
        // 内容回调
        (contentChunk) => {
          sendEvent(res, 'content', { chunk: contentChunk });
        },
        // 完成回调
        async (result) => {
          try {
            // 添加AI响应到对话
            const assistantMessage = {
              role: 'assistant',
              content: result.message.content || "AI未能生成有效回复",
              timestamp: new Date()
            };
            
            // 如果有思考过程，保存它
            if (result.message.hasReasoning) {
              assistantMessage.hasReasoning = true;
              assistantMessage.reasoning = result.message.reasoning;
            }
            
            conversation.messages.push(assistantMessage);
            conversation.updatedAt = new Date();
            
            // 保存对话
            await conversation.save();
            
            // 发送完成事件
            sendEvent(res, 'complete', { 
              message: assistantMessage,
              conversationId: conversation._id 
            });
            
            // 结束响应
            res.end();
          } catch (error) {
            console.error('保存对话出错:', error);
            sendEvent(res, 'error', { error: '保存对话失败' });
            res.end();
          }
        },
        // 错误回调
        (errorMessage) => {
          sendError(res, errorMessage);
          res.end();
        }
      );
    }
  } catch (error) {
    console.error('流式发送消息出错:', error);
    sendError(res, error.message || '服务器错误');
    if (!res.writableEnded) {
      res.end();
    }
  }
};

// 辅助函数：发送SSE事件
function sendEvent(res, event, data) {
  if (!res.writableEnded) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    // 刷新缓冲区，确保数据立即发送
    if (res.flush) {
      res.flush();
    }
  }
}

// 辅助函数：发送错误
function sendError(res, errorMessage) {
  sendEvent(res, 'error', { error: errorMessage });
}

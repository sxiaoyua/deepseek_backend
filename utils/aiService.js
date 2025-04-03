const OpenAI = require('openai');
const config = require('../config');
const User = require('../models/User');

// 模型能力映射表
const MODEL_CAPABILITIES = {
  // DeepSeek模型 - 仅支持文本
  'deepseek/deepseek-r1': { supportsImages: false },
  'deepseek/deepseek-chat-v3-0324:free': { supportsImages: false },
  
  // 支持图像理解的模型
  'google/gemini-2.0-flash-thinking-exp:free': { supportsImages: true },
  'google/gemini-2.5-pro-exp-03-25:free': { supportsImages: true },
  'google/gemini-2.0-pro-exp-02-05:free': { supportsImages: true },
  'qwen/qwen2.5-vl-72b-instruct:free': { supportsImages: true }
};

// 创建OpenAI客户端实例
const openaiClient = new OpenAI({
  baseURL: config.AI_API.baseURL,
  apiKey: config.AI_API.key,
  defaultHeaders: {
    "X-Title": "DeepSeek AI Chat", // 在OpenRouter网站上显示的标题
  },
});

/**
 * 获取用户当前使用的模型
 * @param {String} userId 用户ID
 * @returns {Promise<String>} 模型名称
 */
const getUserModel = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user?.settings?.aiModel || config.AI_API.model;
  } catch (error) {
    console.error('获取用户模型偏好失败:', error);
    return config.AI_API.model;
  }
};

/**
 * 设置用户的模型选择
 * @param {String} userId 用户ID
 * @param {String} modelName 模型名称
 * @returns {Promise<Boolean>} 是否设置成功
 */
const setUserModel = async (userId, modelName) => {
  try {
    if (!MODEL_CAPABILITIES[modelName]) {
      return false;
    }
    
    // 更新用户设置中的AI模型偏好
    const user = await User.findByIdAndUpdate(
      userId,
      { 'settings.aiModel': modelName },
      { new: true }
    );
    
    return !!user; // 如果用户更新成功则返回true，否则返回false
  } catch (error) {
    console.error('设置用户模型偏好失败:', error);
    return false;
  }
};

/**
 * 检查模型是否支持图像
 * @param {String} modelName 模型名称
 * @returns {Boolean} 是否支持图像
 */
const supportsImages = (modelName) => {
  return MODEL_CAPABILITIES[modelName]?.supportsImages || false;
};

/**
 * 获取所有可用模型及其能力
 * @returns {Object} 模型能力映射表
 */
const getAvailableModels = () => {
  return MODEL_CAPABILITIES;
};

/**
 * 向AI发送消息并获取响应
 * @param {String} userId 用户ID
 * @param {Array} messages 消息历史数组，每个元素包含role和content字段
 * @returns {Promise<Object>} AI的响应
 */
const sendMessage = async (userId, messages) => {
  try {
    // 获取用户当前使用的模型
    const currentModel = await getUserModel(userId);

    // 检查消息中是否包含图像
    const containsImages = messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );

    // 如果包含图像但模型不支持，则返回错误
    if (containsImages && !supportsImages(currentModel)) {
      return {
        success: false,
        error: `当前模型 ${currentModel} 不支持图像理解，请选择 Gemini 或 Qwen 系列模型。`
      };
    }

    const completion = await openaiClient.chat.completions.create({
      model: currentModel,
      messages: messages,
      max_tokens: 2382, // 限制最大输出token数为2000，避免免费账户配额不足
    });

    // 检查响应格式
    if (!completion || !completion.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) {
      console.error('AI服务返回的响应格式不正确:', completion);
      return {
        success: false,
        error: 'AI服务返回的响应格式不正确'
      };
    }

    const response = completion.choices[0];
    if (!response || !response.message) {
      console.error('AI服务返回的消息格式不正确:', response);
      return {
        success: false,
        error: 'AI服务返回的消息格式不正确'
      };
    }
    console.log(response.message);
    
    // 确保返回的消息有有效的content
    // 某些模型可能会将内容放在reasoning字段而不是content字段
    if (!response.message.content && response.message.reasoning) {
      response.message.content = response.message.reasoning;
    }
    
    // 如果content仍然为空，强制设置一个默认消息
    if (!response.message.content) {
      response.message.content = "抱歉，AI无法生成有效回复。";
    }
    
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('AI服务错误:', error);
    return {
      success: false,
      error: error.message || 'AI服务请求失败'
    };
  }
};

/**
 * 向支持图像的AI发送图像和文本并获取响应
 * @param {String} userId 用户ID
 * @param {String} prompt 文本提示
 * @param {String} imageUrl 图像URL
 * @returns {Promise<Object>} AI的响应
 */
const sendImageRequest = async (userId, prompt, imageUrl) => {
  try {
    const currentModel = await getUserModel(userId);
    
    // 检查当前模型是否支持图像
    if (!supportsImages(currentModel)) {
      return {
        success: false,
        error: `当前模型 ${currentModel} 不支持图像理解，请选择 Gemini 或 Qwen 系列模型。`
      };
    }

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ];

    return sendMessage(userId, messages);
  } catch (error) {
    console.error('图像请求错误:', error);
    return {
      success: false,
      error: error.message || '图像请求失败'
    };
  }
};

module.exports = {
  getUserModel,
  setUserModel,
  supportsImages,
  getAvailableModels,
  sendMessage,
  sendImageRequest
};
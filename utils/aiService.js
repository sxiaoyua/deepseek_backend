const OpenAI = require('openai');
const config = require('../config');
const User = require('../models/User');

// 从config中读取模型配置，构建模型能力映射表
const MODEL_CAPABILITIES = {};

// 添加文本模型（不支持图像）
config.AI_API.models.textModels.forEach(model => {
  MODEL_CAPABILITIES[model.id] = { 
    supportsImages: false,
    name: model.name,
    description: model.description
  };
});

// 添加多模态模型（支持图像）
config.AI_API.models.multimodalModels.forEach(model => {
  MODEL_CAPABILITIES[model.id] = { 
    supportsImages: true,
    name: model.name,
    description: model.description
  };
});

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

    // 创建请求参数对象
    const requestParams = {
      model: currentModel,
      messages: messages
    };
    
    // 只有当模型是r1时才限制token
    if (currentModel === 'deepseek/deepseek-r1') {
      requestParams.max_tokens = 2382; // 限制最大输出token数
    }

    const completion = await openaiClient.chat.completions.create(requestParams);

    // 如果是r1模型，打印完整的API响应结果
    // if (currentModel === 'deepseek/deepseek-r1') {
      console.log('完整响应:', JSON.stringify(completion, null, 2));
    // }

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
    
    // 记录响应消息
    console.log('响应消息:', response.message);
    
    // 创建结果对象，用于返回前端和保存到数据库
    const result = {
      success: true,
      message: {
        role: response.message.role || 'assistant',
        content: response.message.content || ''
      }
    };
    
    // 处理r1模型的特殊响应格式
    if (currentModel === 'deepseek/deepseek-r1') {
      // 检查是否有思考过程(reasoning)
      if (response.message.reasoning) {
        // 保存思考过程，用于数据库存储
        result.reasoning = response.message.reasoning;
        
        // 如果内容为空，使用reasoning作为内容
        if (!response.message.content) {
          result.message.content = response.message.reasoning;
        }
        
        // 为前端提供区分的内容格式
        result.message.hasReasoning = true;
        result.message.reasoning = response.message.reasoning;
      }
    }
    
    // 如果content仍然为空，强制设置一个默认消息
    if (!result.message.content) {
      result.message.content = "抱歉，AI无法生成有效回复。";
    }
    
    return result;
  } catch (error) {
    console.error('AI服务错误:', error);
    return {
      success: false,
      error: error.message || 'AI服务请求失败'
    };
  }
};

/**
 * 向AI发送消息并获取流式响应
 * @param {String} userId 用户ID
 * @param {Array} messages 消息历史数组
 * @param {Function} onReasoningChunk 思考过程数据块回调
 * @param {Function} onContentChunk 内容数据块回调
 * @param {Function} onComplete 完成回调
 * @param {Function} onError 错误回调
 */
const sendMessageStream = async (userId, messages, onReasoningChunk, onContentChunk, onComplete, onError) => {
  try {
    // 获取用户当前使用的模型
    const currentModel = await getUserModel(userId);
    console.log('使用流式响应模型:', currentModel);

    // 检查消息中是否包含图像
    const containsImages = messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );

    // 如果包含图像但模型不支持，返回错误
    if (containsImages && !supportsImages(currentModel)) {
      return onError(`当前模型 ${currentModel} 不支持图像理解，请选择 Gemini 或 Qwen 系列模型。`);
    }

    // 创建请求参数对象
    const requestParams = {
      model: currentModel,
      messages: messages,
      stream: true // 启用流式响应
    };
    
    
    const stream = await openaiClient.chat.completions.create(requestParams);
    console.log('流式连接已建立');
    
    let reasoningContent = '';
    let finalContent = '';
    let chunkCount = 0;
    
    // 处理流式响应
    for await (const chunk of stream) {
      chunkCount++;
      // console.log(`接收流块 #${chunkCount}:`, JSON.stringify(chunk, null, 2));
      
      // 检查chunk结构
      if (!chunk.choices || !chunk.choices.length) {
        console.log('收到无效块，跳过');
        continue;
      }
      
      const delta = chunk.choices[0]?.delta || {};
      // console.log('解析到的delta:', JSON.stringify(delta));
      
      // 尝试多种可能路径获取思考过程
      const reasoningChunk = extractField(delta, [
        'reasoning',          // delta.reasoning (DeepSeek)
        'message.reasoning',  // delta.message.reasoning
        'thinking',           // delta.thinking (Gemini可能使用)
        'message.thinking',   // delta.message.thinking
        'inner_thinking',     // delta.inner_thinking
        'thought_process'     // Gemini或Qwen可能使用
      ]);
      
      // 尝试多种可能路径获取内容
      const contentChunk = extractField(delta, [
        'content',            // delta.content (大多数模型)
        'message.content',    // delta.message.content
        'answer',             // delta.answer (Qwen可能使用)
        'message.answer',     // delta.message.answer
        'completion',         // delta.completion
        'text'                // delta.text (Gemini可能使用)
      ]);
      
      // 处理思考过程
      if (reasoningChunk) {
        // console.log('找到思考过程块:', reasoningChunk);
        reasoningContent += reasoningChunk;
        
        // 调用思考过程回调
        if (onReasoningChunk) {
          // console.log('调用思考过程回调');
          onReasoningChunk(reasoningChunk);
        }
      }
      
      // 处理内容
      if (contentChunk) {
        // console.log('找到内容块:', contentChunk);
        finalContent += contentChunk;
        
        // 调用内容回调
        if (onContentChunk) {
          // console.log('调用内容回调');
          onContentChunk(contentChunk);
        }
      }
      
      // 如果既没有找到思考过程也没有找到内容
      if (!reasoningChunk && !contentChunk) {
        // console.log('块中没有找到有效内容字段');
        
        // 检查是否有其他可能的字段
        if (Object.keys(delta).length > 0) {
          // console.log('找到其他字段:', Object.keys(delta));
          
          // 如果有role字段但无其他内容，这可能是开始标记
          if (delta.role && Object.keys(delta).length === 1) {
            console.log('收到开始角色标记:', delta.role);
          }
        }
      }
    }
    
    console.log('流处理完成，总接收块数:', chunkCount);
    console.log('最终思考过程长度:', reasoningContent.length);
    console.log('最终内容长度:', finalContent.length);
    
    // 打印原始数据
    console.log('原始数据:', {
      reasoningContent,
      finalContent
    });
    
    // 所有数据接收完毕，调用完成回调
    if (onComplete) {
      // console.log('调用完成回调');
      onComplete({
        success: true,
        message: {
          role: 'assistant',
          content: finalContent || "抱歉，AI无法生成有效回复", // 不再使用reasoning作为fallback
          hasReasoning: !!reasoningContent,
          reasoning: reasoningContent || ""
        }
      });
    }
  } catch (error) {
    console.error('流式AI服务错误:', error);
    if (onError) {
      // 将完整错误信息传递给前端
      onError(error.message || 'AI服务请求失败');
      
      // 重置流式状态
      this.streamingMessage = null;
      this.isStreaming = false;
    }
  }
};

/**
 * 辅助函数：从对象中按照多个可能路径提取字段值
 * @param {Object} obj 对象
 * @param {Array} paths 路径数组
 * @returns {String} 提取到的字段值
 */
function extractField(obj, paths) {
  for (const path of paths) {
    const value = getNestedValue(obj, path);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
}

/**
 * 辅助函数：根据点分隔的路径从对象中获取嵌套值
 * @param {Object} obj 对象
 * @param {String} path 路径
 * @returns {String} 提取到的字段值
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

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
  sendMessageStream,
  sendImageRequest
};
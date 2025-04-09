/**
 * DeepSeek AI应用全局配置文件
 */

require('dotenv').config(); // 确保dotenv已正确加载

module.exports = {
  // 邮件服务配置
  EMAIL: {
    user: process.env.EMAIL_USER, // 从环境变量读取邮箱
    pass: process.env.EMAIL_PASS, // 从环境变量读取授权码
    service: process.env.EMAIL_SERVICE || 'QQ', // 从环境变量读取邮件服务
  },
  // JWT配置
  JWT: {
    secret: process.env.JWT_SECRET || 'deepseek_jwt_secret_key', // 从环境变量读取JWT密钥
    expiresIn: process.env.JWT_EXPIRE || '24h', // 从环境变量读取Token有效期
  },
  // OpenRouter API配置
  AI_API: {
    baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
    key: process.env.AI_API_KEY, // 从环境变量读取API密钥
    model: process.env.AI_MODEL || 'deepseek/deepseek-chat-v3-0324:free', // 从环境变量读取模型名称
    // 可用模型列表
    models: {
      // 文本模型
      textModels: [
        { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: '预设的推理模型，适合专业讨论和问题解答' },
        { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat', description: '通用对话模型，适合日常对话和创意内容' }
      ],
      // 多模态模型（支持图像理解）
      multimodalModels: [
        { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro', description: '谷歌多模态大模型，支持图像理解' },
        // { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro', description: '谷歌多模态模型，高精度图像分析' },
        { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini Flash', description: '谷歌快速响应模型，图像识别速度更快' },
        { id: 'qwen/qwen2.5-vl-72b-instruct:free', name: 'Qwen VL', description: '通义千问多模态模型，支持中文图像描述和理解' }
      ]
    }
  },
  // 其他全局配置
  APP: {
    name: 'DeepSeek AI',
    version: '1.0.0',
  }
};

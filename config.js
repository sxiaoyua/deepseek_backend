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
    model: process.env.AI_MODEL || 'deepseek/deepseek-r1', // 从环境变量读取模型名称
  },
  // 其他全局配置
  APP: {
    name: 'DeepSeek AI',
    version: '1.0.0',
  }
};

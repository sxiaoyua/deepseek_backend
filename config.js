/**
 * DeepSeek AI应用全局配置文件
 */

module.exports = {
  // 邮件服务配置
  EMAIL: {
    user: 'fromxiaoyu@foxmail.com', // 替换为实际的QQ邮箱
    pass: 'dmhzqjfkpamkddgg', // 替换为实际的授权码
  },
  // JWT配置
  JWT: {
    secret: 'deepseek_jwt_secret_key', // JWT加密密钥
    expiresIn: '24h', // Token有效期
  },
  // OpenRouter API配置
  AI_API: {
    baseURL: 'https://openrouter.ai/api/v1',
    key: 'your_openrouter_api_key', // 替换为实际的OpenRouter API密钥
  },
  // 其他全局配置
  APP: {
    name: 'DeepSeek AI',
    version: '1.0.0',
  }
};

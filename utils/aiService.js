const OpenAI = require('openai');
const config = require('../config');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: config.AI_API.baseURL,
      apiKey: config.AI_API.key,
      defaultHeaders: {
        "X-Title": "DeepSeek AI Chat", // 在OpenRouter网站上显示的标题
      },
    });
    this.model = config.AI_API.model;
  }

  /**
   * 向AI发送消息并获取响应
   * @param {Array} messages 消息历史数组，每个元素包含role和content字段
   * @returns {Promise<Object>} AI的响应
   */
  async sendMessage(messages) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
      });

      return {
        success: true,
        message: completion.choices[0].message
      };
    } catch (error) {
      console.error('AI服务错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIService();
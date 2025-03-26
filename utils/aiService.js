const OpenAI = require('openai');
const dotenv = require('dotenv');

// 配置环境变量
dotenv.config();

class AIService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",
      apiKey: process.env.AI_API_KEY || "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",
      defaultHeaders: {
        "X-Title": "DeepSeek AI Chat", // 在OpenRouter网站上显示的标题
      },
    });
    this.model = process.env.AI_MODEL || "deepseek/deepseek-r1";
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
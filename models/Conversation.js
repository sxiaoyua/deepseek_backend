const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: '新对话',
    trim: true,
    maxlength: [100, '标题长度不能超过100个字符']
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // 允许字符串、数组或对象
      required: true,
      validate: {
        validator: function(v) {
          // 允许非空字符串、非空数组或包含必要字段的对象
          return (typeof v === 'string' && v.trim() !== '') || 
                 (Array.isArray(v) && v.length > 0) || 
                 (v && typeof v === 'object');
        },
        message: props => '消息内容不能为空'
      }
    },
    hasImage: {
      type: Boolean,
      default: false
    },
    // 添加以下字段以支持存储思考过程
    hasReasoning: {
      type: Boolean,
      default: false
    },
    reasoning: {
      type: String,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 索引，用于提升查询效率
conversationSchema.index({ userId: 1 });
conversationSchema.index({ createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

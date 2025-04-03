const mongoose = require('mongoose');
const config = require('../config');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    unique: true,
    trim: true,
    minlength: [3, '用户名长度不能少于3个字符'],
    maxlength: [30, '用户名长度不能超过30个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱是必填项'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址'],
    trim: true
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码长度不能少于6个字符'],
    select: false // 查询时默认不返回密码字段
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'en-US'],
      default: 'zh-CN'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    aiModel: {
      type: String,
      default: config.AI_API.model || 'deepseek/deepseek-chat-v3-0324:free'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, { timestamps: true });

// 索引，用于提升查询效率
// 注意：由于在字段定义时已通过unique: true设置了唯一索引，这些额外的索引定义是不必要的
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

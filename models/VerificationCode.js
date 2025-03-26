const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['register', 'password_reset', 'email_change', 'login'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // 10分钟后过期
      return new Date(Date.now() + 10 * 60 * 1000);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引，用于提升查询效率
verificationCodeSchema.index({ email: 1, type: 1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL索引，过期自动删除

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;

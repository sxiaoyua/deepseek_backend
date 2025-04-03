const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const emailService = require('../utils/emailService');

// 生成随机验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// 发送验证码
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ message: '请提供邮箱地址' });
    }

    // 验证邮箱格式
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请提供有效的邮箱地址' });
    }
    
    // 验证验证码类型
    const allowedTypes = ['register', 'password_reset', 'email_change', 'login'];
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ message: '无效的验证码类型' });
    }

    // 检查是否已注册（仅注册流程需要）
    if (type === 'register') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }
    }

    // 生成验证码
    const code = generateVerificationCode();

    // 保存验证码 - 显式设置过期时间
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期
    await VerificationCode.findOneAndUpdate(
      { email, type },
      { email, code, type, expiresAt },
      { upsert: true, new: true }
    );

    // 发送验证码邮件
    const emailResult = await emailService.sendVerificationCode(email, code, type);

    if (!emailResult.success) {
      return res.status(500).json({ message: '发送验证码失败', error: emailResult.error });
    }

    res.status(200).json({ message: '验证码已发送，有效期10分钟' });
  } catch (error) {
    console.error('发送验证码出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password, code } = req.body;

    // 验证必填字段
    if (!username || !email || !password || !code) {
      return res.status(400).json({ message: '请提供所有必填字段' });
    }

    // 验证验证码
    const verification = await VerificationCode.findOne({
      email,
      code,
      type: 'register',
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被注册' });
    }

    // 创建加密的密码
    const hashedPassword = await crypto.createHash('sha256').update(password).digest('hex');

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: true
    });

    // 删除已使用的验证码
    await VerificationCode.deleteOne({ _id: verification._id });

    // 生成JWT令牌
    const token = generateToken(user._id);

    // 清除敏感信息
    user.password = undefined;

    res.status(201).json({
      message: '注册成功',
      token,
      user
    });
  } catch (error) {
    console.error('注册出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ message: '请提供邮箱和密码' });
    }

    // 查找用户
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 验证密码
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (hashedPassword !== user.password) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    // 清除敏感信息
    user.password = undefined;

    res.status(200).json({
      message: '登录成功',
      token,
      user
    });
  } catch (error) {
    console.error('登录出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 邮箱验证码登录
exports.loginWithCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // 验证必填字段
    if (!email || !code) {
      return res.status(400).json({ message: '请提供邮箱和验证码' });
    }

    // 验证验证码
    const verification = await VerificationCode.findOne({
      email,
      code,
      type: 'login',
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    // 查找用户
    let user = await User.findOne({ email });
    
    // 如果用户不存在，则创建新用户
    if (!user) {
      user = await User.create({
        username: email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'),
        isVerified: true
      });
    }

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 删除已使用的验证码
    await VerificationCode.deleteOne({ _id: verification._id });

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.status(200).json({
      message: '登录成功',
      token,
      user
    });
  } catch (error) {
    console.error('验证码登录出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 请求重置密码
exports.forgotPassword = async (req, res) => {
  try {
    const { email, code } = req.body;

    // 验证必填字段
    if (!email || !code) {
      return res.status(400).json({ message: '请提供邮箱和验证码' });
    }
    
    // 验证验证码
    const verification = await VerificationCode.findOne({
      email,
      code,
      type: 'password_reset',
      expiresAt: { $gt: new Date() }
    });
    console.log(verification);
    if (!verification) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '该邮箱未注册' });
    }

    // 生成密码重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30分钟有效

    await user.save();

    // 删除已使用的验证码
    await VerificationCode.deleteOne({ _id: verification._id });

    res.status(200).json({ 
      message: '验证成功，请设置新密码',
      resetToken 
    });
  } catch (error) {
    console.error('忘记密码出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    // 验证必填字段
    if (!resetToken || !password) {
      return res.status(400).json({ message: '请提供重置令牌和新密码' });
    }

    // 查找有效的重置令牌
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: '重置令牌无效或已过期' });
    }

    // 更新密码
    user.password = crypto.createHash('sha256').update(password).digest('hex');
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.status(200).json({
      message: '密码重置成功',
      token
    });
  } catch (error) {
    console.error('重置密码出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '未找到用户' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('获取用户信息出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

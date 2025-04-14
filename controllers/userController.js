const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const crypto = require('crypto');

// 获取用户资料
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '未找到用户' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户资料出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新用户资料
exports.updateProfile = async (req, res) => {
  try {
    const { username, avatar, settings } = req.body;
    
    // 构建更新对象
    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = settings;

    // 查找并更新用户
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: '未找到用户' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('更新用户资料出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请提供当前密码和新密码' });
    }

    // 获取用户（包含密码字段）
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: '未找到用户' });
    }

    // 验证当前密码
    const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (hashedCurrentPassword !== user.password) {
      return res.status(401).json({ message: '当前密码不正确' });
    }

    // 更新密码
    user.password = crypto.createHash('sha256').update(newPassword).digest('hex');
    await user.save();

    res.status(200).json({
      success: true,
      message: '密码更新成功'
    });
  } catch (error) {
    console.error('更新密码出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新邮箱
exports.updateEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // 验证必填字段
    if (!email || !code) {
      return res.status(400).json({ message: '请提供新邮箱和验证码' });
    }

    // 验证验证码
    const verification = await VerificationCode.findOne({
      email,
      code,
      type: 'email_change',
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    // 检查邮箱是否已被其他用户使用
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被其他账户使用' });
    }

    // 更新用户邮箱
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: '未找到用户' });
    }

    // 删除已使用的验证码
    await VerificationCode.deleteOne({ _id: verification._id });

    res.status(200).json({
      success: true,
      message: '邮箱更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新邮箱出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

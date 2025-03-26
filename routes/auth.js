const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// 发送验证码
router.post('/send-verification', authController.sendVerificationCode);

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 邮箱验证码登录
router.post('/login-with-code', authController.loginWithCode);

// 请求重置密码
router.post('/forgot-password', authController.forgotPassword);

// 重置密码
router.post('/reset-password', authController.resetPassword);

// 获取当前用户信息（需要认证）
router.get('/me', auth, authController.getMe);

module.exports = router;

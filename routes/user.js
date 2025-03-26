const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// 所有用户路由都需要认证
router.use(auth);

// 获取用户资料
router.get('/profile', userController.getProfile);

// 更新用户资料
router.put('/profile', userController.updateProfile);

// 更新密码
router.put('/password', userController.updatePassword);

// 更新邮箱
router.put('/email', userController.updateEmail);

module.exports = router;

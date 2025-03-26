const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 认证中间件
 * 验证请求中的JWT令牌，并将用户信息附加到请求对象
 */
module.exports = async (req, res, next) => {
  try {
    let token;

    // 从请求头中获取令牌
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查令牌是否存在
    if (!token) {
      return res.status(401).json({ message: '未授权，请登录' });
    }

    try {
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 从数据库中获取用户
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: '该令牌不属于任何用户' });
      }

      // 将用户附加到请求对象
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: '令牌无效', error: error.message });
    }
  } catch (error) {
    console.error('认证中间件出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

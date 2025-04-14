const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversation');

// 配置环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 配置Session中间件
app.use(session({
  secret: process.env.SESSION_SECRET || 'deepseek-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24小时过期
  }
}));

// 设置Swagger文档
const setupSwagger = require('./config/swagger');
setupSwagger(app, session);

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deepseek')
.then(() => console.log('MongoDB 连接成功'))
.catch(err => console.error('MongoDB 连接失败:', err));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

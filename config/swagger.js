const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const express = require('express');

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DeepSeek API文档',
      version: '1.0.0',
      description: '后端API接口文档',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./docs/*.js'], // 指定API文档文件位置
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI选项
const swaggerUIOptions = {
  swaggerOptions: {
    persistAuthorization: true
  }
};

// 登录页面HTML模板
const loginPageTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>API文档登录</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .login-container {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      margin-top: 0;
      color: #333;
      text-align: center;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    label {
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    input {
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      padding: 0.75rem;
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      background-color: #3367d6;
    }
    .error-message {
      color: #d32f2f;
      text-align: center;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>API文档登录</h1>
    {{#if error}}
    <div class="error-message">{{error}}</div>
    {{/if}}
    <form method="POST" action="/api-docs/login">
      <label for="username">用户名</label>
      <input type="text" id="username" name="username" required>
      <label for="password">密码</label>
      <input type="password" id="password" name="password" required>
      <button type="submit">登录</button>
    </form>
  </div>
</body>
</html>
`;

/**
 * 为Express应用设置Swagger文档
 * @param {Object} app - Express应用实例
 * @param {Object} session - Express会话中间件
 */
function setupSwagger(app, session) {
  // 基于环境变量决定是否启用Swagger文档
  const isProduction = process.env.NODE_ENV === 'production';

  // 在非生产环境或启用了调试模式时提供Swagger文档
  if (!isProduction || process.env.ENABLE_SWAGGER === 'true') {
    
    // 创建认证中间件
    const swaggerAuth = (req, res, next) => {
      // 从环境变量获取用户名和密码
      const SWAGGER_USER = process.env.SWAGGER_USER || 'admin';
      const SWAGGER_PASSWORD = process.env.SWAGGER_PASSWORD || 'admin123';
      
      // 如果已登录，直接通过
      if (req.session && req.session.swaggerAuthenticated) {
        return next();
      }
      
      // 登录页面路由
      if (req.path === '/login') {
        if (req.method === 'GET') {
          // 渲染登录页面
          return res.send(loginPageTemplate.replace('{{#if error}}', '').replace('{{error}}', '').replace('{{/if}}', ''));
        } else if (req.method === 'POST') {
          // 处理登录请求
          const { username, password } = req.body;
          
          if (username === SWAGGER_USER && password === SWAGGER_PASSWORD) {
            req.session.swaggerAuthenticated = true;
            return res.redirect('/api-docs');
          } else {
            // 登录失败
            const errorMessage = '用户名或密码错误';
            return res.send(
              loginPageTemplate
                .replace('{{#if error}}', '')
                .replace('{{error}}', errorMessage)
                .replace('{{/if}}', '')
            );
          }
        }
      }
      
      // 未登录，重定向到登录页面
      return res.redirect('/api-docs/login');
    };
    
    // 处理登录页面路由
    app.use('/api-docs/login', express.urlencoded({ extended: true }));
    
    // 添加登出功能 - 将登出路由移到这里，在主Swagger路由之前
    app.get('/api-docs/logout', (req, res) => {
      // 确保销毁会话
      req.session.swaggerAuthenticated = false;
      req.session.save((err) => {
        if (err) {
          console.error('保存会话时出错:', err);
        }
        res.redirect('/api-docs/login');
      });
    });
    
    // 设置Swagger路由，使用会话认证
    app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUIOptions));
    
    // 在控制台输出API文档地址
    const PORT = process.env.PORT || 5000;
    console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
  }
}

module.exports = setupSwagger; 
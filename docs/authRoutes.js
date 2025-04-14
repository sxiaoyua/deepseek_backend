/**
 * 认证路由API文档
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec9f8e1b5c2f4c8b1234"
 *         username:
 *           type: string
 *           example: "张三"
 *         email:
 *           type: string
 *           example: "zhangsan@example.com"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatars/default.png"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: "user"
 *         status:
 *           type: string
 *           enum: [active, inactive, banned]
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec9f8e1b5c2f4c8b1234"
 *         username:
 *           type: string
 *           example: "张三"
 *         email:
 *           type: string
 *           example: "zhangsan@example.com"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatars/default.png"
 *         role:
 *           type: string
 *           example: "user"
 *         status:
 *           type: string
 *           example: "active"
 *         settings:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               example: "light"
 *             language:
 *               type: string
 *               example: "zh-CN"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *     AuthToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresIn:
 *           type: integer
 *           example: 86400
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "请求参数错误"
 *         error:
 *           type: string
 *           example: "邮箱格式不正确"
 */

/**
 * @swagger
 * tags:
 *   name: 认证
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /api/auth/send-verification:
 *   post:
 *     summary: 发送验证码
 *     description: 向指定邮箱发送验证码，可用于注册、登录、重置密码等场景
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - type
 *             properties:
 *               email:
 *                 type: string
 *                 description: 用户邮箱
 *                 example: "zhangsan@example.com"
 *               type:
 *                 type: string
 *                 description: 验证码类型
 *                 enum: [register, login, reset_password, email_change]
 *                 example: "register"
 *     responses:
 *       200:
 *         description: 验证码发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "验证码已发送，有效期10分钟"
 *       400:
 *         description: 验证码发送失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供有效的邮箱地址"
 *       429:
 *         description: 请求过于频繁
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请求过于频繁，请稍后再试"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "发送验证码失败"
 *                 error:
 *                   type: string
 *                   example: "邮件服务不可用"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 使用邮箱、用户名、密码和验证码注册新用户
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - code
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *                 example: "张三"
 *               email:
 *                 type: string
 *                 description: 邮箱
 *                 example: "zhangsan@example.com"
 *               password:
 *                 type: string
 *                 description: 密码（8-20位，包含字母和数字）
 *                 example: "Password123"
 *               code:
 *                 type: string
 *                 description: 邮箱验证码
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "注册成功"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 注册失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "验证码无效或已过期"
 *       409:
 *         description: 邮箱或用户名已存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "用户名或邮箱已被注册"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 *                 error:
 *                   type: string
 *                   example: "用户创建失败"
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 使用邮箱和密码登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱
 *                 example: "zhangsan@example.com"
 *               password:
 *                 type: string
 *                 description: 密码
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "登录成功"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供邮箱和密码"
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "邮箱或密码不正确"
 *       403:
 *         description: 账号已被禁用
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "账号已被禁用"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 *                 error:
 *                   type: string
 *                   example: "数据库连接失败"
 */

/**
 * @swagger
 * /api/auth/login-with-code:
 *   post:
 *     summary: 邮箱验证码登录
 *     description: 使用邮箱和验证码登录（无需密码）
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱
 *                 example: "zhangsan@example.com"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "登录成功"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供邮箱和验证码"
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "验证码无效或已过期"
 *       403:
 *         description: 账号已被禁用
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "账号已被禁用"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 *                 error:
 *                   type: string
 *                   example: "登录失败"
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 请求重置密码
 *     description: 请求重置密码，系统将发送验证码到邮箱
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱
 *                 example: "zhangsan@example.com"
 *     responses:
 *       200:
 *         description: 重置密码请求已发送
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "验证码已发送，请查看邮箱"
 *       400:
 *         description: 请求失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供有效的邮箱地址"
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "该邮箱未注册"
 *       429:
 *         description: 请求过于频繁
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请求过于频繁，请稍后再试"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 *                 error:
 *                   type: string
 *                   example: "验证码发送失败"
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 重置密码
 *     description: 使用验证码重置密码
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱
 *                 example: "zhangsan@example.com"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 description: 新密码（8-20位，包含字母和数字）
 *                 example: "NewPassword123"
 *     responses:
 *       200:
 *         description: 密码重置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "密码重置成功"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 密码重置失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "验证码无效或已过期"
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "该邮箱未注册"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 *                 error:
 *                   type: string
 *                   example: "密码重置失败"
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取当前登录用户的详细信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: 未认证或Token已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未授权，请登录"
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未找到用户"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 *                 error:
 *                   type: string
 *                   example: "获取用户信息失败"
 */ 
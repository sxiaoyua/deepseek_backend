/**
 * 用户路由API文档
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         theme:
 *           type: string
 *           enum: [light, dark, system]
 *           example: "dark"
 *         language:
 *           type: string
 *           enum: [zh-CN, en-US]
 *           example: "zh-CN"
 *         fontSize:
 *           type: string
 *           enum: [small, medium, large]
 *           example: "medium"
 *         defaultModelId:
 *           type: string
 *           example: "gpt-4o"
 *         notifications:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *               example: true
 *             browser:
 *               type: boolean
 *               example: true
 *     UserProfileDetail:
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
 *           $ref: '#/components/schemas/UserSettings'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-07-20T14:25:00Z"
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "请求参数错误"
 *         error:
 *           type: string
 *           example: "用户名格式不正确"
 */

/**
 * @swagger
 * tags:
 *   name: 用户
 *   description: 用户信息管理接口
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 获取用户资料
 *     description: 获取当前登录用户的详细资料
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户资料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfileDetail'
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
 *                   example: "数据库查询失败"
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 更新用户资料
 *     description: 更新当前登录用户的个人资料和设置
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *                 example: "李四"
 *               avatar:
 *                 type: string
 *                 description: 头像URL
 *                 example: "https://example.com/avatars/user1.png"
 *               settings:
 *                 $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: 资料更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfileDetail'
 *       400:
 *         description: 资料更新失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "用户名格式不正确"
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
 *                   example: "用户更新失败"
 */

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: 修改密码
 *     description: 修改当前登录用户的密码，需要提供当前密码
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: 当前密码
 *                 example: "CurrentPassword123"
 *               newPassword:
 *                 type: string
 *                 description: 新密码
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: 密码修改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "密码更新成功"
 *       400:
 *         description: 密码修改失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供当前密码和新密码"
 *       401:
 *         description: 未认证或当前密码错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "当前密码不正确"
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
 *                   example: "密码更新失败"
 */

/**
 * @swagger
 * /api/users/email:
 *   put:
 *     summary: 更新邮箱
 *     description: 更新当前登录用户的邮箱地址，需要提供验证码
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
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
 *                 description: 新邮箱地址
 *                 example: "newemail@example.com"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 邮箱更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "邮箱更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfileDetail'
 *       400:
 *         description: 邮箱更新失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供新邮箱和验证码"
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
 *                   example: "数据库连接失败"
 */ 
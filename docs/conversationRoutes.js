/**
 * 会话路由API文档
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec9f8e1b5c2f4c8b4567"
 *         title:
 *           type: string
 *           example: "量子计算讨论"
 *         userId:
 *           type: string
 *           example: "60d5ec9f8e1b5c2f4c8b1234"
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T09:45:00Z"
 *     ConversationSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec9f8e1b5c2f4c8b4567"
 *         title:
 *           type: string
 *           example: "量子计算讨论"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T09:45:00Z"
 *     Message:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *           example: "user"
 *         content:
 *           oneOf:
 *             - type: string
 *               example: "你好，请帮我解释一下量子计算的基本原理"
 *             - type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [text, image_url]
 *                   text:
 *                     type: string
 *                   image_url:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *         hasImage:
 *           type: boolean
 *           example: false
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T08:30:00Z"
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "请求参数错误"
 *         error:
 *           type: string
 *           example: "无效的会话ID格式"
 */

/**
 * @swagger
 * tags:
 *   name: 会话
 *   description: 用户对话管理接口
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: 获取所有对话
 *     description: 获取当前用户的所有对话列表，按更新时间倒序排列
 *     tags: [会话]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取对话列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 12
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConversationSummary'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未授权，请登录"
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
 * /api/conversations/{id}:
 *   get:
 *     summary: 获取单个对话
 *     description: 获取指定ID的对话详情，包括所有消息内容
 *     tags: [会话]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 对话ID
 *         example: "60d5ec9f8e1b5c2f4c8b4567"
 *     responses:
 *       200:
 *         description: 成功获取对话详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未授权，请登录"
 *       404:
 *         description: 对话不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未找到对话"
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
 * /api/conversations:
 *   post:
 *     summary: 创建新对话
 *     description: 创建一个新的对话
 *     tags: [会话]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 对话标题（可选，默认为"新对话"）
 *                 example: "关于宇宙起源的讨论"
 *     responses:
 *       201:
 *         description: 对话创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未授权，请登录"
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
 *                   example: "创建对话失败"
 */

/**
 * @swagger
 * /api/conversations/{id}:
 *   put:
 *     summary: 更新对话标题
 *     description: 更新指定对话的标题
 *     tags: [会话]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 对话ID
 *         example: "60d5ec9f8e1b5c2f4c8b4567"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 新的对话标题
 *                 example: "量子物理学讨论"
 *     responses:
 *       200:
 *         description: 对话更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "请提供有效的标题"
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未授权，请登录"
 *       404:
 *         description: 对话不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未找到对话"
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
 *                   example: "更新对话失败"
 */

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     summary: 删除对话
 *     description: 删除指定的对话及其所有消息
 *     tags: [会话]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 对话ID
 *         example: "60d5ec9f8e1b5c2f4c8b4567"
 *     responses:
 *       200:
 *         description: 对话删除成功
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
 *                   example: "对话已删除"
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未授权，请登录"
 *       404:
 *         description: 对话不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "未找到对话"
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
 *                   example: "删除对话失败" 
 */ 
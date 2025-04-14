/**
 * 聊天路由API文档
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Model:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "gpt-4o"
 *         name:
 *           type: string
 *           example: "GPT-4o"
 *         description:
 *           type: string
 *           example: "GPT-4o是最新一代AI模型，支持文本和图像输入"
 *     ModelResponse:
 *       type: object
 *       properties:
 *         current:
 *           type: string
 *           example: "gpt-4o"
 *         available:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Model'
 *         capabilities:
 *           type: object
 *           properties:
 *             multimodal:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["gpt-4o", "claude-3"]
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
 *           example: "缺少必要的content字段"
 */

/**
 * @swagger
 * tags:
 *   name: 聊天
 *   description: 聊天与AI交互相关接口
 */

/**
 * @swagger
 * /api/chat/models:
 *   get:
 *     summary: 获取可用的AI模型列表
 *     description: 返回系统支持的所有AI模型列表及其详细信息，包括当前用户使用的模型
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取模型列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ModelResponse'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/chat/models/set:
 *   post:
 *     summary: 设置当前使用的AI模型
 *     description: 为当前用户会话设置默认的AI模型
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *             properties:
 *               modelId:
 *                 type: string
 *                 description: 要设置的模型ID
 *                 example: "gpt-4o"
 *     responses:
 *       200:
 *         description: 模型设置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     model:
 *                       type: string
 *                       example: "gpt-4o"
 *                     supportsImages:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: 发送消息到AI（可以包含图像）
 *     description: 向AI发送文本消息或包含图像的多模态消息，支持新建对话或在现有对话中继续
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: 对话ID（可选，如果不提供则创建新对话）
 *                 example: "60d5ec9f8e1b5c2f4c8b4567"
 *               message:
 *                 type: string
 *                 description: 消息文本内容（至少需要提供消息或图像URL之一）
 *                 example: "请分析这张图片中的内容"
 *               imageUrl:
 *                 type: string
 *                 description: 图像URL（可选，如提供则发送多模态消息）
 *                 example: "https://example.com/images/sample.jpg"
 *     responses:
 *       200:
 *         description: 消息发送成功，返回AI响应
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                       example: "60d5ec9f8e1b5c2f4c8b4567"
 *                     message:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 对话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/chat/analyze-image:
 *   post:
 *     summary: 单独的图像分析请求（不保存对话）
 *     description: 上传图像URL请求AI分析，可以提供提示词引导分析方向，结果不会保存到对话历史中
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: 图像URL
 *                 example: "https://example.com/images/sample.jpg"
 *               prompt:
 *                 type: string
 *                 description: 分析提示（可选）
 *                 example: "这张图片中有什么特别的地方？"
 *     responses:
 *       200:
 *         description: 图像分析成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: string
 *                       example: "这张图片显示了一片郁郁葱葱的森林景观，特别之处在于..."
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未认证或认证已过期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */ 
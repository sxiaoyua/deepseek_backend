const Conversation = require('../models/Conversation');

// 获取所有对话
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查询用户的所有对话，按更新时间倒序排列，不包含消息内容
    const conversations = await Conversation.find({ userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('获取对话列表出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取单个对话
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查询指定的对话
    const conversation = await Conversation.findOne({ _id: id, userId });

    if (!conversation) {
      return res.status(404).json({ message: '未找到对话' });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('获取对话详情出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 创建新对话
exports.createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    // 创建新对话
    const conversation = await Conversation.create({
      userId,
      title: title || '新对话',
      messages: []
    });

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('创建对话出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新对话标题
exports.updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    // 验证标题（允许空字符串作为默认值）
    if (title === undefined) {
      return res.status(400).json({ message: '标题不能为空' });
    }

    // 使用提供的标题或默认值
    const finalTitle = (typeof title === 'string' && title.trim() !== '') 
      ? title 
      : '新对话';

    // 查找并更新对话
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { title: finalTitle },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: '未找到对话' });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('更新对话出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除对话
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查找并删除对话
    const conversation = await Conversation.findOneAndDelete({ _id: id, userId });

    if (!conversation) {
      return res.status(404).json({ message: '未找到对话' });
    }

    res.status(200).json({
      success: true,
      message: '对话已删除'
    });
  } catch (error) {
    console.error('删除对话出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

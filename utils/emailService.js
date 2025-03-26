const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.EMAIL.service,
      auth: {
        user: config.EMAIL.user,
        pass: config.EMAIL.pass // 授权码，不是QQ密码
      }
    });
  }

  /**
   * 发送验证码邮件
   * @param {string} to 收件人邮箱
   * @param {string} code 验证码
   * @param {string} type 验证码类型
   * @returns {Promise} 发送结果
   */
  async sendVerificationCode(to, code, type) {
    // 根据不同类型设置不同的主题和内容
    let subject = '验证码';
    let content = `您的验证码是: ${code}，有效期10分钟。`;
    
    switch(type) {
      case 'register':
        subject = '注册验证码';
        content = `您正在注册账号，验证码是: ${code}，有效期10分钟。如非本人操作，请忽略此邮件。`;
        break;
      case 'password_reset':
        subject = '重置密码验证码';
        content = `您正在重置密码，验证码是: ${code}，有效期10分钟。如非本人操作，请忽略此邮件。`;
        break;
      case 'email_change':
        subject = '修改邮箱验证码';
        content = `您正在修改邮箱，验证码是: ${code}，有效期10分钟。如非本人操作，请忽略此邮件。`;
        break;
      case 'login':
        subject = '登录验证码';
        content = `您正在使用验证码登录，验证码是: ${code}，有效期10分钟。如非本人操作，请忽略此邮件。`;
        break;
    }

    const mailOptions = {
      from: config.EMAIL.user,
      to,
      subject,
      text: content,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #0066cc;">${subject}</h2>
              <p>${content}</p>
              <p style="font-size: 24px; font-weight: bold; color: #0066cc; margin: 20px 0;">${code}</p>
              <p>此邮件由系统自动发送，请勿回复。</p>
            </div>`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('邮件发送失败:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService(); 
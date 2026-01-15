const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const logger = require('../config/logger');

// Load environment variables from .env file
dotenv.config();

class EmailService {
  constructor() {
    // Initialize transporter based on environment variables from .env
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@oopshop.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'OOPshop';
    
    // Only create transporter if email is configured
    if (this.isEmailConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * Check if email is configured
   */
  isEmailConfigured() {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, html, text = null) {
    if (!this.isEmailConfigured()) {
      logger.warn('Email not configured. Skipping email send.', { to, subject });
      return { success: false, message: 'Email not configured' };
    }

    if (!this.transporter) {
      logger.error('Email transporter not initialized');
      return { success: false, message: 'Email transporter not initialized' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        text: text || this.htmlToText(html),
        html,
      });

      logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending email', { to, subject, error: error.message });
      return { success: false, message: error.message };
    }
  }

  /**
   * Convert HTML to plain text (simple version)
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Generate order placed email template
   */
  generateOrderPlacedTemplate(invoice, user, items) {
    const orderDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.unit_price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - OOPshop</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">Order Confirmed!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
    <p>Dear ${user.first_name} ${user.last_name},</p>
    
    <p>Thank you for your order! We've received your order and it's being processed.</p>
    
    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #ddd;">
      <h2 style="margin-top: 0; color: #4CAF50;">Order Details</h2>
      <p><strong>Order Number:</strong> #${invoice.id}</p>
      <p><strong>Order Date:</strong> ${orderDate}</p>
      <p><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">${invoice.status.toUpperCase()}</span></p>
      <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #4CAF50;">$${parseFloat(invoice.total_amount).toFixed(2)}</span></p>
    </div>
    
    <h3 style="color: #333;">Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; background-color: white; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd; font-size: 1.1em; color: #4CAF50;">$${parseFloat(invoice.total_amount).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    
    <div style="background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2196F3;">
      <p style="margin: 0;"><strong>Next Steps:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>We'll send you a confirmation email once your payment is processed.</li>
        <li>You'll receive another email when your order ships.</li>
        <li>You can track your order status in your account dashboard.</li>
      </ul>
    </div>
    
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
    
    <p>Best regards,<br>The OOPshop Team</p>
  </div>
  
  <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 0.9em; margin-top: 20px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} OOPshop. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate order shipped email template
   */
  generateOrderShippedTemplate(invoice, user, items) {
    const shippedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.unit_price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped - OOPshop</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">🚚 Your Order Has Shipped!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
    <p>Dear ${user.first_name} ${user.last_name},</p>
    
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #ddd;">
      <h2 style="margin-top: 0; color: #2196F3;">Shipping Details</h2>
      <p><strong>Order Number:</strong> #${invoice.id}</p>
      <p><strong>Shipped Date:</strong> ${shippedDate}</p>
      <p><strong>Status:</strong> <span style="color: #2196F3; font-weight: bold;">SHIPPED</span></p>
      <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #4CAF50;">$${parseFloat(invoice.total_amount).toFixed(2)}</span></p>
    </div>
    
    <h3 style="color: #333;">Shipped Items</h3>
    <table style="width: 100%; border-collapse: collapse; background-color: white; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd; font-size: 1.1em; color: #4CAF50;">$${parseFloat(invoice.total_amount).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    
    <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
      <p style="margin: 0;"><strong>📦 What's Next?</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Your order is on its way and should arrive soon.</li>
        <li>You'll receive tracking information if available.</li>
        <li>Please ensure someone is available to receive the package.</li>
      </ul>
    </div>
    
    <p>We hope you enjoy your purchase! If you have any questions or concerns, please contact our support team.</p>
    
    <p>Thank you for shopping with us!<br>The OOPshop Team</p>
  </div>
  
  <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 0.9em; margin-top: 20px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} OOPshop. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send order placed email
   */
  async sendOrderPlacedEmail(invoice, user, items) {
    if (!user.email) {
      logger.warn('Cannot send order placed email: user has no email', { invoiceId: invoice.id, userId: user.id });
      return { success: false, message: 'User has no email' };
    }

    const subject = `Order Confirmation #${invoice.id} - OOPshop`;
    const html = this.generateOrderPlacedTemplate(invoice, user, items);

    return await this.sendEmail(user.email, subject, html);
  }

  /**
   * Send order shipped email
   */
  async sendOrderShippedEmail(invoice, user, items) {
    if (!user.email) {
      logger.warn('Cannot send order shipped email: user has no email', { invoiceId: invoice.id, userId: user.id });
      return { success: false, message: 'User has no email' };
    }

    const subject = `Your Order #${invoice.id} Has Shipped! - OOPshop`;
    const html = this.generateOrderShippedTemplate(invoice, user, items);

    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();

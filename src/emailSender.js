const nodemailer = require('nodemailer');
const config = require('../config/config');
const { logger, textUtils, retry } = require('./utils');

class EmailNotifier {
  constructor() {
    this.transporter = null;
    this.isEnabled = config.email.enabled;
    
    if (this.isEnabled) {
      this.initializeTransporter();
    } else {
      logger.debug('Email notifications disabled - no email credentials configured');
    }
  }

  /**
   * Initialize the email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: config.email.user,
          pass: config.email.pass
        },
      });

      logger.info('✅ Email transporter initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize email transporter:', error.message);
      this.isEnabled = false;
    }
  }

  /**
   * Test email connection
   */
  async testConnection() {
    if (!this.isEnabled || !this.transporter) {
      return { success: false, error: 'Email not initialized' };
    }

    try {
      await this.transporter.verify();
      logger.info('✅ Email connection verified successfully');
      
      // Send test email
      const testResult = await this.sendTestEmail();
      return { success: true, testEmailSent: testResult.success };
      
    } catch (error) {
      logger.error('❌ Email connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML email template for breaking news
   */
  generateEmailHTML(article) {
    const timestamp = textUtils.formatTimestamp(article.pubDate);
    const domain = textUtils.getDomainFromUrl(article.link);
    const alertTime = new Date().toLocaleString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nigerian Breaking News Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .alert-badge {
            background: #ff4757;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin: 15px 0;
            color: #2c3e50;
        }
        .meta-info {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
        }
        .meta-label {
            font-weight: bold;
            color: #34495e;
        }
        .description {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
            font-size: 16px;
            line-height: 1.8;
        }
        .cta-button {
            background: linear-gradient(135deg, #00d2d3, #54a0ff);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
        }
        .nigeria-flag {
            font-size: 20px;
            margin: 0 5px;
        }
        .source-badge {
            background: #2ecc71;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-badge">🚨 BREAKING NEWS ALERT</div>
            <h1>Nigerian News Alert System</h1>
            <div class="nigeria-flag">🇳🇬</div>
        </div>
        
        <div class="title">${textUtils.cleanText(article.title)}</div>
        
        <div class="meta-info">
            <div class="meta-row">
                <span class="meta-label">📰 Source:</span>
                <span class="source-badge">${article.source.toUpperCase()}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">🌐 Domain:</span>
                <span>${domain}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">⏰ Published:</span>
                <span>${timestamp}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">🕐 Alert Time:</span>
                <span>${alertTime}</span>
            </div>
        </div>
        
        ${article.description ? `
        <div class="description">
            <strong>📝 Article Summary:</strong><br>
            ${textUtils.cleanText(article.description, 500)}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${article.link}" class="cta-button" target="_blank">
                📖 Read Full Article
            </a>
        </div>
        
        <div class="footer">
            <p><strong>Nigerian Breaking News Alert System</strong></p>
            <p>Monitoring international news outlets for Nigerian breaking news</p>
            <p style="font-size: 12px; color: #95a5a6;">
                This is an automated alert. Please verify information from original sources.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate plain text version for email clients that don't support HTML
   */
  generateEmailText(article) {
    const timestamp = textUtils.formatTimestamp(article.pubDate);
    const domain = textUtils.getDomainFromUrl(article.link);
    const alertTime = new Date().toLocaleString();
    
    return `
🚨 BREAKING: NIGERIAN NEWS ALERT 🇳🇬

${article.title}

📰 Source: ${article.source.toUpperCase()}
🌐 Domain: ${domain}
⏰ Published: ${timestamp}
🕐 Alert Time: ${alertTime}

📝 Article Summary:
${article.description ? textUtils.cleanText(article.description, 500) : 'No description available'}

🔗 Read Full Article: ${article.link}

────────────────────────────────
Nigerian Breaking News Alert System
Monitoring international news outlets for Nigerian breaking news

This is an automated alert. Please verify information from original sources.
`;
  }

  /**
   * Send breaking news alert via email
   */
  async sendAlert(article) {
    if (!this.isEnabled || !this.transporter) {
      logger.debug('Email notification skipped - transporter not enabled');
      return { success: false, error: 'Email not enabled' };
    }

    try {
      const subject = `🚨 BREAKING: ${textUtils.cleanText(article.title, 100)} - Nigerian News Alert`;
      const htmlContent = this.generateEmailHTML(article);
      const textContent = this.generateEmailText(article);

      const mailOptions = {
        from: {
          name: 'Nigerian Breaking News Alert',
          address: config.email.user
        },
        to: config.email.to,
        subject: subject,
        text: textContent,
        html: htmlContent,
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      // Use retry mechanism for reliability
      const result = await retry(async () => {
        return await this.transporter.sendMail(mailOptions);
      }, 3, 3000);

      logger.info(`📧 Email alert sent successfully: ${article.title.substring(0, 60)}...`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      logger.error('❌ Failed to send email alert:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send system status email
   */
  async sendStatusUpdate(stats) {
    if (!this.isEnabled || !this.transporter) {
      return { success: false, error: 'Email not enabled' };
    }

    try {
      const subject = '📊 Nigerian News Alert System - Status Report';
      
      const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; border-radius: 8px;">
        <h1>📊 System Status Report</h1>
        <p>Nigerian Breaking News Alert System</p>
    </div>
    
    <div style="background: white; padding: 30px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold;">⏰ Uptime:</td>
                <td style="padding: 10px;">${stats.uptime || 'Unknown'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold;">📤 Total Alerts Sent:</td>
                <td style="padding: 10px;">${stats.totalAlertsSent || 0}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold;">📄 Articles Processed:</td>
                <td style="padding: 10px;">${stats.totalArticlesProcessed || 0}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold;">💾 Total in Database:</td>
                <td style="padding: 10px;">${stats.totalProcessed || 0}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold;">🚦 Rate Limit:</td>
                <td style="padding: 10px;">${stats.alertsInLastHour || 0}/${stats.maxAlertsPerHour || 12} alerts/hour</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold;">🟢 Status:</td>
                <td style="padding: 10px;">${stats.canSendAlert ? 'Active' : 'Rate Limited'}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">📅 Last Check:</td>
                <td style="padding: 10px;">${stats.lastRunTime || 'Never'}</td>
            </tr>
        </table>
    </div>
    
    <div style="margin-top: 20px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>Nigerian Breaking News Alert System</p>
        <p>Automated Status Report - ${new Date().toLocaleString()}</p>
    </div>
</div>`;

      const textContent = `
📊 NIGERIAN NEWS ALERT SYSTEM - STATUS REPORT

⏰ Uptime: ${stats.uptime || 'Unknown'}
📤 Total Alerts Sent: ${stats.totalAlertsSent || 0}
📄 Articles Processed: ${stats.totalArticlesProcessed || 0}
💾 Total in Database: ${stats.totalProcessed || 0}
🚦 Rate Limit: ${stats.alertsInLastHour || 0}/${stats.maxAlertsPerHour || 12} alerts/hour
🟢 Status: ${stats.canSendAlert ? 'Active' : 'Rate Limited'}
📅 Last Check: ${stats.lastRunTime || 'Never'}

────────────────────────────────
Nigerian Breaking News Alert System
Automated Status Report - ${new Date().toLocaleString()}
`;

      const mailOptions = {
        from: {
          name: 'Nigerian Breaking News Alert',
          address: config.email.user
        },
        to: config.email.to,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('📧 Email status update sent');
      
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('❌ Failed to send email status:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail() {
    if (!this.isEnabled || !this.transporter) {
      return { success: false, error: 'Email not enabled' };
    }

    const testTime = new Date().toLocaleString();
    const subject = '🧪 Test Email - Nigerian Breaking News Alert System';
    
    const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #00d2d3, #54a0ff); color: white; padding: 20px; text-align: center; border-radius: 8px;">
        <h1>🧪 Test Email</h1>
        <p>Nigerian Breaking News Alert System</p>
    </div>
    
    <div style="background: white; padding: 30px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 18px; color: #2c3e50;">✅ Email System Test Successful!</p>
        
        <p>This is a test message to verify that email notifications are working correctly.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <strong>Test Details:</strong><br>
            ⏰ Test Time: ${testTime}<br>
            🟢 Status: All systems operational<br>
            📧 Platform: Email (SMTP)
        </div>
        
        <p>If you receive this message, your email notifications are configured correctly!</p>
    </div>
    
    <div style="margin-top: 20px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>Nigerian Breaking News Alert System</p>
        <p>Email Test - ${testTime}</p>
    </div>
</div>`;

    const textContent = `
🧪 TEST EMAIL - NIGERIAN BREAKING NEWS ALERT SYSTEM

✅ Email System Test Successful!

This is a test message to verify that email notifications are working correctly.

Test Details:
⏰ Test Time: ${testTime}
🟢 Status: All systems operational
📧 Platform: Email (SMTP)

If you receive this message, your email notifications are configured correctly!

────────────────────────────────
Nigerian Breaking News Alert System
Email Test - ${testTime}
`;

    try {
      const mailOptions = {
        from: {
          name: 'Nigerian Breaking News Alert',
          address: config.email.user
        },
        to: config.email.to,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('📧 Test email sent successfully');
      
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('❌ Test email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email system statistics
   */
  getStats() {
    return {
      enabled: this.isEnabled,
      hasTransporter: !!this.transporter,
      emailUser: config.email.user ? config.email.user.substring(0, 8) + '...' : null,
      emailTo: config.email.to ? config.email.to.substring(0, 8) + '...' : null,
      service: config.email.service
    };
  }

  /**
   * Close email transporter
   */
  async close() {
    if (this.transporter) {
      this.transporter.close();
      logger.info('🛑 Email transporter closed');
    }
  }
}

module.exports = EmailNotifier;
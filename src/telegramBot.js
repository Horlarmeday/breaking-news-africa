const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const { logger, textUtils, retry } = require('./utils');

class TelegramNotifier {
  constructor() {
    this.bot = null;
    this.isEnabled = config.telegram.enabled;
    this.chatId = config.telegram.chatId;
    
    if (this.isEnabled) {
      this.initializeBot();
    } else {
      logger.debug('Telegram notifications disabled - no token/chat ID configured');
    }
  }

  /**
   * Initialize the Telegram bot
   */
  initializeBot() {
    try {
      this.bot = new TelegramBot(config.telegram.botToken, {
        polling: false // We don't need to receive messages, only send
      });
      
      logger.info('✅ Telegram bot initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Telegram bot:', error.message);
      this.isEnabled = false;
    }
  }

  /**
   * Test the bot connection
   */
  async testConnection() {
    if (!this.isEnabled || !this.bot) {
      return { success: false, error: 'Bot not initialized' };
    }

    try {
      const me = await this.bot.getMe();
      logger.info(`🤖 Telegram bot connected: @${me.username} (${me.first_name})`);
      
      // Test sending a message
      await this.bot.sendMessage(this.chatId, '🧪 West African Breaking News Alert System - Connection Test\n\nBot is working correctly!');
      
      return { success: true, botInfo: me };
    } catch (error) {
      logger.error('❌ Telegram connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format article for Telegram message
   */
  formatTelegramMessage(article) {
    const emoji = this.getSourceEmoji(article.source);
    const timestamp = textUtils.formatTimestamp(article.pubDate);
    const domain = textUtils.getDomainFromUrl(article.link);
    
    // Clean and truncate description for Telegram (max 4096 chars total)
    const description = textUtils.cleanText(article.description, 300);
    
    const message = `🚨 *BREAKING: WEST AFRICAN NEWS ALERT*

📰 *${textUtils.cleanText(article.title, 200)}*

${emoji} *Source:* ${article.source.toUpperCase()}
🌐 *Domain:* ${domain}
⏰ *Published:* ${timestamp}
🕐 *Alert Time:* ${new Date().toLocaleString()}

📝 ${description}

🔗 [Read Full Article](${article.link})

#BreakingNews #WestAfrica #${article.source.replace(/\s+/g, '')}`;

    return message;
  }

  /**
   * Get emoji for news source
   */
  getSourceEmoji(source) {
    const emojis = {
      'BBC': '📺',
      'CNN': '📻',
      'Al Jazeera': '🌍',
      'MSNBC': '📡',
      'Sky News': '🛰️'
    };
    return emojis[source] || '📰';
  }

  /**
   * Send breaking news alert via Telegram
   */
  async sendAlert(article) {
    if (!this.isEnabled || !this.bot) {
      logger.debug('Telegram notification skipped - bot not enabled');
      return { success: false, error: 'Bot not enabled' };
    }

    try {
      const message = this.formatTelegramMessage(article);
      
      // Use retry mechanism for reliability
      const result = await retry(async () => {
        return await this.bot.sendMessage(this.chatId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
          disable_notification: false // Keep notifications on for breaking news
        });
      }, 3, 2000);

      logger.info(`📱 Telegram alert sent successfully: ${article.title.substring(0, 60)}...`);
      
      return { 
        success: true, 
        messageId: result.message_id,
        chatId: result.chat.id 
      };

    } catch (error) {
      logger.error('❌ Failed to send Telegram alert:', error.message);
      
      // If markdown fails, try plain text
      if (error.message.includes('parse')) {
        try {
          const plainMessage = this.formatTelegramMessage(article)
            .replace(/\*/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
            
          const result = await this.bot.sendMessage(this.chatId, plainMessage);
          logger.info('📱 Telegram alert sent as plain text (markdown failed)');
          
          return { 
            success: true, 
            messageId: result.message_id,
            fallback: true 
          };
        } catch (plainError) {
          logger.error('❌ Plain text Telegram fallback also failed:', plainError.message);
        }
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Send system status update
   */
  async sendStatusUpdate(stats) {
    if (!this.isEnabled || !this.bot) {
      return { success: false, error: 'Bot not enabled' };
    }

    try {
      const message = `📊 *West African News Alert System Status*

⏰ *Uptime:* ${stats.uptime || 'Unknown'}
📤 *Alerts Sent:* ${stats.totalAlertsSent || 0}
📄 *Articles Processed:* ${stats.totalArticlesProcessed || 0}
💾 *Total in Database:* ${stats.totalProcessed || 0}
🚦 *Rate Limit:* ${stats.alertsInLastHour || 0}/${stats.maxAlertsPerHour || 12} alerts/hour
🟢 *Status:* ${stats.canSendAlert ? 'Active' : 'Rate Limited'}
📅 *Last Check:* ${stats.lastRunTime || 'Never'}

#SystemStatus #WestAfricanNews`;

      const result = await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown'
      });

      logger.info('📱 Telegram status update sent');
      return { success: true, messageId: result.message_id };

    } catch (error) {
      logger.error('❌ Failed to send Telegram status:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test message
   */
  async sendTestMessage() {
    if (!this.isEnabled || !this.bot) {
      return { success: false, error: 'Bot not enabled' };
    }

    const testMessage = `🧪 *Test Alert - West African Breaking News System*

This is a test message to verify Telegram notifications are working correctly.

⏰ *Test Time:* ${new Date().toLocaleString()}
🟢 *Status:* All systems operational
📱 *Platform:* Telegram

If you receive this message, your bot is configured correctly!

#TestAlert #SystemCheck`;

    try {
      const result = await this.bot.sendMessage(this.chatId, testMessage, {
        parse_mode: 'Markdown'
      });

      logger.info('📱 Telegram test message sent successfully');
      return { success: true, messageId: result.message_id };

    } catch (error) {
      logger.error('❌ Telegram test message failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle bot errors gracefully
   */
  handleError(error) {
    if (error.code === 'EFATAL') {
      logger.error('❌ Fatal Telegram error - disabling bot');
      this.isEnabled = false;
    } else if (error.code === 'ETELEGRAM') {
      logger.warn('⚠️  Telegram API error:', error.message);
    } else {
      logger.error('❌ Unexpected Telegram error:', error.message);
    }
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      enabled: this.isEnabled,
      hasBot: !!this.bot,
      chatId: this.chatId ? `${this.chatId}`.substring(0, 8) + '...' : null,
      botUsername: this.bot?.options?.username || 'Unknown'
    };
  }

  /**
   * Gracefully close the bot
   */
  async close() {
    if (this.bot) {
      try {
        await this.bot.stopPolling();
        logger.info('🛑 Telegram bot closed gracefully');
      } catch (error) {
        logger.warn('⚠️  Error closing Telegram bot:', error.message);
      }
    }
  }
}

module.exports = TelegramNotifier;
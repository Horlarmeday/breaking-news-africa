const cron = require('node-cron');
const express = require('express');
const RSSMonitor = require('./src/rssMonitor');
const TelegramNotifier = require('./src/telegramBot');
const EmailNotifier = require('./src/emailSender');
const SocialMediaScraper = require('./src/scraper');
const { logger, RateLimiter } = require('./src/utils');
const config = require('./config/config');

class NewsAlertSystem {
  constructor() {
    this.rssMonitor = new RSSMonitor();
    this.telegramNotifier = new TelegramNotifier();
    this.emailNotifier = new EmailNotifier();
    this.socialScraper = new SocialMediaScraper();
    this.rateLimiter = new RateLimiter(
      config.rateLimiting.maxAlertsPerHour,
      config.rateLimiting.alertCooldownMinutes
    );
    this.isRunning = false;
    this.stats = {
      totalAlertsSent: 0,
      totalArticlesProcessed: 0,
      totalSocialPostsProcessed: 0,
      systemStartTime: new Date().toISOString(),
      lastRunTime: null,
      lastSocialRunTime: null,
      telegramAlertsSent: 0,
      emailAlertsSent: 0
    };
  }

  /**
   * Initialize the alert system
   */
  async init() {
    logger.info('🚀 Initializing NNB NEWS ALERT System...');
    
    // Validate configuration (warn but don't exit in development)
    if (!config.telegram.enabled && !config.email.enabled) {
      if (config.NODE_ENV === 'production') {
        logger.error('❌ No notification methods configured! Please setup Telegram or Email.');
        process.exit(1);
      } else {
        logger.warn('⚠️  No notification methods configured. Running in test mode with console logging only.');
      }
    }
    
    logger.info('📋 Configuration:');
    logger.info(`   - RSS Check Interval: ${config.intervals.rss} minutes`);
    logger.info(`   - Social Check Interval: ${config.intervals.social} minutes`);
    logger.info(`   - Telegram Enabled: ${config.telegram.enabled}`);
    logger.info(`   - Email Enabled: ${config.email.enabled}`);
    logger.info(`   - Social Scraping Enabled: ${config.scraping.enabled}`);
    logger.info(`   - Rate Limit: ${config.rateLimiting.maxAlertsPerHour} alerts/hour`);
    logger.info(`   - Environment: ${config.NODE_ENV}`);
    
    // Test notification connections if enabled
    if (config.telegram.enabled) {
      logger.info('🤖 Testing Telegram connection...');
      const telegramTest = await this.telegramNotifier.testConnection();
      if (telegramTest.success) {
        logger.info('✅ Telegram bot connected successfully');
      } else {
        logger.error(`❌ Telegram connection failed: ${telegramTest.error}`);
      }
    }
    
    if (config.email.enabled) {
      logger.info('📧 Testing email connection...');
      const emailTest = await this.emailNotifier.testConnection();
      if (emailTest.success) {
        logger.info('✅ Email connection verified successfully');
      } else {
        logger.error(`❌ Email connection failed: ${emailTest.error}`);
      }
    }
    
    // Test initial RSS parsing
    logger.info('🧪 Running initial RSS feed test...');
    try {
      const testArticles = await this.rssMonitor.parseAllFeeds();
      logger.info(`✅ Initial test completed. Found ${testArticles.length} news articles.`);
      
      if (testArticles.length > 0) {
        logger.info('📰 Sample articles found:');
        testArticles.slice(0, 3).forEach((article, index) => {
          logger.info(`   ${index + 1}. ${article.title.substring(0, 80)}... (${article.source})`);
        });
      }
    } catch (error) {
      logger.error('❌ Initial RSS test failed:', error.message);
    }
    
    this.isRunning = true;
    logger.info('✅ NNB NEWS ALERT System initialized successfully!');
  }

  /**
   * Process new articles and send alerts
   */
  async processNewArticles() {
    if (!this.isRunning) {
      logger.debug('System not running, skipping article processing');
      return;
    }

    try {
      logger.info('🔄 Starting scheduled news check...');
      this.stats.lastRunTime = new Date().toISOString();
      
      // Get new articles from RSS feeds
      const newArticles = await this.rssMonitor.parseAllFeeds();
      this.stats.totalArticlesProcessed += newArticles.length;
      
      if (newArticles.length === 0) {
        logger.info('📰 No new Nigerian news found.');
        return;
      }
      
      logger.info(`📰 Found ${newArticles.length} new Nigerian news article(s)!`);
      
      // Process each new article
      for (const article of newArticles) {
        if (!this.rateLimiter.canSendAlert()) {
          logger.warn('⏸️  Rate limit reached, queuing remaining articles...');
          break;
        }
        
        await this.sendAlert(article);
        this.rateLimiter.recordAlert();
        this.stats.totalAlertsSent++;
        
        // Small delay between alerts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      logger.info('✅ Article processing completed.');
      
    } catch (error) {
      logger.error('❌ Error processing articles:', error.message);
    }
  }

  /**
   * Process new social media posts and send alerts
   */
  async processSocialMediaPosts() {
    if (!this.isRunning || !config.scraping.enabled) {
      logger.debug('Social media processing skipped - disabled or system not running');
      return;
    }

    try {
      logger.info('📱 Starting social media monitoring...');
      this.stats.lastSocialRunTime = new Date().toISOString();
      
      // Get new posts from social media
      const newPosts = await this.socialScraper.scrapeAllSocialMedia();
      this.stats.totalSocialPostsProcessed += newPosts.length;
      
      if (newPosts.length === 0) {
        logger.info('📱 No new social media news found.');
        return;
      }
      
      logger.info(`📱 Found ${newPosts.length} new social media news alert(s)!`);
      
      // Process each new post
      for (const post of newPosts) {
        if (!this.rateLimiter.canSendAlert()) {
          logger.warn('⏸️  Rate limit reached, queuing remaining social posts...');
          break;
        }
        
        // Convert social post to article-like format for consistency
        const article = {
          id: post.id,
          title: `${post.platform.toUpperCase()}: ${post.text.substring(0, 100)}...`,
          link: post.url,
          description: post.text,
          pubDate: post.timestamp,
          source: `${post.source} (${post.platform})`,
          feedUrl: post.url,
          processedAt: post.processedAt,
          platform: post.platform,
          account: post.account
        };
        
        await this.sendAlert(article);
        this.rateLimiter.recordAlert();
        this.stats.totalAlertsSent++;
        
        // Small delay between social alerts
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      logger.info('✅ Social media processing completed.');
      
    } catch (error) {
      logger.error('❌ Error processing social media posts:', error.message);
    }
  }

  /**
   * Send alert for a breaking news article
   */
  async sendAlert(article) {
    logger.info(`📢 Sending alert: ${article.title.substring(0, 60)}...`);
    
    const alertPromises = [];
    let telegramSuccess = false;
    let emailSuccess = false;
    
    // Send Telegram notification
    if (config.telegram.enabled) {
      alertPromises.push(
        this.telegramNotifier.sendAlert(article)
          .then(result => {
            if (result.success) {
              telegramSuccess = true;
              this.stats.telegramAlertsSent++;
              logger.info('✅ Telegram alert sent successfully');
            } else {
              logger.error(`❌ Telegram alert failed: ${result.error}`);
            }
            return { type: 'telegram', success: result.success, error: result.error };
          })
          .catch(error => {
            logger.error(`❌ Telegram alert error: ${error.message}`);
            return { type: 'telegram', success: false, error: error.message };
          })
      );
    }
    
    // Send Email notification  
    if (config.email.enabled) {
      alertPromises.push(
        this.emailNotifier.sendAlert(article)
          .then(result => {
            if (result.success) {
              emailSuccess = true;
              this.stats.emailAlertsSent++;
              logger.info('✅ Email alert sent successfully');
            } else {
              logger.error(`❌ Email alert failed: ${result.error}`);
            }
            return { type: 'email', success: result.success, error: result.error };
          })
          .catch(error => {
            logger.error(`❌ Email alert error: ${error.message}`);
            return { type: 'email', success: false, error: error.message };
          })
      );
    }
    
    // Wait for all notifications to complete
    if (alertPromises.length > 0) {
      try {
        const results = await Promise.allSettled(alertPromises);
        const successCount = results.filter(r => r.value?.success).length;
        
        logger.info(`📤 Alert delivery summary: ${successCount}/${alertPromises.length} notifications sent successfully`);
        
        if (successCount > 0) {
          return { success: true, telegram: telegramSuccess, email: emailSuccess };
        } else {
          return { success: false, error: 'All notification methods failed' };
        }
      } catch (error) {
        logger.error('❌ Error sending notifications:', error.message);
        return { success: false, error: error.message };
      }
    } else {
      // No notifications configured - log to console (Phase 1 behavior)
      logger.info('🚨 BREAKING NEWS ALERT (Console Only):');
      logger.info('─'.repeat(50));
      logger.info(this.formatAlertMessage(article));
      logger.info('─'.repeat(50));
      return { success: true, consoleOnly: true };
    }
  }

  /**
   * Format alert message for notifications
   */
  formatAlertMessage(article) {
    const timestamp = new Date().toLocaleString();
    const source = article.source.toUpperCase();
    
    return `📰 NNB NEWS ALERT

📰 ${article.title}

📍 Source: ${source}
🔗 Link: ${article.link}
⏰ Published: ${article.pubDate || 'Unknown'}
🕐 Alert Time: ${timestamp}

📝 ${article.description ? article.description.substring(0, 200) + (article.description.length > 200 ? '...' : '') : 'No description available'}

#News #Nigeria #${source}`;
  }

  /**
   * Start the monitoring system with cron jobs
   */
  start() {
    if (!this.isRunning) {
      logger.error('❌ System not initialized. Call init() first.');
      return;
    }
    
    logger.info('🎯 Starting monitoring schedules...');
    
    // RSS Feed Monitoring
    const rssSchedule = `*/${config.intervals.rss} * * * *`; // Every N minutes
    cron.schedule(rssSchedule, async () => {
      await this.processNewArticles();
    });
    
    // Social Media Monitoring (if enabled)
    if (config.scraping.enabled) {
      const socialSchedule = `*/${config.intervals.social} * * * *`; // Every N minutes
      cron.schedule(socialSchedule, async () => {
        await this.processSocialMediaPosts();
      });
      logger.info(`📱 Social media monitoring scheduled every ${config.intervals.social} minutes`);
    }
    
    // Cleanup old articles daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('🧹 Running daily cleanup...');
      await this.rssMonitor.cleanupOldArticles();
      if (config.scraping.enabled) {
        await this.socialScraper.cleanupOldPosts();
      }
    });
    
    // Status report every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.printStatus();
    });
    
    logger.info(`⏰ RSS monitoring scheduled every ${config.intervals.rss} minutes`);
    logger.info('🟢 News Alert System is now running!');
    logger.info('Press Ctrl+C to stop...');
    
    // Run initial checks
    setTimeout(() => {
      this.processNewArticles();
    }, 5000); // Wait 5 seconds then run RSS check
    
    if (config.scraping.enabled) {
      setTimeout(() => {
        this.processSocialMediaPosts();
      }, 15000); // Wait 15 seconds then run social media check
    }
  }

  /**
   * Stop the monitoring system
   */
  stop() {
    this.isRunning = false;
    logger.info('🛑 News Alert System stopped.');
  }

  /**
   * Print system status
   */
  printStatus() {
    const uptime = Date.now() - new Date(this.stats.systemStartTime).getTime();
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    const rssStats = this.rssMonitor.getStats();
    const rateLimiterStats = this.rateLimiter.getStats();
    const telegramStats = this.telegramNotifier.getStats();
    const emailStats = this.emailNotifier.getStats();
    const socialStats = this.socialScraper.getStats();
    
    logger.info('📊 SYSTEM STATUS REPORT');
    logger.info('─'.repeat(50));
    logger.info(`⏰ Uptime: ${uptimeHours}h ${uptimeMinutes}m`);
    logger.info(`📤 Total Alerts Sent: ${this.stats.totalAlertsSent}`);
    logger.info(`📱 Telegram Alerts: ${this.stats.telegramAlertsSent}`);
    logger.info(`📧 Email Alerts: ${this.stats.emailAlertsSent}`);
    logger.info(`📄 RSS Articles Processed: ${this.stats.totalArticlesProcessed}`);
    logger.info(`🐦 Social Posts Processed: ${this.stats.totalSocialPostsProcessed}`);
    logger.info(`💾 Total RSS Articles in DB: ${rssStats.totalProcessed}`);
    logger.info(`📱 Total Social Posts in DB: ${socialStats.totalProcessedPosts}`);
    logger.info(`🚦 Rate Limiter: ${rateLimiterStats.alertsInLastHour}/${rateLimiterStats.maxAlertsPerHour} alerts/hour`);
    logger.info(`🟢 Can Send Alert: ${rateLimiterStats.canSendAlert ? 'Yes' : 'No'}`);
    logger.info(`🤖 Telegram Status: ${telegramStats.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    logger.info(`📧 Email Status: ${emailStats.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    logger.info(`🐦 Social Scraping: ${socialStats.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    logger.info(`📅 Last RSS Run: ${this.stats.lastRunTime || 'Never'}`);
    logger.info(`📱 Last Social Run: ${this.stats.lastSocialRunTime || 'Never'}`);
    logger.info('─'.repeat(50));
  }

  /**
   * Gracefully shutdown the system
   */
  async shutdown() {
    logger.info('🛑 Shutting down NNB NEWS ALERT...');
    this.stop();
    
    try {
      await this.telegramNotifier.close();
      await this.emailNotifier.close();
  
      logger.info('✅ All services shutdown gracefully');
    } catch (error) {
      logger.error('❌ Error during shutdown:', error.message);
    }
  }
}

// Handle graceful shutdown
let alertSystem = null;

process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');
  if (alertSystem) {
    await alertSystem.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');
  if (alertSystem) {
    await alertSystem.shutdown();
  }
  process.exit(0);
});

// Initialize and start the system
async function main() {
  alertSystem = new NewsAlertSystem();
  
  try {
    // Create Express server for Render deployment first
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({
        status: 'running',
        service: 'NNB NEWS ALERT',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        stats: alertSystem ? alertSystem.stats : {}
      });
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
    
    // Status endpoint
    app.get('/status', (req, res) => {
      res.json({
        system: {
          isRunning: alertSystem ? alertSystem.isRunning : false,
          stats: alertSystem ? alertSystem.stats : {},
          config: {
            telegramEnabled: config.telegram.enabled,
            emailEnabled: config.email.enabled,
            scrapingEnabled: config.scraping.enabled,
            rssInterval: config.intervals.rss,
            socialInterval: config.intervals.social
          }
        }
      });
    });
    
    // Start the HTTP server immediately
    app.listen(PORT, () => {
      logger.info(`🌐 HTTP server running on port ${PORT}`);
      logger.info(`📊 Status available at: http://localhost:${PORT}/status`);
    });
    
    // Initialize and start the alert system
    await alertSystem.init();
    alertSystem.start();

  } catch (error) {
    logger.error('❌ Failed to start the alert system:', error.message);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}

module.exports = NewsAlertSystem;
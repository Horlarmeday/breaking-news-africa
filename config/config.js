require('dotenv').config();

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Telegram Configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
  },
  
  // Email Configuration
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    to: process.env.EMAIL_TO,
    enabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_TO),
    host: process.env.EMAIL_SMTP_HOST,
    port: 587,
    secure: false
  },
  
  // Monitoring Intervals (in minutes)
  intervals: {
    rss: parseInt(process.env.RSS_CHECK_INTERVAL) || 30,
    social: parseInt(process.env.SOCIAL_CHECK_INTERVAL) || 20
  },
  
  // Rate Limiting
  rateLimiting: {
    maxAlertsPerHour: parseInt(process.env.MAX_ALERTS_PER_HOUR) || 12,
    alertCooldownMinutes: parseInt(process.env.ALERT_COOLDOWN_MINUTES) || 5
  },
  
  // File Paths
  paths: {
    processedArticles: './data/processed.json',
    dataDir: './data'
  },
  
  // Logging Configuration
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableConsole: true,
    enableFile: false
  },
  
  // RSS Parser Configuration
  rss: {
    timeout: 10000, // 10 seconds
    headers: {
      'User-Agent': 'Nigerian Breaking News Alert System 1.0'
    }
  },
  
  // Social Media Scraping Configuration
  scraping: {
    enabled: process.env.ENABLE_SCRAPING === 'true',
    timeout: 15000, // 15 seconds
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
};

// Validation
if (!config.telegram.enabled && !config.email.enabled) {
  console.warn('⚠️  Warning: Neither Telegram nor Email notifications are configured!');
}

module.exports = config;
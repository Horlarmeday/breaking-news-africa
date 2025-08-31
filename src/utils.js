const config = require('../config/config');

/**
 * Simple logger with timestamp and level
 */
class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    const argsString = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] ${levelUpper} ${message}${argsString}`;
  }

  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, ...args));
    }
  }

  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, ...args));
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, ...args));
    }
  }
}

const logger = new Logger(config.logging.level);

/**
 * Rate limiter for alerts
 */
class RateLimiter {
  constructor(maxPerHour = 12, cooldownMinutes = 5) {
    this.maxPerHour = maxPerHour;
    this.cooldownMinutes = cooldownMinutes;
    this.alertHistory = [];
    this.lastAlertTime = null;
  }

  /**
   * Check if we can send an alert now
   */
  canSendAlert() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const cooldownTime = this.cooldownMinutes * 60 * 1000;

    // Clean up old alerts (older than 1 hour)
    this.alertHistory = this.alertHistory.filter(time => time > oneHourAgo);

    // Check hourly limit
    if (this.alertHistory.length >= this.maxPerHour) {
      logger.warn(`🚫 Rate limit exceeded: ${this.alertHistory.length}/${this.maxPerHour} alerts sent in the last hour`);
      return false;
    }

    // Check cooldown period
    if (this.lastAlertTime && (now - this.lastAlertTime) < cooldownTime) {
      const remainingCooldown = Math.ceil((cooldownTime - (now - this.lastAlertTime)) / 1000 / 60);
      logger.debug(`⏳ Cooldown active: ${remainingCooldown} minutes remaining`);
      return false;
    }

    return true;
  }

  /**
   * Record that we sent an alert
   */
  recordAlert() {
    const now = Date.now();
    this.alertHistory.push(now);
    this.lastAlertTime = now;
    logger.debug(`📝 Alert recorded. Total in last hour: ${this.alertHistory.length}/${this.maxPerHour}`);
  }

  /**
   * Get rate limiter statistics
   */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentAlerts = this.alertHistory.filter(time => time > oneHourAgo);
    
    return {
      alertsInLastHour: recentAlerts.length,
      maxAlertsPerHour: this.maxPerHour,
      canSendAlert: this.canSendAlert(),
      lastAlertTime: this.lastAlertTime ? new Date(this.lastAlertTime).toISOString() : null
    };
  }
}

/**
 * Utility functions for text processing
 */
const textUtils = {
  /**
   * Clean and truncate text for notifications
   */
  cleanText(text, maxLength = 280) {
    if (!text) return '';
    
    // Remove HTML tags, extra whitespace, and control characters
    const cleaned = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs
      .trim();
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    
    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  },

  /**
   * Extract domain from URL
   */
  getDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  },

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 1000 / 60);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
};

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry utility for failed operations
 */
const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

module.exports = {
  logger,
  Logger,
  RateLimiter,
  textUtils,
  sleep,
  retry
};
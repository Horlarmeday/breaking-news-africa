const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');
const { RSS_FEEDS } = require('../config/feeds');
const { BREAKING_NEWS_KEYWORDS, ALL_NIGERIAN_KEYWORDS } = require('../config/keywords');
const config = require('../config/config');
const { logger } = require('./utils');

class RSSMonitor {
  constructor() {
    this.parser = new Parser({
      timeout: config.rss.timeout,
      headers: config.rss.headers
    });
    this.processedArticles = new Set();
    this.lastProcessedFile = config.paths.processedArticles;
    
    // Load previously processed articles
    this.loadProcessedArticles();
  }

  async loadProcessedArticles() {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.lastProcessedFile), { recursive: true });
      
      const data = await fs.readFile(this.lastProcessedFile, 'utf8');
      const processed = JSON.parse(data);
      this.processedArticles = new Set(processed.articles || []);
      logger.info(`Loaded ${this.processedArticles.size} previously processed articles`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error('Error loading processed articles:', error.message);
      }
      // File doesn't exist, start fresh
      this.processedArticles = new Set();
      logger.info('Starting with fresh processed articles list');
    }
  }

  async saveProcessedArticles() {
    try {
      const data = {
        articles: Array.from(this.processedArticles),
        lastUpdated: new Date().toISOString(),
        totalCount: this.processedArticles.size
      };
      
      await fs.writeFile(this.lastProcessedFile, JSON.stringify(data, null, 2));
      logger.debug(`Saved ${this.processedArticles.size} processed articles to file`);
    } catch (error) {
      logger.error('Error saving processed articles:', error.message);
    }
  }

  /**
   * Generate a unique ID for an article based on its content
   */
  generateArticleId(article) {
    const title = article.title || '';
    const link = article.link || '';
    const pubDate = article.pubDate || '';
    
    // Create a simple hash-like ID
    const content = `${title}-${link}-${pubDate}`;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }

  /**
   * Check if text contains breaking news keywords
   */
  containsBreakingNews(text) {
    if (!text) return false;
    
    const upperText = text.toUpperCase();
    return BREAKING_NEWS_KEYWORDS.some(keyword => 
      upperText.includes(keyword.toUpperCase())
    );
  }

  /**
   * Check if text contains Nigerian context keywords
   */
  containsNigerianContext(text) {
    if (!text) return false;
    
    const upperText = text.toUpperCase();
    return ALL_NIGERIAN_KEYWORDS.some(keyword => 
      upperText.toUpperCase().includes(keyword.toUpperCase())
    );
  }

  /**
   * Filter articles for Nigerian breaking news
   */
  filterArticle(article) {
    const title = article.title || '';
    const description = article.contentSnippet || article.content || '';
    const fullText = `${title} ${description}`;

    const hasBreakingNews = this.containsBreakingNews(fullText);
    const hasNigerianContext = this.containsNigerianContext(fullText);

    if (hasBreakingNews && hasNigerianContext) {
      logger.debug(`✅ Article matches criteria: ${title.substring(0, 60)}...`);
      return true;
    }

    if (hasBreakingNews) {
      logger.debug(`⚠️  Breaking news but not Nigerian: ${title.substring(0, 60)}...`);
    }
    
    if (hasNigerianContext) {
      logger.debug(`ℹ️  Nigerian content but not breaking: ${title.substring(0, 60)}...`);
    }

    return false;
  }

  /**
   * Parse a single RSS feed
   */
  async parseFeed(url, sourceName) {
    try {
      logger.debug(`Fetching RSS feed: ${url}`);
      const feed = await this.parser.parseURL(url);
      
      const newArticles = [];
      
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items) {
          const articleId = this.generateArticleId(item);
          
          // Skip if already processed
          if (this.processedArticles.has(articleId)) {
            continue;
          }
          
          // Filter for Nigerian breaking news
          if (this.filterArticle(item)) {
            const processedArticle = {
              id: articleId,
              title: item.title,
              link: item.link,
              description: item.contentSnippet || item.content || '',
              pubDate: item.pubDate,
              source: sourceName,
              feedUrl: url,
              processedAt: new Date().toISOString()
            };
            
            newArticles.push(processedArticle);
            this.processedArticles.add(articleId);
          } else {
            // Still mark as processed to avoid checking again
            this.processedArticles.add(articleId);
          }
        }
        
        logger.info(`📰 ${sourceName}: Found ${newArticles.length} new Nigerian breaking news articles from ${feed.items.length} total items`);
      } else {
        logger.warn(`⚠️  ${sourceName}: No items found in RSS feed`);
      }
      
      return newArticles;
      
    } catch (error) {
      logger.error(`❌ Error parsing RSS feed ${url} (${sourceName}):`, error.message);
      return [];
    }
  }

  /**
   * Parse all RSS feeds
   */
  async parseAllFeeds() {
    logger.info('🔍 Starting RSS feed monitoring...');
    const startTime = Date.now();
    
    let allNewArticles = [];
    
    for (const [sourceKey, sourceConfig] of Object.entries(RSS_FEEDS)) {
      const sourceName = sourceConfig.name;
      
      for (const url of sourceConfig.urls) {
        const articles = await this.parseFeed(url, sourceName);
        allNewArticles = allNewArticles.concat(articles);
        
        // Small delay between feeds to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Save processed articles
    await this.saveProcessedArticles();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ RSS monitoring completed in ${duration}ms. Found ${allNewArticles.length} new alerts.`);
    
    return allNewArticles;
  }

  /**
   * Clean up old processed articles to prevent memory bloat
   */
  async cleanupOldArticles() {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const cutoffDate = Date.now() - maxAge;
    
    try {
      const data = await fs.readFile(this.lastProcessedFile, 'utf8');
      const processed = JSON.parse(data);
      
      // This is a simplified cleanup - in a real implementation,
      // we'd need to store timestamps for each article
      if (processed.articles && processed.articles.length > 10000) {
        // Keep only the most recent 5000 articles
        const recentArticles = processed.articles.slice(-5000);
        this.processedArticles = new Set(recentArticles);
        
        await this.saveProcessedArticles();
        logger.info(`🧹 Cleaned up old articles, keeping ${recentArticles.length} recent ones`);
      }
    } catch (error) {
      logger.error('Error during cleanup:', error.message);
    }
  }

  /**
   * Get statistics about processed articles
   */
  getStats() {
    return {
      totalProcessed: this.processedArticles.size,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = RSSMonitor;
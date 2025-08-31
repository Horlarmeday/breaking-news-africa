const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');
const { RSS_FEEDS } = require('../config/feeds');
const { BREAKING_NEWS_KEYWORDS, ALL_WEST_AFRICAN_KEYWORDS, ALL_NIGERIAN_KEYWORDS } = require('../config/keywords');
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
      // Implement size-based cleanup to prevent JSON bloating
      const maxArticles = 10000;
      let articlesArray = Array.from(this.processedArticles);
      
      if (articlesArray.length > maxArticles) {
        // Keep only the most recent articles (assuming newer articles are added later)
        articlesArray = articlesArray.slice(-maxArticles);
        this.processedArticles = new Set(articlesArray);
        logger.info(`🧹 Trimmed processed articles to ${maxArticles} to prevent file bloating`);
      }
      
      const data = {
        articles: articlesArray,
        lastUpdated: new Date().toISOString(),
        totalCount: this.processedArticles.size
      };
      
      await fs.writeFile(this.lastProcessedFile, JSON.stringify(data, null, 2));
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
  /**
   * Check if text contains West African context keywords
   */
  containsWestAfricanContext(text) {
    if (!text) return false;
    
    const upperText = text.toUpperCase();
    return ALL_WEST_AFRICAN_KEYWORDS.some(keyword => 
      upperText.includes(keyword.toUpperCase())
    );
  }

  /**
   * Legacy method for backward compatibility
   */
  containsNigerianContext(text) {
    return this.containsWestAfricanContext(text);
  }

  /**
   * Filter articles for West African context
   */
  filterArticle(article) {
    const title = article.title || '';
    const description = article.contentSnippet || article.content || '';
    const fullText = `${title} ${description}`;

    const hasWestAfricanContext = this.containsWestAfricanContext(fullText);

    return hasWestAfricanContext;
  }

  /**
   * Parse a single RSS feed
   */
  async parseFeed(url, sourceName) {
    try {
  
      const feed = await this.parser.parseURL(url);
      
      const newArticles = [];
      
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items) {
          const articleId = this.generateArticleId(item);
          
          // Skip if already processed
          if (this.processedArticles.has(articleId)) {
            continue;
          }
          
          // Filter for West African context
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
        
        logger.info(`📰 ${sourceName}: Found ${newArticles.length} new West African articles from ${feed.items.length} total items`);
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
    logger.info(`✅ RSS monitoring completed in ${duration}ms. Found ${allNewArticles.length} new West African articles.`);
    
    return allNewArticles;
  }

  /**
   * Clean up old processed articles to prevent file bloating
   */
  async cleanupOldArticles() {
    try {
      const data = await fs.readFile(this.lastProcessedFile, 'utf8');
      const processed = JSON.parse(data);
      
      // More aggressive cleanup to prevent file bloating
      if (processed.articles && processed.articles.length > 15000) {
        // Keep only the most recent 7500 articles
        const recentArticles = processed.articles.slice(-7500);
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
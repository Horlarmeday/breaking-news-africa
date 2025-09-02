const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { logger, textUtils, retry, sleep } = require('./utils');
const { BREAKING_NEWS_KEYWORDS, ALL_WEST_AFRICAN_KEYWORDS, ALL_NIGERIAN_KEYWORDS } = require('../config/keywords');
const { SOCIAL_ACCOUNTS, RSS_FEEDS } = require('../config/feeds');
const config = require('../config/config');

class SocialMediaScraper {
  constructor() {
    this.isEnabled = config.scraping.enabled;
    this.processedPosts = new Set();
    this.processedPostsFile = path.join(config.paths.dataDir, 'processed_social.json');
    this.userAgent = config.scraping.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // Rate limiting for scraping
    this.lastScrapeTime = {};
    this.minScrapeInterval = 5 * 60 * 1000; // 5 minutes between scrapes per account
    
    // HTTP client configuration
    this.httpClient = axios.create({
      timeout: config.scraping.timeout || 30000,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (this.isEnabled) {
      logger.info('🐦 Social media scraping enabled (using axios + cheerio)');
      this.loadProcessedPosts();
    }
  }

  /**
   * Load previously processed social media posts
   */
  async loadProcessedPosts() {
    try {
      await fs.mkdir(path.dirname(this.processedPostsFile), { recursive: true });
      
      const data = await fs.readFile(this.processedPostsFile, 'utf8');
      const processed = JSON.parse(data);
      this.processedPosts = new Set(processed.posts || []);
      logger.info(`📱 Loaded ${this.processedPosts.size} previously processed social posts`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error('Error loading processed social posts:', error.message);
      }
      this.processedPosts = new Set();
      logger.info('📱 Starting with fresh social posts list');
    }
  }

  /**
   * Save processed social media posts with size management
   */
  async saveProcessedPosts() {
    try {
      // Implement size-based cleanup to prevent JSON bloating
      const maxPosts = 5000;
      let postsArray = Array.from(this.processedPosts);
      
      if (postsArray.length > maxPosts) {
        // Keep only the most recent posts (assuming newer posts are added later)
        postsArray = postsArray.slice(-maxPosts);
        this.processedPosts = new Set(postsArray);
        logger.info(`🧹 Trimmed processed posts to ${maxPosts} to prevent file bloating`);
      }
      
      const data = {
        posts: postsArray,
        lastUpdated: new Date().toISOString(),
        totalCount: this.processedPosts.size
      };
      
      await fs.writeFile(this.processedPostsFile, JSON.stringify(data, null, 2));

    } catch (error) {
      logger.error('Error saving processed social posts:', error.message);
    }
  }

  /**
   * Generate unique ID for a social media post
   */
  generatePostId(platform, account, text, timestamp) {
    const content = `${platform}-${account}-${text.substring(0, 100)}-${timestamp}`;
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
   * Filter post for West African context
   */
  filterPost(post) {
    const text = `${post.text || ''} ${post.description || ''}`;
    
    const hasWestAfricanContext = this.containsWestAfricanContext(text);

    return hasWestAfricanContext;
  }

  /**
   * Parse RSS feed and extract articles
   */
  async parseRSSFeed(url, sourceName) {
    try {
      const response = await this.httpClient.get(url);
      const $ = cheerio.load(response.data, { xmlMode: true });
      
      const articles = [];
      
      // Parse RSS items
      $('item').each((index, element) => {
        if (index >= 20) return false; // Limit to 20 articles per feed
        
        const $item = $(element);
        const title = $item.find('title').text().trim();
        const description = $item.find('description').text().trim();
        const link = $item.find('link').text().trim();
        const pubDate = $item.find('pubDate').text().trim();
        
        if (title && title.length > 10) {
          articles.push({
            title: title,
            content: description || '',
            link: link,
            timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: sourceName
          });
        }
      });
      
      return articles;
      
    } catch (error) {
      logger.error(`❌ Error parsing RSS feed ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Scrape RSS feeds from news websites (alternative to social media)
   * This is more reliable than scraping social media pages directly
   */
  async scrapeNewsWebsite(url, sourceName) {
    try {

      
      const response = await this.httpClient.get(url);
      const $ = cheerio.load(response.data);
      
      const articles = [];
      
      // Generic selectors for common news article patterns
      const articleSelectors = [
        'article',
        '.article',
        '.news-item',
        '.post',
        '.story',
        '[class*="article"]',
        '[class*="news"]',
        '[class*="story"]'
      ];
      
      for (const selector of articleSelectors) {
        $(selector).each((index, element) => {
          if (index >= 10) return false; // Limit to 10 articles per selector
          
          const $article = $(element);
          const title = $article.find('h1, h2, h3, .title, [class*="title"], [class*="headline"]').first().text().trim();
          const content = $article.find('p, .content, .summary, [class*="content"], [class*="summary"]').text().trim();
          const link = $article.find('a').first().attr('href');
          
          if (title && title.length > 10) {
            // Make relative URLs absolute
            const fullLink = link && link.startsWith('http') ? link : (link ? `${new URL(url).origin}${link}` : url);
            
            articles.push({
              title: title,
              content: (content || '').substring(0, 500), // Limit content length with fallback
              link: fullLink,
              timestamp: new Date().toISOString(),
              source: sourceName
            });
          }
        });
        
        if (articles.length > 0) break; // Stop if we found articles with this selector
      }
      
      return articles;
      
    } catch (error) {
      logger.error(`❌ Error scraping ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Scrape alternative news sources (RSS-like content)
   */
  async scrapeAlternativeSources() {
    // Convert RSS feeds to sources for scraping
    const sources = [];
    
    // Extract all RSS feed URLs from the nested structure
    Object.entries(RSS_FEEDS).forEach(([key, feedConfig]) => {
      feedConfig.urls.forEach(url => {
        sources.push({
          url: url,
          name: feedConfig.name,
          isRSS: true
        });
      });
    });
    
    // Add fallback web scraping sources if needed
    const fallbackSources = [
      { url: 'https://www.bbc.com/news/world/africa', name: 'BBC Africa Fallback', isRSS: false },
    ];
    
    const allArticles = [];
    
    for (const source of sources) {
      try {
        // Use RSS parsing for RSS feeds, web scraping for others
        const articles = source.isRSS 
          ? await this.parseRSSFeed(source.url, source.name)
          : await this.scrapeNewsWebsite(source.url, source.name);
        
        for (const article of articles) {
          const postId = this.generatePostId('web', source.name, article.title, article.timestamp);
          
          // Skip if already processed
          if (this.processedPosts.has(postId)) {
            continue;
          }
          
          const post = {
            id: postId,
            platform: 'web',
            account: source.name,
            text: `${article.title} ${article.content}`,
            url: article.link,
            timestamp: article.timestamp,
            source: source.name,
            processedAt: new Date().toISOString()
          };
          
          // Filter for West African context
          if (this.filterPost(post)) {
            allArticles.push(post);
            logger.info(`🌐 Found West African article: ${article.title.substring(0, 80)}...`);
          }
          
          // Mark as processed regardless
          this.processedPosts.add(postId);
        }
        
        // Delay between sources to be respectful
        await sleep(2000);
        
      } catch (error) {
        logger.error(`❌ Error scraping ${source.name}:`, error.message);
      }
    }
    
    return allArticles;
  }

  /**
   * Scrape all configured sources (alternative approach without social media)
   */
  async scrapeAllSocialMedia() {
    if (!this.isEnabled) {
      return [];
    }
    
    logger.info('🔍 Starting web scraping (alternative to social media)...');
    const startTime = Date.now();
    
    let allNewPosts = [];
    
    try {
      // Instead of scraping social media directly (which is unreliable),
      // we'll scrape news websites that are more accessible
      const articles = await this.scrapeAlternativeSources();
      allNewPosts = allNewPosts.concat(articles);
      
    } catch (error) {
      logger.error('❌ Error during web scraping:', error.message);
    }
    
    // Save processed posts
    await this.saveProcessedPosts();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Web scraping completed in ${Math.round(duration/1000)}s. Found ${allNewPosts.length} new West African articles.`);
    
    return allNewPosts;
  }

  /**
   * Clean up old processed posts to prevent file bloating
   */
  async cleanupOldPosts() {
    try {
      const data = await fs.readFile(this.processedPostsFile, 'utf8');
      const processed = JSON.parse(data);
      
      if (processed.posts && processed.posts.length > 5000) {
        const recentPosts = processed.posts.slice(-2500);
        this.processedPosts = new Set(recentPosts);
        
        await this.saveProcessedPosts();
        logger.info(`🧹 Cleaned up old social posts, keeping ${recentPosts.length} recent ones`);
      }
    } catch (error) {
      logger.error('Error during social posts cleanup:', error.message);
    }
  }

  /**
   * Get scraper statistics
   */
  getStats() {
    return {
      enabled: this.isEnabled,
      totalProcessedPosts: this.processedPosts.size,
      scrapingMethod: 'axios + cheerio',
      lastScrapeTime: this.lastScrapeTime
    };
  }

  /**
   * Test scraping functionality
   */
  async testScraping() {
    logger.info('🧪 Testing web scraping...');
    
    try {
      const articles = await this.scrapeNewsWebsite('https://www.bbc.com/news/world/africa', 'BBC Africa Test');
      logger.info(`✅ Scraping test completed. Found ${articles.length} articles.`);
      return { success: true, articlesFound: articles.length };
    } catch (error) {
      logger.error('❌ Scraping test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SocialMediaScraper;
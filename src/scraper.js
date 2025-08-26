const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { logger, textUtils, retry, sleep } = require('./utils');
const { BREAKING_NEWS_KEYWORDS, ALL_NIGERIAN_KEYWORDS } = require('../config/keywords');
const { SOCIAL_ACCOUNTS } = require('../config/feeds');
const config = require('../config/config');

class SocialMediaScraper {
  constructor() {
    this.browser = null;
    this.isEnabled = config.scraping.enabled;
    this.processedPosts = new Set();
    this.processedPostsFile = path.join(config.paths.dataDir, 'processed_social.json');
    this.userAgent = config.scraping.userAgent;
    
    // Rate limiting for scraping
    this.lastScrapeTime = {};
    this.minScrapeInterval = 5 * 60 * 1000; // 5 minutes between scrapes per account
    
    if (this.isEnabled) {
      logger.info('🐦 Social media scraping enabled');
      this.loadProcessedPosts();
    } else {
      logger.debug('Social media scraping disabled in configuration');
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
   * Save processed social media posts
   */
  async saveProcessedPosts() {
    try {
      const data = {
        posts: Array.from(this.processedPosts),
        lastUpdated: new Date().toISOString(),
        totalCount: this.processedPosts.size
      };
      
      await fs.writeFile(this.processedPostsFile, JSON.stringify(data, null, 2));
      logger.debug(`💾 Saved ${this.processedPosts.size} processed social posts`);
    } catch (error) {
      logger.error('Error saving processed social posts:', error.message);
    }
  }

  /**
   * Initialize browser instance
   */
  async initBrowser() {
    if (this.browser) return true;
    
    try {
      logger.info('🚀 Launching browser for social media scraping...');
      
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-extensions'
        ],
        timeout: 30000
      });
      
      logger.info('✅ Browser launched successfully');
      return true;
    } catch (error) {
      logger.error('❌ Failed to launch browser:', error.message);
      this.browser = null;
      return false;
    }
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        logger.info('🛑 Browser closed');
      } catch (error) {
        logger.warn('⚠️  Error closing browser:', error.message);
      }
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
   * Filter post for Nigerian breaking news
   */
  filterPost(post) {
    const text = `${post.text || ''} ${post.description || ''}`;
    
    const hasBreakingNews = this.containsBreakingNews(text);
    const hasNigerianContext = this.containsNigerianContext(text);

    if (hasBreakingNews && hasNigerianContext) {
      logger.debug(`✅ Social post matches criteria: ${text.substring(0, 60)}...`);
      return true;
    }

    if (hasBreakingNews) {
      logger.debug(`⚠️  Breaking news but not Nigerian: ${text.substring(0, 60)}...`);
    }
    
    if (hasNigerianContext) {
      logger.debug(`ℹ️  Nigerian content but not breaking: ${text.substring(0, 60)}...`);
    }

    return false;
  }

  /**
   * Scrape Twitter/X account for breaking news
   */
  async scrapeTwitterAccount(account) {
    const accountName = account.replace('@', '');
    const url = `https://twitter.com/${accountName}`;
    
    // Check rate limiting
    const now = Date.now();
    if (this.lastScrapeTime[accountName] && 
        (now - this.lastScrapeTime[accountName]) < this.minScrapeInterval) {
      logger.debug(`⏳ Rate limiting: Skipping ${account} (scraped recently)`);
      return [];
    }

    let page = null;
    
    try {
      if (!await this.initBrowser()) {
        return [];
      }

      page = await this.browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      logger.debug(`🐦 Scraping Twitter account: ${account}`);
      
      // Navigate to Twitter profile
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: config.scraping.timeout 
      });
      
      // Wait for tweets to load
      await sleep(3000);
      
      // Try to find tweets - Twitter's DOM structure changes frequently
      const tweets = await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        const posts = [];
        
        tweetElements.forEach((tweet, index) => {
          if (index >= 10) return; // Limit to recent 10 tweets
          
          try {
            const textElement = tweet.querySelector('[data-testid="tweetText"]');
            const timeElement = tweet.querySelector('time');
            
            if (textElement && timeElement) {
              const text = textElement.innerText || textElement.textContent || '';
              const timestamp = timeElement.getAttribute('datetime') || new Date().toISOString();
              
              if (text.trim()) {
                posts.push({
                  text: text.trim(),
                  timestamp: timestamp,
                  url: window.location.href
                });
              }
            }
          } catch (error) {
            console.log('Error extracting tweet:', error.message);
          }
        });
        
        return posts;
      });

      this.lastScrapeTime[accountName] = now;
      
      const newPosts = [];
      
      for (const tweet of tweets) {
        const postId = this.generatePostId('twitter', accountName, tweet.text, tweet.timestamp);
        
        // Skip if already processed
        if (this.processedPosts.has(postId)) {
          continue;
        }
        
        // Create standardized post object
        const post = {
          id: postId,
          platform: 'twitter',
          account: accountName,
          text: tweet.text,
          url: tweet.url,
          timestamp: tweet.timestamp,
          source: accountName.replace(/breaking|brk/i, '').toUpperCase(),
          processedAt: new Date().toISOString()
        };
        
        // Filter for Nigerian breaking news
        if (this.filterPost(post)) {
          newPosts.push(post);
          logger.info(`🐦 Found Twitter breaking news: ${post.text.substring(0, 80)}...`);
        }
        
        // Mark as processed regardless
        this.processedPosts.add(postId);
      }
      
      logger.info(`🐦 ${account}: Found ${newPosts.length} new breaking news posts from ${tweets.length} total tweets`);
      
      return newPosts;
      
    } catch (error) {
      logger.error(`❌ Error scraping Twitter account ${account}:`, error.message);
      return [];
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          logger.warn('⚠️  Error closing page:', error.message);
        }
      }
    }
  }

  /**
   * Scrape Facebook page for breaking news
   */
  async scrapeFacebookPage(pageName) {
    const url = `https://www.facebook.com/${pageName}`;
    
    // Check rate limiting
    const now = Date.now();
    if (this.lastScrapeTime[pageName] && 
        (now - this.lastScrapeTime[pageName]) < this.minScrapeInterval) {
      logger.debug(`⏳ Rate limiting: Skipping Facebook ${pageName} (scraped recently)`);
      return [];
    }

    let page = null;
    
    try {
      if (!await this.initBrowser()) {
        return [];
      }

      page = await this.browser.newPage();
      
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      logger.debug(`📘 Scraping Facebook page: ${pageName}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: config.scraping.timeout 
      });
      
      await sleep(5000); // Facebook takes longer to load
      
      // Facebook's structure is complex and changes frequently
      // This is a basic implementation that may need updates
      const posts = await page.evaluate(() => {
        const postElements = document.querySelectorAll('[role="article"]');
        const posts = [];
        
        postElements.forEach((post, index) => {
          if (index >= 5) return; // Limit to recent 5 posts
          
          try {
            const textElements = post.querySelectorAll('[data-ad-preview="message"]');
            let text = '';
            
            textElements.forEach(el => {
              text += (el.innerText || el.textContent || '') + ' ';
            });
            
            text = text.trim();
            
            if (text) {
              posts.push({
                text: text,
                timestamp: new Date().toISOString(), // Facebook timestamps are hard to extract
                url: window.location.href
              });
            }
          } catch (error) {
            console.log('Error extracting Facebook post:', error.message);
          }
        });
        
        return posts;
      });

      this.lastScrapeTime[pageName] = now;
      
      const newPosts = [];
      
      for (const fbPost of posts) {
        const postId = this.generatePostId('facebook', pageName, fbPost.text, fbPost.timestamp);
        
        if (this.processedPosts.has(postId)) {
          continue;
        }
        
        const post = {
          id: postId,
          platform: 'facebook',
          account: pageName,
          text: fbPost.text,
          url: fbPost.url,
          timestamp: fbPost.timestamp,
          source: pageName.toUpperCase(),
          processedAt: new Date().toISOString()
        };
        
        if (this.filterPost(post)) {
          newPosts.push(post);
          logger.info(`📘 Found Facebook breaking news: ${post.text.substring(0, 80)}...`);
        }
        
        this.processedPosts.add(postId);
      }
      
      logger.info(`📘 ${pageName}: Found ${newPosts.length} new breaking news posts from ${posts.length} total posts`);
      
      return newPosts;
      
    } catch (error) {
      logger.error(`❌ Error scraping Facebook page ${pageName}:`, error.message);
      return [];
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          logger.warn('⚠️  Error closing page:', error.message);
        }
      }
    }
  }

  /**
   * Scrape all configured social media accounts
   */
  async scrapeAllSocialMedia() {
    if (!this.isEnabled) {
      logger.debug('Social media scraping disabled');
      return [];
    }
    
    logger.info('🔍 Starting social media monitoring...');
    const startTime = Date.now();
    
    let allNewPosts = [];
    
    try {
      // Scrape Twitter accounts
      for (const [source, account] of Object.entries(SOCIAL_ACCOUNTS.twitter)) {
        const posts = await this.scrapeTwitterAccount(account);
        allNewPosts = allNewPosts.concat(posts);
        
        // Delay between accounts to avoid rate limiting
        await sleep(10000); // 10 seconds between accounts
      }
      
      // Facebook pages (basic implementation)
      const facebookPages = [
        'BBCNews',
        'cnn', 
        'aljazeeraenglish',
        'SkyNews'
      ];
      
      for (const page of facebookPages) {
        const posts = await this.scrapeFacebookPage(page);
        allNewPosts = allNewPosts.concat(posts);
        
        await sleep(15000); // 15 seconds between Facebook pages
      }
      
    } catch (error) {
      logger.error('❌ Error during social media scraping:', error.message);
    } finally {
      await this.closeBrowser();
    }
    
    // Save processed posts
    await this.saveProcessedPosts();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Social media monitoring completed in ${Math.round(duration/1000)}s. Found ${allNewPosts.length} new alerts.`);
    
    return allNewPosts;
  }

  /**
   * Clean up old processed posts
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
      browserActive: !!this.browser,
      lastScrapeTime: this.lastScrapeTime
    };
  }

  /**
   * Test scraping functionality
   */
  async testScraping() {
    logger.info('🧪 Testing social media scraping...');
    
    try {
      const posts = await this.scrapeTwitterAccount('@BBCBreaking');
      logger.info(`✅ Scraping test completed. Found ${posts.length} posts.`);
      return { success: true, postsFound: posts.length };
    } catch (error) {
      logger.error('❌ Scraping test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SocialMediaScraper;
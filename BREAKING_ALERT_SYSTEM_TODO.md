# Nigerian Breaking News Alert System - TODO

## Project Overview
Build a Node.js system that monitors RSS feeds and social media for Nigerian breaking news from major outlets (BBC, CNN, Al Jazeera, MSNBC, Sky News) and delivers real-time alerts via Telegram and email.

## Phase 1: Core RSS Monitoring System
**Priority: HIGH** | **Timeline: 1-2 days**

### Setup & Configuration
- [ ] **Initialize Node.js project** (15 mins)
  - Create `package.json`
  - Setup project structure
  - Create `.env` template
  
- [ ] **Install dependencies** (10 mins)
  - `rss-parser` for RSS feed parsing
  - `node-cron` for scheduling
  - `dotenv` for environment variables
  - `fs/promises` for file operations (built-in)
  
- [ ] **Create configuration files** (20 mins)
  - Setup `.env.example` with required variables
  - Create `config.js` for RSS feed URLs
  - Setup `keywords.js` with Nigerian keyword arrays

### Core Development
- [ ] **Implement RSS feed parser** (45 mins)
  - Create `rssMonitor.js`
  - Parse multiple RSS feeds
  - Extract title, description, link, pubDate
  - Handle parsing errors gracefully
  
- [ ] **Build keyword filtering system** (60 mins)
  - Create comprehensive Nigerian keyword list
  - Implement breaking news keyword detection
  - Case-insensitive matching
  - Dual-filter logic (Breaking + Nigerian)
  
- [ ] **Create duplicate prevention** (30 mins)
  - Implement JSON file storage for processed articles
  - Track article IDs/URLs
  - Prevent duplicate alerts
  
- [ ] **Add logging system** (20 mins)
  - Console logging with timestamps
  - Error logging
  - Processing statistics

### Keywords Database
- [ ] **Compile Nigerian keywords** (30 mins)
  - Major cities (Lagos, Abuja, Kano, etc.)
  - All 36 states + FCT
  - Political figures (Tinubu, Buhari, etc.)
  - Organizations (INEC, CBN, NNPC, etc.)
  - Economic terms (Naira, major banks)
  - Security terms (Boko Haram, etc.)
  
- [ ] **Define breaking news keywords** (10 mins)
  - BREAKING, URGENT, ALERT, JUST IN
  - DEVELOPING, LIVE, FLASH, EMERGENCY
  - Case variations handling

## Phase 2: Alert Delivery System
**Priority: HIGH** | **Timeline: 1 day**

### Telegram Integration
- [ ] **Setup Telegram Bot** (20 mins)
  - Create bot via @BotFather
  - Get bot token
  - Get chat ID for notifications
  
- [ ] **Implement Telegram notifications** (45 mins)
  - Install `node-telegram-bot-api`
  - Create `telegramBot.js`
  - Format alert messages
  - Handle API rate limits
  
### Email Integration  
- [ ] **Setup email notifications** (45 mins)
  - Install `nodemailer`
  - Configure Gmail SMTP
  - Create email templates
  - Handle authentication

### Alert Formatting
- [ ] **Design alert message format** (30 mins)
  - Include urgency indicators (🚨)
  - Source attribution
  - Article link and excerpt
  - Timestamp
  
- [ ] **Implement rate limiting** (30 mins)
  - Prevent spam notifications
  - Consolidate similar stories
  - Cooldown periods

## Phase 3: Social Media Scraping
**Priority: MEDIUM** | **Timeline: 1-2 days**

### Twitter Scraping Setup
- [ ] **Install scraping dependencies** (15 mins)
  - `puppeteer` or `playwright`
  - `cheerio` for HTML parsing
  
- [ ] **Implement Twitter scraper** (2 hours)
  - Target breaking news accounts (@BBCBreaking, @cnnbrk, etc.)
  - Extract tweet content
  - Handle anti-bot measures
  - Implement delays and user agents
  
- [ ] **Add scraper scheduling** (30 mins)
  - Separate cron job for social media
  - Error handling and retries
  - Fallback mechanisms

### Data Integration
- [ ] **Merge RSS and social data** (45 mins)
  - Unified processing pipeline
  - Deduplicate across sources
  - Priority scoring system

## Phase 4: Testing & Validation
**Priority: HIGH** | **Timeline: 1 day**

### Unit Testing
- [ ] **Test RSS parsing** (30 mins)
  - Mock RSS responses
  - Test error conditions
  - Validate keyword filtering
  
- [ ] **Test alert delivery** (30 mins)
  - Mock Telegram/email sending
  - Test message formatting
  - Validate rate limiting

### Integration Testing
- [ ] **End-to-end testing** (60 mins)
  - Full pipeline testing
  - Real RSS feeds (limited)
  - Alert delivery verification
  
- [ ] **Error handling validation** (45 mins)
  - Network failures
  - Invalid feeds
  - API rate limits
  - File system errors

### Performance Testing
- [ ] **Load testing** (30 mins)
  - Multiple RSS feeds simultaneously
  - Memory usage monitoring
  - Processing time benchmarks

## Phase 5: Deployment & Production
**Priority: MEDIUM** | **Timeline: 1 day**

### Production Setup
- [ ] **Create production configuration** (30 mins)
  - Environment-specific settings
  - Production RSS feed URLs
  - Logging configuration
  
- [ ] **Setup monitoring** (45 mins)
  - Health check endpoints
  - Error alerting
  - Performance metrics
  
- [ ] **Create startup scripts** (20 mins)
  - PM2 configuration
  - Auto-restart on failure
  - System service setup

### Documentation
- [ ] **Create setup documentation** (45 mins)
  - Installation instructions
  - Configuration guide
  - Troubleshooting guide
  
- [ ] **API documentation** (30 mins)
  - Environment variables
  - Configuration options
  - Keyword customization

### Security
- [ ] **Security review** (30 mins)
  - Environment variable protection
  - Rate limiting implementation
  - Input sanitization
  - API key security

## Technical Requirements

### Dependencies
```json
{
  "rss-parser": "^3.13.0",
  "node-telegram-bot-api": "^0.64.0",
  "nodemailer": "^6.9.0",
  "node-cron": "^3.0.0",
  "dotenv": "^16.3.0",
  "puppeteer": "^21.0.0"
}
```

### Environment Variables
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_TO=recipient@email.com
NODE_ENV=development
```

### RSS Feed URLs
- BBC Breaking: `http://feeds.bbci.co.uk/news/rss.xml`
- CNN Breaking: `http://rss.cnn.com/rss/edition.rss`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`
- Sky News: `http://feeds.skynews.com/feeds/rss/home.xml`

## File Structure
```
breaking-news-alerts/
├── package.json
├── .env.example
├── .gitignore
├── app.js (main entry point)
├── config/
│   ├── keywords.js
│   ├── feeds.js
│   └── config.js
├── src/
│   ├── rssMonitor.js
│   ├── telegramBot.js
│   ├── emailSender.js
│   ├── scraper.js
│   └── utils.js
├── data/
│   └── processed.json
└── tests/
    └── *.test.js
```

## Success Criteria
- [ ] System detects Nigerian breaking news within 30 minutes
- [ ] Zero duplicate alerts for same story
- [ ] 99% uptime with automatic recovery
- [ ] Alerts delivered within 2 minutes of detection
- [ ] Support for at least 5 major news sources
- [ ] Comprehensive keyword coverage for Nigerian context
- [ ] Rate limiting prevents spam (max 1 alert per 5 mins)
- [ ] Full error logging and monitoring

## Estimated Total Timeline: 5-7 days
- Phase 1: 1-2 days
- Phase 2: 1 day  
- Phase 3: 1-2 days
- Phase 4: 1 day
- Phase 5: 1 day

## Notes
- Start with RSS feeds (more reliable than social scraping)
- Social media scraping may break with platform updates
- Consider using News API as fallback for reliability
- Implement graceful degradation if sources fail
- Monitor for false positives and tune keywords accordingly
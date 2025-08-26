# Nigerian Breaking News Alert System

A Node.js application that monitors RSS feeds from major news outlets (BBC, CNN, Al Jazeera, MSNBC, Sky News) for Nigerian breaking news and sends real-time alerts via Telegram and Email.

## Features

- 🚨 **Breaking News Detection**: Filters for breaking news keywords (BREAKING, URGENT, ALERT, etc.)
- 🇳🇬 **Nigerian Context**: Comprehensive keyword matching for Nigerian cities, states, politicians, organizations
- 📰 **Multi-Source Monitoring**: Monitors RSS feeds from 5 major international news outlets
- 🤖 **Telegram Alerts**: Real-time notifications via Telegram bot
- 📧 **Email Alerts**: Detailed email notifications
- 🚫 **Duplicate Prevention**: Prevents duplicate alerts for the same story
- ⏰ **Rate Limiting**: Configurable alert frequency limits
- 📊 **Logging & Statistics**: Comprehensive logging and system statistics

## Implementation Status

### Phase 1: ✅ COMPLETED
- ✅ RSS Feed Monitoring
- ✅ Nigerian Keyword Filtering  
- ✅ Breaking News Detection
- ✅ Duplicate Prevention
- ✅ Logging System
- ✅ Rate Limiting
- ✅ Configuration Management

### Phase 2: ✅ COMPLETED  
- ✅ Telegram Bot Integration
- ✅ Email SMTP Notifications
- ✅ Rich HTML Email Templates
- ✅ Markdown Telegram Formatting
- ✅ Notification Rate Limiting
- ✅ Graceful Error Handling
- ✅ Connection Testing
- ✅ System Status Reports

### Phase 3: ✅ COMPLETED
- ✅ Social Media Scraping (Twitter/X, Facebook)
- ✅ Browser Automation with Puppeteer
- ✅ Anti-Bot Measures (User agents, delays, error handling)
- ✅ Unified Processing Pipeline (RSS + Social)
- ✅ Cross-Platform Deduplication
- ✅ Social Media Rate Limiting
- ✅ Separate Scheduling for Social Monitoring
- ✅ Comprehensive Social Statistics

## Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd breaking-news-alerts
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

3. **Required Environment Variables**
   ```env
   # Telegram (Optional but recommended)
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   
   # Email (Optional but recommended)  
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_TO=recipient@email.com
   
   # Configuration
   NODE_ENV=development
   RSS_CHECK_INTERVAL=30
   SOCIAL_CHECK_INTERVAL=20
   MAX_ALERTS_PER_HOUR=12
   
   # Social Media Scraping (Phase 3)
   ENABLE_SCRAPING=true
   ```

## Usage

### Start the System
```bash
npm start
```

### Test Components
```bash
# Test RSS feed parsing
npm run test-rss

# Test Telegram notifications (requires bot token)
npm run test-telegram

# Test email notifications (requires email credentials)  
npm run test-email

# Test social media scraping (requires browser automation)
npm run test-scraping

# Check configuration status
npm run status
```

### Development Mode
```bash
npm run dev
```

## How It Works

1. **RSS Monitoring**: Every 30 minutes (configurable), the system fetches RSS feeds from major news outlets
2. **Social Media Scraping**: Every 20 minutes (configurable), scrapes Twitter and Facebook for breaking news posts
3. **Content Filtering**: Articles and posts are filtered for:
   - Breaking news keywords (BREAKING, URGENT, etc.)
   - Nigerian context (cities, states, politicians, organizations)
4. **Unified Processing**: RSS and social media content processed through same pipeline
5. **Alert Generation**: Matching content triggers alerts via configured channels
6. **Rate Limiting**: Maximum 12 alerts per hour with 5-minute cooldowns
7. **Cross-Platform Deduplication**: Prevents duplicate alerts across RSS and social sources

## Monitored Sources

### RSS Feeds
- **BBC**: World news and Africa feeds
- **CNN**: International and Africa feeds  
- **Al Jazeera**: All news and Africa feeds
- **MSNBC**: Top stories and world news
- **Sky News**: Home and world feeds

### Social Media
- **Twitter**: @BBCBreaking, @cnnbrk, @AJENews, @SkyNewsBreak, @MSNBC
- **Facebook**: BBCNews, cnn, aljazeeraenglish, SkyNews pages

## Nigerian Keywords Coverage

- **Geography**: 36 states, FCT, major cities
- **Politics**: Current leaders, major politicians, political parties
- **Organizations**: Government agencies, banks, corporations
- **Security**: Conflict-related terms, security organizations
- **Culture**: Ethnic groups, entertainment, sports

## File Structure

```
breaking-news-alerts/
├── app.js                 # Main application
├── config/
│   ├── config.js          # Main configuration
│   ├── feeds.js           # RSS feeds & social accounts
│   └── keywords.js        # Nigerian keywords database
├── src/
│   ├── rssMonitor.js      # RSS feed parsing
│   ├── telegramBot.js     # Telegram notifications
│   ├── emailSender.js     # Email notifications
│   ├── scraper.js         # Social media scraping
│   └── utils.js           # Utilities and logging
├── data/
│   ├── processed.json     # Processed RSS articles
│   └── processed_social.json # Processed social posts
└── .env                   # Environment variables
```

## Logging

The system provides detailed logging:

- **INFO**: General system operations and alerts
- **DEBUG**: Detailed processing information  
- **WARN**: Rate limits and non-critical issues
- **ERROR**: System errors and failures

## Future Enhancements

- 🔍 Advanced NLP content filtering with sentiment analysis
- 📊 Web dashboard for real-time monitoring
- 🎯 Custom alert rules and user preferences  
- 🔄 Real-time webhook support for instant alerts
- 🌍 Multi-language support for international sources
- 📈 Analytics and trending topic detection
- 🤖 AI-powered content summarization

## Troubleshooting

**No articles found**: Check if RSS feeds are accessible and keywords are appropriate

**Rate limited**: Adjust `MAX_ALERTS_PER_HOUR` and `ALERT_COOLDOWN_MINUTES`

**Memory issues**: The system automatically cleans up old processed articles and social posts

**Social scraping issues**: Ensure browser dependencies are installed and check for platform UI changes

**Rate limiting**: Social media platforms may temporarily block scraping; system includes delays and error handling

## Telegram Bot Setup

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Save the bot token as `TELEGRAM_BOT_TOKEN` in `.env`
4. Start your bot and get your chat ID from `@userinfobot`
5. Add `TELEGRAM_CHAT_ID` to `.env`
6. Run `npm run test-telegram` to verify

## Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Add credentials to `.env`:
   ```
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=your_16_digit_app_password
   EMAIL_TO=recipient@email.com
   ```
4. Run `npm run test-email` to verify

## Contributing

All 3 phases are complete! This is a fully functional Nigerian breaking news monitoring system with RSS feeds, social media scraping, and multi-channel notifications.

## License

ISC License
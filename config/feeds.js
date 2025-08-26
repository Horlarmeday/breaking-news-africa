const RSS_FEEDS = {
  bbc: {
    name: 'BBC',
    urls: [
      'http://feeds.bbci.co.uk/news/rss.xml',
      'http://feeds.bbci.co.uk/news/world/rss.xml',
      'http://feeds.bbci.co.uk/news/world/africa/rss.xml'
    ]
  },
  cnn: {
    name: 'CNN',
    urls: [
      'http://rss.cnn.com/rss/edition.rss',
      'http://rss.cnn.com/rss/edition_world.rss',
      'http://rss.cnn.com/rss/edition_africa.rss'
    ]
  },
  aljazeera: {
    name: 'Al Jazeera',
    urls: [
      'https://www.aljazeera.com/xml/rss/all.xml',
      'https://www.aljazeera.com/xml/rss/africa.xml'
    ]
  },
  msnbc: {
    name: 'MSNBC',
    urls: [
      'http://feeds.nbcnews.com/feeds/topstories',
      'http://feeds.nbcnews.com/feeds/world'
    ]
  },
  sky: {
    name: 'Sky News',
    urls: [
      'http://feeds.skynews.com/feeds/rss/home.xml',
      'http://feeds.skynews.com/feeds/rss/world.xml'
    ]
  }
};

// Social Media Breaking News Accounts
const SOCIAL_ACCOUNTS = {
  twitter: {
    bbc: '@BBCBreaking',
    cnn: '@cnnbrk',
    aljazeera: '@AJENews',
    sky: '@SkyNewsBreak',
    msnbc: '@MSNBC'
  }
};

module.exports = {
  RSS_FEEDS,
  SOCIAL_ACCOUNTS
};
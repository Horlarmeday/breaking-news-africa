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

  // Reuters official RSS feeds discontinued in June 2020
  // Using Google News RSS as alternative for Reuters content
  reuters_via_google: {
    name: 'Reuters (via Google News)',
    urls: [
      'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US'
    ]
  },

  // AP official RSS feeds discontinued, similar to Reuters
  // Using Google News RSS as alternative for AP content
  ap_via_google: {
    name: 'AP News (via Google News)',
    urls: [
      'https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&ceid=US:en&hl=en-US&gl=US'
    ]
  },

  aljazeera: {
    name: 'Al Jazeera',
    urls: [
      'https://www.aljazeera.com/xml/rss/all.xml'
    ]
  },

  dw: {
    name: 'Deutsche Welle',
    urls: [
      'https://rss.dw.com/xml/rss-en-all'
    ]
  },

  rfi: {
    name: 'RFI',
    urls: [
      'https://www.rfi.fr/fr/afrique/rss'
    ]
  },

  cgtn: {
    name: 'CGTN',
    urls: [
      'https://www.cgtn.com/subscribe/rss/section/world.xml'
    ]
  },

  // AFP feed returns 404 error - replaced with working alternative
  
  euronews: {
    name: 'Euronews',
    urls: [
      'https://www.euronews.com/rss?format=mrss'
    ]
  }
}

// Social Media Breaking News Accounts
const SOCIAL_ACCOUNTS = {
  twitter: {
    bbc: '@BBCBreaking',
    cnn: '@cnnbrk',
    ap: '@APNews',
    rfi: '@RFI',
    cgtn: '@CGTN',
    afp: '@AFP'
  }
};

module.exports = {
  RSS_FEEDS,
  SOCIAL_ACCOUNTS
};
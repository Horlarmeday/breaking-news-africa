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

  reuters: {
    name: 'Reuters',
    urls: [
      'https://www.reuters.com/world/rss'
    ]
  },

  ap: {
    name: 'Associated Press',
    urls: [
      'https://apnews.com/index.rss'
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

  afp: {
    name: 'AFP',
    urls: [
      'https://www.afp.com/en/rss'
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
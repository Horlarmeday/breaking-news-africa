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
  },

  reuters: {
    name: 'Reuters',
    urls: [
      'https://www.reuters.com/world/africa/rss'
    ]
  },

  ap: {
    name: 'AP',
    urls: [
      'https://apnews.com/hub/africa?output=rss'
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
      'https://africa.cgtn.com/feed/'
    ]
  },

  afp: {
    name: 'AFP',
    urls: [
      'https://www.afp.com/en/rss'
    ]
  },

  // West African Regional Sources
  ecowas: {
    name: 'ECOWAS News',
    urls: [
      'https://www.ecowas.int/feed/'
    ]
  },

  // Nigerian Sources
  punch: {
    name: 'Punch Nigeria',
    urls: [
      'https://punchng.com/feed/'
    ]
  },
  vanguard: {
    name: 'Vanguard Nigeria',
    urls: [
      'https://www.vanguardngr.com/feed/'
    ]
  },
  premiumtimes: {
    name: 'Premium Times',
    urls: [
      'https://www.premiumtimesng.com/feed'
    ]
  },
  dailytrust: {
    name: 'Daily Trust',
    urls: [
      'https://dailytrust.com/feed'
    ]
  },

  // Niger Sources
  actuniger: {
    name: 'ActuNiger',
    urls: [
      'https://actuniger.com/feed/'
    ]
  },

  // Burkina Faso Sources
  lefaso: {
    name: 'LeFaso.net',
    urls: [
      'https://lefaso.net/spip.php?page=backend'
    ]
  },

  // Benin Sources
  beninwebtv: {
    name: 'Benin Web TV',
    urls: [
      'https://beninwebtv.com/feed/'
    ]
  },

  // Togo Sources
  republicoftogo: {
    name: 'Republic of Togo',
    urls: [
      'https://www.republicoftogo.com/feed/'
    ]
  }
}

// Social Media Breaking News Accounts
const SOCIAL_ACCOUNTS = {
  twitter: {
    bbc: '@BBCBreaking',
    cnn: '@cnnbrk',
    aljazeera: '@AJENews',
    sky: '@SkyNewsBreak',
    msnbc: '@MSNBC',
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
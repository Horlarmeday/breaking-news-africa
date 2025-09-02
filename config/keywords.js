// Breaking News Keywords - Must be present for alert
const BREAKING_NEWS_KEYWORDS = [
  'BREAKING',
  'URGENT',
  'ALERT', 
  'JUST IN',
  'DEVELOPING',
  'LIVE',
  'FLASH',
  'EMERGENCY',
  'UPDATE',
  'LATEST',
  'NEWS FLASH',
  'BREAKING NEWS'
];

// Restricted to 5 Countries Only - Nigeria, Niger, Burkina Faso, Benin, Togo
const WEST_AFRICAN_KEYWORDS = {
  // Countries/Regions - Core identifiers (5 countries only)
  countries: [
    // Nigeria
    'Nigeria', 'Nigerian', 'Nigerians', 'Federal Republic of Nigeria',
    // Niger (more specific to avoid Niger River matches)
    'Republic of Niger', 'Nigerien', 'Nigeriens', 'Niger Republic', 'Niger country',
    // Burkina Faso
    'Burkina Faso', 'Burkinabé', 'Burkinabe',
    // Benin
    'Benin', 'Beninese', 'Republic of Benin',
    // Togo
    'Togo', 'Togolese', 'Republic of Togo'
    // Note: Removed broader regional terms to prevent matching other countries
    // Note: Removed standalone 'Niger' to avoid matching Niger River
  ],

  // Major Cities - Only capital cities and major economic centers
  cities: [
    // Nigeria - Major cities only
    'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Kaduna',
    // Niger
    'Niamey',
    // Burkina Faso
    'Ouagadougou',
    // Benin
    'Cotonou', 'Porto-Novo',
    // Togo
    'Lomé'
  ],

  // Political Figures - Current leaders and major political figures
  politicians: [
    // Nigeria - Current administration and major opposition
    'Tinubu', 'Bola Tinubu',
    'Shettima', 'Kashim Shettima',
    'Atiku', 'Atiku Abubakar',
    'Peter Obi', 'Obi',
    'Kwankwaso', 'Rabiu Kwankwaso',
    'Akpabio', 'Godswill Akpabio',
    'Sanwo-Olu', 'Babajide Sanwo-Olu',
    // Niger - Current leadership
    'Abdourahamane Tchiani', 'Tchiani',
    'Mohamed Bazoum', 'Bazoum',
    // Burkina Faso - Current leadership
    'Ibrahim Traoré', 'Traoré',
    // Benin - Current leadership
    'Patrice Talon', 'Talon',
    // Togo - Current leadership
    'Faure Gnassingbé', 'Gnassingbé'
  ],

  // Government Organizations & Agencies
  organizations: [
    // Nigeria - Major government institutions
    'INEC', 'Independent National Electoral Commission',
    'CBN', 'Central Bank of Nigeria',
    'NNPC', 'NNPCL', 'Nigerian National Petroleum Corporation',
    'EFCC', 'Economic and Financial Crimes Commission',
    'DSS', 'Department of State Services',
    'NASS', 'National Assembly',
    'Supreme Court of Nigeria',
    'Nigerian Police Force', 'NPF',
    'Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force',
    'NAFDAC', 'National Agency for Food and Drug Administration',
    'FIRS', 'Federal Inland Revenue Service',
    // Niger
    'CENI Niger Republic', 'Central Bank of Niger Republic',
    'Niger Republic Armed Forces',
    // Burkina Faso
    'CENI Burkina', 'Central Bank of Burkina Faso',
    'Burkina Faso Armed Forces',
    // Benin
    'CENA Benin', 'Central Bank of Benin',
    'Benin Armed Forces',
    // Togo
    'CENI Togo', 'Central Bank of Togo',
    'Togo Armed Forces',
    // Note: Removed regional organizations to prevent matching other countries
  ],

  // Political Parties - Major active parties
  parties: [
    // Nigeria - Major parties
    'APC', 'All Progressives Congress',
    'PDP', 'Peoples Democratic Party',
    'LP', 'Labour Party',
    'NNPP', 'New Nigeria Peoples Party',
    'APGA', 'All Progressives Grand Alliance',
    // Niger - Major parties
    'PNDS', 'Parti Nigérien pour la Démocratie et le Socialisme',
    'MNSD', 'Mouvement National pour la Société de Développement',
    // Burkina Faso - Major parties
    'MPP', 'Mouvement du Peuple pour le Progrès',
    'UPC', 'Union pour le Progrès et le Changement',
    // Benin - Major parties
    'UP Benin', 'Union Progressiste Benin',
    'Bloc Républicain Benin', 'Bloc Républicain',
    // Togo - Major parties
    'UNIR', 'Union pour la République',
    'ANC', 'Alliance Nationale pour le Changement'
  ],

  // Economic Terms - Country-specific only
  economic: [
    // Currency - specific to these countries
    'Naira', 'Nigerian Naira', 'NGN',
    'CFA Franc', 'XOF',
    'Central Bank of Nigeria',
    'Central Bank of Niger Republic', 'Central Bank of Burkina Faso',
    'Central Bank of Benin', 'Central Bank of Togo',
    // Nigeria-specific economic terms
    'Dangote Refinery', 'NNPC', 'NNPCL',
    'NSE', 'Nigerian Stock Exchange',
    'FIRS', 'Federal Inland Revenue Service',
    'Nigeria LNG', 'NLNG'
    // Note: Removed generic economic terms to prevent matching other countries
  ],

  // Security & Conflict - Country-specific only
  security: [
    // Nigeria-specific security groups
    'Boko Haram', 'ISWAP', 'ISWAP Nigeria',
    'Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force',
    'Nigerian Police Force', 'NPF',
    'DSS', 'Department of State Services',
    // Niger-specific
    'Niger Republic Armed Forces',
    // Burkina Faso-specific
    'Burkina Faso Armed Forces',
    // Benin-specific
    'Benin Armed Forces',
    // Togo-specific
    'Togo Armed Forces'
    // Note: Removed generic security terms to prevent matching other countries
  ],

  // Ethnic Groups - Major ethnic groups likely to appear in news
  ethnic: [
    // Nigeria - Major groups
    'Hausa', 'Hausa-Fulani', 'Fulani',
    'Yoruba', 'Igbo',
    'Ijaw', 'Kanuri', 'Tiv',
    // Niger - Major groups
    'Hausa Niger Republic', 'Zarma Niger', 'Tuareg Niger', 'Fulani Niger Republic',
    // Burkina Faso - Major groups
    'Mossi', 'Fulani Burkina',
    // Benin - Major groups
    'Fon', 'Yoruba Benin', 'Bariba',
    // Togo - Major groups
    'Ewe', 'Kabyé'
  ],

  // Infrastructure - Critical infrastructure likely to generate breaking news
  infrastructure: [
    // Major Transportation
    'Lagos-Ibadan Railway', 'Abuja-Kaduna Railway',
    'Murtala Muhammed Airport', 'Nnamdi Azikiwe Airport',
    'Lagos Port', 'Port Harcourt Port',
    'Third Mainland Bridge',
    'Lagos-Ibadan Expressway',
    // Power/Energy
    'Kainji Dam', 'Jebba Dam', 'Shiroro Dam',
    'Dangote Refinery', 'National Grid',
    'Transmission Company of Nigeria', 'TCN',
    // Telecommunications
    'MTN Nigeria', 'Airtel Nigeria', 'Globacom Nigeria',
    '5G Network', 'NCC',
    // Oil & Gas Infrastructure
    'Nigeria Gas Pipeline',
    'Port Harcourt Refinery', 'Nigeria LNG', 'NLNG',
    // Regional Infrastructure
    'Niamey Airport', 'Ouagadougou Airport',
    'Cotonou Airport', 'Port of Cotonou',
    'Lomé Airport', 'Port of Lomé'
  ],

  // Entertainment/Sports - Major celebrities and events likely to generate breaking news
  entertainment: [
    // Music - Top tier artists
    'Burna Boy', 'Wizkid', 'Davido', 'Tiwa Savage',
    'Rema', 'Ayra Starr', 'CKay', 'Fireboy DML',
    'Olamide', 'Phyno', 'Falz',
    'Afrobeats', 'Grammy Awards',
    // Nollywood - Major stars
    'Nollywood', 'Genevieve Nnaji', 'Funke Akindele',
    'Ramsey Nouah', 'Pete Edochie',
    'Mo Abudu', 'EbonyLife', 'AMVCA',
    // Sports - National teams and top athletes
    'Super Eagles', 'Victor Osimhen', 'Kelechi Iheanacho',
    'Super Falcons', 'Asisat Oshoala',
    'Anthony Joshua', 'Kamaru Usman', 'Israel Adesanya',
    'Blessing Okagbare', 'Tobi Amusan',
    // Regional Entertainment
    'Angélique Kidjo', 'FESPACO'
  ],

  // Educational Institutions
  education: [
    'University of Lagos', 'UNILAG',
    'University of Ibadan Nigeria', 'UI Nigeria',
    'Ahmadu Bello University', 'ABU',
    'University of Nigeria Nsukka', 'UNN',
    'Obafemi Awolowo University', 'OAU',
    'University of Benin', 'UNIBEN',
    'Federal University of Technology Akure', 'FUTA',
    'Lagos State University', 'LASU',
    'Covenant University',
    'Babcock University',
    'American University of Nigeria', 'AUN'
  ]
};

// Flatten all keywords into a single array for easy searching
const ALL_WEST_AFRICAN_KEYWORDS = [].concat(
  WEST_AFRICAN_KEYWORDS.countries,
  WEST_AFRICAN_KEYWORDS.cities,
  WEST_AFRICAN_KEYWORDS.politicians,
  WEST_AFRICAN_KEYWORDS.organizations,
  WEST_AFRICAN_KEYWORDS.parties,
  WEST_AFRICAN_KEYWORDS.economic,
  WEST_AFRICAN_KEYWORDS.security,
  WEST_AFRICAN_KEYWORDS.ethnic,
  WEST_AFRICAN_KEYWORDS.infrastructure,
  WEST_AFRICAN_KEYWORDS.entertainment,
  WEST_AFRICAN_KEYWORDS.education
);

// Backward compatibility - keep old exports for existing code
const NIGERIAN_KEYWORDS = WEST_AFRICAN_KEYWORDS;
const ALL_NIGERIAN_KEYWORDS = ALL_WEST_AFRICAN_KEYWORDS;

module.exports = {
  BREAKING_NEWS_KEYWORDS,
  WEST_AFRICAN_KEYWORDS,
  ALL_WEST_AFRICAN_KEYWORDS,
  // Backward compatibility
  NIGERIAN_KEYWORDS,
  ALL_NIGERIAN_KEYWORDS
};
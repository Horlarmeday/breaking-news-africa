// Breaking News Keywords - Must be present for alert
// Made more specific to avoid false matches
const BREAKING_NEWS_KEYWORDS = [
  'BREAKING',
  'URGENT',
  'ALERT', 
  'JUST IN',
  'DEVELOPING',
  'LIVE',
  'FLASH',
  'EMERGENCY',
  'BREAKING UPDATE',  // More specific than just 'UPDATE'
  'URGENT UPDATE',    // More specific than just 'UPDATE'
  'LATEST',
  'NEWS FLASH',
  'BREAKING NEWS'
];

// Simplified to 5 Countries Only - Nigeria, Niger, Burkina Faso, Benin, Togo
// Only country names and basic identifiers to reduce false positives
const WEST_AFRICAN_KEYWORDS = {
  // Countries/Regions - Core identifiers only (5 countries)
  countries: [
    // Nigeria
    'Nigeria', 'Nigerian', 'Nigerians', 'Federal Republic of Nigeria',
    // Niger (specific to avoid Niger River matches)
    'Republic of Niger', 'Nigerien', 'Nigeriens', 'Niger Republic', 'Niger country',
    // Burkina Faso
    'Burkina Faso', 'Burkinabé', 'Burkinabe',
    // Benin
    'Benin', 'Beninese', 'Republic of Benin',
    // Togo
    'Togo', 'Togolese', 'Republic of Togo'
  ]
};

// Flatten all keywords into a single array for easy searching
const ALL_WEST_AFRICAN_KEYWORDS = [].concat(
  WEST_AFRICAN_KEYWORDS.countries
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
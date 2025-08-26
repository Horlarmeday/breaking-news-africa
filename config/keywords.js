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

// Nigerian Context Keywords - At least one must be present
const NIGERIAN_KEYWORDS = {
  // Country/Region
  country: [
    'Nigeria', 'Nigerian', 'Nigerians',
    'West Africa', 'Sub-Saharan Africa',
    'Federal Republic of Nigeria'
  ],

  // Major Cities
  cities: [
    'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt',
    'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos',
    'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Kaduna',
    'Sokoto', 'Owerri', 'Warri', 'Calabar', 'Uyo',
    'Akure', 'Bauchi', 'Gombe', 'Yola', 'Jalingo',
    'Lafia', 'Lokoja', 'Makurdi', 'Minna', 'Osogbo',
    'Awka', 'Abakaliki', 'Asaba', 'Yenagoa', 'Ado-Ekiti'
  ],

  // All 36 States + FCT
  states: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi',
    'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
    'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
    'Zamfara', 'FCT', 'Federal Capital Territory'
  ],

  // Political Figures
  politicians: [
    'Tinubu', 'Bola Tinubu', 'Ahmed Tinubu',
    'Buhari', 'Muhammadu Buhari',
    'Osinbajo', 'Yemi Osinbajo',
    'Atiku', 'Atiku Abubakar',
    'Peter Obi', 'Obi',
    'Kwankwaso', 'Rabiu Kwankwaso',
    'Saraki', 'Bukola Saraki',
    'Lawan', 'Ahmad Lawan',
    'Gbajabiamila', 'Femi Gbajabiamila',
    'Akpabio', 'Godswill Akpabio',
    'Shettima', 'Kashim Shettima',
    'Sanwo-Olu', 'Babajide Sanwo-Olu',
    'El-Rufai', 'Nasir El-Rufai',
    'Fayemi', 'Kayode Fayemi',
    'Oyetola', 'Adegboyega Oyetola',
    'Soludo', 'Charles Soludo',
    'Obaseki', 'Godwin Obaseki',
    'Fubara', 'Siminalayi Fubara',
    'Wike', 'Nyesom Wike'
  ],

  // Government Organizations & Agencies
  organizations: [
    'INEC', 'Independent National Electoral Commission',
    'CBN', 'Central Bank of Nigeria',
    'NNPC', 'NNPCL', 'Nigerian National Petroleum Corporation',
    'EFCC', 'Economic and Financial Crimes Commission',
    'ICPC', 'Independent Corrupt Practices Commission',
    'DSS', 'Department of State Services',
    'NIA', 'National Intelligence Agency',
    'NASS', 'National Assembly',
    'Supreme Court of Nigeria',
    'Federal High Court',
    'Court of Appeal',
    'Nigerian Police Force', 'NPF',
    'Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force',
    'NYSC', 'National Youth Service Corps',
    'JAMB', 'Joint Admissions and Matriculation Board',
    'WAEC', 'West African Examinations Council',
    'NUC', 'National Universities Commission',
    'NERC', 'Nigerian Electricity Regulatory Commission',
    'NCC', 'Nigerian Communications Commission',
    'NAFDAC', 'National Agency for Food and Drug Administration',
    'SON', 'Standards Organisation of Nigeria',
    'FIRS', 'Federal Inland Revenue Service',
    'Nigerian Customs Service', 'NCS',
    'NDDC', 'Niger Delta Development Commission',
    'TETFUND', 'Tertiary Education Trust Fund'
  ],

  // Political Parties
  parties: [
    'PDP', "People's Democratic Party",
    'APC', 'All Progressives Congress',
    'LP', 'Labour Party',
    'NNPP', 'New Nigeria Peoples Party',
    'APGA', "All Progressives Grand Alliance",
    'SDP', 'Social Democratic Party',
    'ADC', 'African Democratic Congress'
  ],

  // Economic Terms & Banks
  economic: [
    'Naira', 'NGN',
    'Dangote', 'Aliko Dangote',
    'BUA', 'Abdul Samad Rabiu',
    'Zenith Bank', 'GTBank', 'Guaranty Trust Bank',
    'Access Bank', 'First Bank', 'First Bank of Nigeria',
    'UBA', 'United Bank for Africa',
    'Fidelity Bank', 'Union Bank',
    'Stanbic IBTC', 'Sterling Bank',
    'Ecobank', 'FCMB', 'First City Monument Bank',
    'Heritage Bank', 'Keystone Bank',
    'Polaris Bank', 'Providus Bank',
    'SunTrust Bank', 'Titan Trust Bank',
    'Unity Bank', 'Wema Bank',
    'Lagos Stock Exchange', 'NSE', 'Nigerian Stock Exchange',
    'NGX', 'Nigerian Exchange Limited'
  ],

  // Security & Conflict Terms
  security: [
    'Boko Haram', 'ISWAP', 'Islamic State West Africa Province',
    'Banditry', 'Bandits', 'Kidnapping',
    'Fulani Herders', 'Herders', 'Farmers',
    'Niger Delta', 'Niger Delta Militants',
    'IPOB', 'Indigenous People of Biafra',
    'ESN', 'Eastern Security Network',
    'Unknown Gunmen',
    'Terrorism', 'Insurgency',
    'Cattle Rustling', 'Armed Robbery',
    'Ritual Killing', 'Cultism'
  ],

  // Ethnic Groups & Languages
  ethnic: [
    'Yoruba', 'Igbo', 'Hausa', 'Fulani',
    'Ijaw', 'Kanuri', 'Ibibio', 'Tiv',
    'Edo', 'Nupe', 'Gwari', 'Jukun',
    'Urhobo', 'Isoko', 'Itsekiri'
  ],

  // Infrastructure & Utilities
  infrastructure: [
    'NLNG', 'Nigeria LNG',
    'Refineries', 'Port Harcourt Refinery', 'Warri Refinery',
    'Kaduna Refinery', 'Dangote Refinery',
    'Power Grid', 'NEPA', 'PHCN',
    'Transmission Company of Nigeria', 'TCN',
    'Distribution Companies', 'DisCos',
    'Generation Companies', 'GenCos',
    'Nigerian Railway Corporation', 'NRC',
    'Lagos-Ibadan Railway', 'Abuja-Kaduna Railway',
    'Murtala Muhammed Airport', 'Nnamdi Azikiwe Airport',
    'Port Harcourt Airport', 'Kano Airport',
    'Lagos Port', 'Tin Can Island Port',
    'Calabar Port', 'Port Harcourt Port'
  ],

  // Entertainment & Sports
  entertainment: [
    'Nollywood', 'Afrobeats',
    'Super Eagles', 'Super Falcons',
    'NFF', 'Nigeria Football Federation',
    'NPFL', 'Nigerian Premier Football League',
    'Big Brother Naija', 'BBNaija',
    'Headies Awards', 'AMVCA',
    'Davido', 'Wizkid', 'Burna Boy',
    'Tiwa Savage', 'Yemi Alade'
  ],

  // Educational Institutions
  education: [
    'University of Lagos', 'UNILAG',
    'University of Ibadan', 'UI',
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

// Flatten all Nigerian keywords into a single array for easier searching
const ALL_NIGERIAN_KEYWORDS = [].concat(
  NIGERIAN_KEYWORDS.country,
  NIGERIAN_KEYWORDS.cities,
  NIGERIAN_KEYWORDS.states,
  NIGERIAN_KEYWORDS.politicians,
  NIGERIAN_KEYWORDS.organizations,
  NIGERIAN_KEYWORDS.parties,
  NIGERIAN_KEYWORDS.economic,
  NIGERIAN_KEYWORDS.security,
  NIGERIAN_KEYWORDS.ethnic,
  NIGERIAN_KEYWORDS.infrastructure,
  NIGERIAN_KEYWORDS.entertainment,
  NIGERIAN_KEYWORDS.education
);

module.exports = {
  BREAKING_NEWS_KEYWORDS,
  NIGERIAN_KEYWORDS,
  ALL_NIGERIAN_KEYWORDS
};
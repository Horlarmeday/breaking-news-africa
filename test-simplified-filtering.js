const { BREAKING_NEWS_KEYWORDS, ALL_WEST_AFRICAN_KEYWORDS } = require('./config/keywords');

// Test articles to verify simplified filtering
const testArticles = [
  // Should MATCH - Breaking news with country keywords
  {
    title: "BREAKING: Nigeria announces new economic policy",
    description: "The Federal Republic of Nigeria has just announced major changes...",
    expected: true,
    reason: "Has BREAKING + Nigeria"
  },
  {
    title: "URGENT: Republic of Niger faces security challenges",
    description: "Latest reports from Niger Republic indicate...",
    expected: true,
    reason: "Has URGENT + Republic of Niger"
  },
  {
    title: "JUST IN: Burkina Faso president makes announcement",
    description: "Burkinabé officials confirm the news...",
    expected: true,
    reason: "Has JUST IN + Burkina Faso + Burkinabé"
  },
  {
    title: "ALERT: Benin government responds to crisis",
    description: "Beninese authorities have issued a statement...",
    expected: true,
    reason: "Has ALERT + Benin + Beninese"
  },
  {
    title: "DEVELOPING: Togo implements new measures",
    description: "Togolese officials announce changes...",
    expected: true,
    reason: "Has DEVELOPING + Togo + Togolese"
  },
  
  // Should NOT MATCH - No breaking news keywords
  {
    title: "Nigeria celebrates independence day",
    description: "Annual celebration in Nigerian capital...",
    expected: false,
    reason: "Has Nigeria but no breaking news keyword"
  },
  {
    title: "Regular update from Benin",
    description: "Routine report from Beninese officials...",
    expected: false,
    reason: "Has Benin but no breaking news keyword"
  },
  
  // Should NOT MATCH - Breaking news but no country keywords
  {
    title: "BREAKING: Global economic summit concludes",
    description: "International leaders discuss trade policies...",
    expected: false,
    reason: "Has BREAKING but no target country"
  },
  {
    title: "URGENT: European Union announces new sanctions",
    description: "EU officials confirm the decision...",
    expected: false,
    reason: "Has URGENT but no target country"
  },
  
  // Should NOT MATCH - False positives that should be eliminated
  {
    title: "BREAKING: Celtic upset in football match",
    description: "Scottish team loses in surprising defeat...",
    expected: false,
    reason: "Has BREAKING but 'upset' should not trigger (no UP keyword anymore)"
  },
  {
    title: "URGENT: Niger River flooding affects multiple countries",
    description: "The Niger River has caused flooding in Mali and other regions...",
    expected: false,
    reason: "Has URGENT + Niger River but should not match (no standalone Niger keyword)"
  },
  {
    title: "JUST IN: UK financial markets show volatility",
    description: "British pound fluctuates amid economic uncertainty...",
    expected: false,
    reason: "Has JUST IN but no target country keywords"
  }
];

// Function to check if article matches criteria
function matchesBreakingNewsCriteria(title, description) {
  const fullText = `${title} ${description}`.toLowerCase();
  
  // Check for breaking news keywords
  const hasBreakingKeyword = BREAKING_NEWS_KEYWORDS.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  // Check for West African country keywords
  const hasCountryKeyword = ALL_WEST_AFRICAN_KEYWORDS.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  // Must have BOTH breaking news keyword AND country keyword
  return hasBreakingKeyword && hasCountryKeyword;
}

// Run tests
console.log('Testing Simplified Keyword Filtering\n');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

testArticles.forEach((article, index) => {
  const result = matchesBreakingNewsCriteria(article.title, article.description);
  const success = result === article.expected;
  
  console.log(`\nTest ${index + 1}: ${success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Title: "${article.title}"`);
  console.log(`Expected: ${article.expected ? 'MATCH' : 'NO MATCH'}`);
  console.log(`Actual: ${result ? 'MATCH' : 'NO MATCH'}`);
  console.log(`Reason: ${article.reason}`);
  
  if (success) {
    passed++;
  } else {
    failed++;
    console.log(`❌ FAILURE DETAILS: Expected ${article.expected}, got ${result}`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\nTEST SUMMARY:`);
console.log(`✅ Passed: ${passed}/${testArticles.length}`);
console.log(`❌ Failed: ${failed}/${testArticles.length}`);
console.log(`📊 Success Rate: ${((passed / testArticles.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Simplified filtering is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Review the filtering logic.');
}

// Show current keyword counts
console.log('\n' + '='.repeat(50));
console.log('CURRENT KEYWORD CONFIGURATION:');
console.log(`Breaking News Keywords: ${BREAKING_NEWS_KEYWORDS.length}`);
console.log(`Country Keywords: ${ALL_WEST_AFRICAN_KEYWORDS.length}`);
console.log(`Total Keywords: ${BREAKING_NEWS_KEYWORDS.length + ALL_WEST_AFRICAN_KEYWORDS.length}`);

console.log('\nBreaking News Keywords:', BREAKING_NEWS_KEYWORDS);
console.log('\nCountry Keywords:', ALL_WEST_AFRICAN_KEYWORDS);
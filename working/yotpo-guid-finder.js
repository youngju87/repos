// Yotpo GUID Finder - Run this in your browser console to find where the GUID is stored

console.log('=== YOTPO GUID FINDER ===\n');

// Check 1: window.yotpoWidgetsMap
console.log('1. Checking window.yotpoWidgetsMap:');
if (window.yotpoWidgetsMap) {
  console.log('   Found:', window.yotpoWidgetsMap);
  if (window.yotpoWidgetsMap.length > 0) {
    console.log('   GUID from yotpoWidgetsMap[0]:', window.yotpoWidgetsMap[0].guid);
  }
} else {
  console.log('   Not found');
}

// Check 2: window.yotpo.initialized
console.log('\n2. Checking window.yotpo.initialized:');
if (window.yotpo && window.yotpo.initialized) {
  console.log('   Found:', window.yotpo.initialized);
  var guids = Object.keys(window.yotpo.initialized);
  console.log('   GUIDs found:', guids);
} else {
  console.log('   Not found');
}

// Check 3: Full window.yotpo object
console.log('\n3. Full window.yotpo object:');
if (window.yotpo) {
  console.log('   Keys:', Object.keys(window.yotpo));
  console.log('   Full object:', window.yotpo);
} else {
  console.log('   Not found');
}

// Check 4: Look for GUID in data attributes
console.log('\n4. Checking data attributes on page:');
var yotpoElements = document.querySelectorAll('[data-yotpo-instance-id], [data-appkey], .yotpo');
console.log('   Found', yotpoElements.length, 'Yotpo elements');
yotpoElements.forEach(function(el, index) {
  console.log('   Element', index + ':', {
    className: el.className,
    dataAppkey: el.getAttribute('data-appkey'),
    dataInstanceId: el.getAttribute('data-yotpo-instance-id'),
    allDataAttributes: Array.from(el.attributes).filter(attr => attr.name.startsWith('data-'))
  });
});

// Check 5: Check for GUID in your example object structure
console.log('\n5. Checking window.yotpo.guids:');
if (window.yotpo && window.yotpo.guids) {
  var guidKeys = Object.keys(window.yotpo.guids);
  console.log('   Found GUIDs:', guidKeys);
  if (guidKeys.length > 0) {
    console.log('   First GUID:', guidKeys[0]);
    console.log('   GUID data:', window.yotpo.guids[guidKeys[0]]);
  }
} else {
  console.log('   Not found');
}

// Check 6: Look for config with guid
console.log('\n6. Checking for config.data.guid:');
if (window.yotpo && window.yotpo.guids) {
  Object.keys(window.yotpo.guids).forEach(function(guid) {
    if (window.yotpo.guids[guid].config && window.yotpo.guids[guid].config.data) {
      console.log('   Found GUID in config:', window.yotpo.guids[guid].config.data.guid);
    }
  });
}

console.log('\n=== END YOTPO GUID FINDER ===');
console.log('\nPaste the output above and I can help update the tag!');

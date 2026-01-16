// ============================================================================
// SCRIPT 1: Search/Suggest Event Handler (Fire on Search Action)
// ============================================================================
// GTM Trigger: Custom Event "bloomreach_search" OR Form Submission (search form)
// OR Suggestion Click Event
//
// This should fire IMMEDIATELY when the user searches/clicks a suggestion,
// BEFORE navigation occurs.
// ============================================================================

<script type="text/javascript">
(function() {
  // Initialize br_data if not already present
  window.br_data = window.br_data || {};

  // Ensure basic configuration is set
  if(!window.br_data.acct_id) {
    window.br_data.acct_id = {{const - Bloomreach ID}};
    window.br_data.domain_key = {{lu - Bloomreach - Domain Key}};
    window.br_data.view_id = {{lu - Bloomreach - View ID}};
    window.br_data.tms = "gtm";

    if({{Page Hostname}} != "eu.eastpak.com") {
      window.br_data.test_data = true;
      window.br_data.debug = true;
    }
  }

  // Get search term from the event or data layer
  var searchTerm = {{dL - search_term}} || {{Click Text}} || '';

  // Determine if this is a suggest click or form submit
  // You can customize this logic based on your GTM trigger setup
  var isSuggestClick = ({{Event}} === 'suggestion_click') ||
                       ({{Click Classes}} && {{Click Classes}}.indexOf('suggestion') > -1);

  if(!searchTerm) {
    console.warn('Bloomreach: No search term found for search/suggest event');
    return;
  }

  // Store suggest click flag for the next page (if navigation happens)
  if(isSuggestClick) {
    sessionStorage.setItem('br_suggest_click', 'true');
  }

  // Prepare search event data
  var searchData = {
    "q": searchTerm,
    "aq": searchTerm
  };

  var eventType = isSuggestClick ? 'click' : 'submit';

  // Helper function to log the suggest event
  function logSuggestEvent() {
    if(typeof BrTrk !== "undefined") {
      BrTrk.getTracker().logEvent("suggest", eventType, searchData, {}, false);
      console.log('Bloomreach suggest event fired:', eventType, searchData);
    }
  }

  // If BrTrk is already loaded, fire immediately
  if(typeof BrTrk !== "undefined") {
    logSuggestEvent();
  } else {
    // Load br-trk.js and fire event after load
    var brtrk = document.createElement('script');
    brtrk.type = 'text/javascript';
    brtrk.async = true;
    brtrk.src = 'https:' == document.location.protocol ?
                "https://cdns.brsrvr.com/v1/br-trk-{{const - Bloomreach ID}}.js" :
                "http://cdn.brcdn.com/v1/br-trk-{{const - Bloomreach ID}}.js";

    brtrk.onload = function() {
      // Set minimal br_data for initialization
      BrTrk.getTracker().updateBrData(window.br_data);
      logSuggestEvent();
    };

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(brtrk, s);
  }
})();
</script>


// ============================================================================
// SCRIPT 2: Page View Event Handler (Fire on All Page Views)
// ============================================================================
// GTM Trigger: Page View (all pages)
//
// This handles regular page view tracking for all page types.
// For search results pages, it will NOT fire the suggest event again.
// ============================================================================

<script type="text/javascript">
{{VFTag}}(dataLayer, "BloomReach - Page View", function() {
  window.br_data = window.br_data || {};

  if({{Page Hostname}} != "eu.eastpak.com") {
    window.br_data.test_data = true;
    window.br_data.debug = true;
  }

  window.br_data.acct_id = {{const - Bloomreach ID}};
  window.br_data.domain_key = {{lu - Bloomreach - Domain Key}};
  window.br_data.view_id = {{lu - Bloomreach - View ID}};
  window.br_data.tms = "gtm";
  window.br_data.orig_ref_url = location.href;

  if({{Event}} == "purchase") {
    window.br_data.ptype = "conversion";
  } else {
    window.br_data.ptype = {{lu - BloomReach - pageType}};
  }

  switch (window.br_data.ptype) {
    case 'product':
      window.br_data.prod_id = {{dL - ecommerce.items}}[0].item_id + {{dL - ecommerce.items}}[0].colorCode;
      window.br_data.prod_name = {{dL - ecommerce.items}}[0].item_name;
      window.br_data.sku = {{dL - ecommerce.items}}[0].sku;
      break;
    case 'category':
      window.br_data.cat_id = {{dL - item_list_id}};
      window.br_data.cat = {{dL - item_list_name}};
      break;
    case 'search':
      // For search results pages, set the search metadata but DON'T fire suggest event
      // The suggest event should have already fired on the previous page
      var searchTerm = {{dL - search_term}};
      window.br_data.search_term = searchTerm;
      window.br_data.q = searchTerm;

      // Clear the suggest click flag if it exists
      if(sessionStorage.getItem('br_suggest_click') === 'true') {
        sessionStorage.removeItem('br_suggest_click');
      }
      break;
    case 'conversion':
      window.br_data.is_conversion = 1;
      window.br_data.basket_value = {{dL - AFO - value}};
      window.br_data.order_id = {{dL - AFO - transaction id}};
      window.br_data.basket = {{cjs - Bloomreach - Basket}};
      break;
  }

  if(typeof BrTrk === "undefined") {
    var brtrk = document.createElement('script');
    brtrk.type = 'text/javascript';
    brtrk.async = true;
    brtrk.src = 'https:' == document.location.protocol ?
                "https://cdns.brsrvr.com/v1/br-trk-{{const - Bloomreach ID}}.js" :
                "http://cdn.brcdn.com/v1/br-trk-{{const - Bloomreach ID}}.js";

    brtrk.onload = function() {
      // Only fire pageView on load, NOT the suggest event
      BrTrk.getTracker().logPageView();
    };

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(brtrk, s);

  } else {
    BrTrk.getTracker().updateBrData(window.br_data);
    // Only fire pageView, NOT the suggest event
    BrTrk.getTracker().logPageView();
  }
});
</script>


// ============================================================================
// IMPLEMENTATION GUIDE
// ============================================================================

/*
STEP 1: Set up GTM triggers for Script 1 (Search/Suggest Events)
---------------------------------------------------------------

Option A: Form Submission Trigger (Recommended for search form)
- Trigger Type: Form Submission
- Fire on: Forms matching your search form selector (e.g., class contains "search-form")
- Variables needed: Capture the search input value into {{dL - search_term}}

Option B: Click Trigger (For suggestion clicks)
- Trigger Type: Click - All Elements
- Fire on: Clicks on suggestion items (e.g., class contains "suggestion-item")
- Variables needed: Capture the clicked suggestion text

Option C: Custom Event (Most flexible)
- Set up a listener on your search form/suggestion dropdown
- Push a custom GTM event when search occurs:

  // In your site's JavaScript:
  document.querySelector('.search-form').addEventListener('submit', function(e) {
    var searchTerm = document.querySelector('.search-input').value;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'bloomreach_search',
      'search_term': searchTerm,
      'search_type': 'submit'
    });
  });

  // For suggestion clicks:
  document.querySelectorAll('.suggestion-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      var suggestionText = this.textContent;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'bloomreach_search',
        'search_term': suggestionText,
        'search_type': 'suggestion_click'
      });
      sessionStorage.setItem('br_suggest_click', 'true');
    });
  });


STEP 2: Configure GTM Tag for Script 1
---------------------------------------
- Tag Type: Custom HTML
- Tag: Copy Script 1 above
- Trigger: Your search/suggest trigger from Step 1
- Tag Sequencing: None needed


STEP 3: Configure GTM Tag for Script 2
---------------------------------------
- Tag Type: Custom HTML
- Tag: Copy Script 2 above
- Trigger: Page View (All Pages) OR your existing VFTag pageview trigger
- Tag Sequencing: None needed


STEP 4: Test the implementation
--------------------------------
1. On homepage, open browser console
2. Type a search term and submit
3. You should see: "Bloomreach suggest event fired: submit, {q: 'your term'}"
4. Navigate to search results page
5. You should see only the pageView fire, NOT another suggest event
6. Check Bloomreach dashboard - suggest event should show homepage as referrer


WHAT CHANGED AND WHY
--------------------

OLD BEHAVIOR:
- Everything fired on pageview
- Search/suggest events fired on search results page (after navigation)
- This meant Bloomreach attributed the search to the wrong page

NEW BEHAVIOR:
- Script 1: Fires suggest event immediately when user searches (BEFORE navigation)
  - Triggered by form submit, suggestion click, or custom event
  - Fires on the homepage/original page where search occurs
  - Loads BrTrk if needed, or uses existing instance

- Script 2: Fires normal pageview tracking
  - Removed suggest event from search page type handling
  - Still sets search metadata for search results page context
  - Preserves all existing product/category/conversion logic

KEY IMPROVEMENTS:
1. Timing: Search events fire at search time, not on next page
2. Attribution: Bloomreach sees correct source page for searches
3. Flexibility: Can detect searches via form submit, clicks, or custom events
4. Backwards compatible: All existing pageview logic preserved
5. sessionStorage flag: Preserves suggest vs search distinction across navigation

*/

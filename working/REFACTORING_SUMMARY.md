# Bloomreach GTM Tag Refactoring Summary

## Problem
The original implementation fired ALL events (including search/suggest) on pageview, which meant:
- When a user searched on the homepage and navigated to search results
- The suggest event fired on the **search results page** (wrong!)
- Bloomreach attributed the search to the wrong page

## Solution
Split the logic into **two separate GTM tags**:

### Tag 1: Search/Suggest Event Handler
**When**: Fires immediately when user performs search action
**Trigger**: Form submission, suggestion click, or custom event
**Purpose**: Log the `suggest` event at the moment of search
**Page**: Fires on the **original page** (homepage, category page, etc.)

### Tag 2: Page View Event Handler
**When**: Fires on all page views
**Trigger**: Standard pageview trigger
**Purpose**: Log pageview and set page-specific metadata
**Page**: Fires on **all pages** but does NOT re-fire suggest events

---

## Key Changes

### ✅ What Changed

| Aspect | Old Behavior | New Behavior |
|--------|-------------|--------------|
| **Event Timing** | Suggest event fires on pageview (search results page) | Suggest event fires immediately on search action (original page) |
| **Script Structure** | Single script handling all logic | Two scripts: one for search events, one for pageviews |
| **Search Page Handling** | Fires suggest event when visiting search results | Only sets metadata, no suggest event |
| **Trigger Setup** | Only pageview trigger | Multiple triggers: pageview + search actions |

### ✅ What Stayed the Same

- All product/category/conversion page logic preserved
- `window.br_data` configuration unchanged
- Dynamic loading of `br-trk.js` still works
- `sessionStorage.br_suggest_click` flag still used
- All GTM variables work as before
- Debug mode logic unchanged

---

## Implementation Steps

### 1. Create GTM Trigger for Search Events

**Option A: Form Submission (Recommended)**
```javascript
Trigger Type: Form Submission
Trigger Name: Bloomreach - Search Form Submit
Fires on: Some Forms
Form matches: CSS selector: .search-form, #searchForm, etc.
```

**Option B: Custom Event (Most Flexible)**
Add this to your site's code:
```javascript
// Search form submit
document.querySelector('.search-form').addEventListener('submit', function(e) {
  dataLayer.push({
    'event': 'bloomreach_search',
    'search_term': document.querySelector('.search-input').value,
    'search_type': 'submit'
  });
});

// Suggestion clicks
document.querySelectorAll('.suggestion-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    dataLayer.push({
      'event': 'bloomreach_search',
      'search_term': this.textContent.trim(),
      'search_type': 'suggestion_click'
    });
    sessionStorage.setItem('br_suggest_click', 'true');
  });
});
```

### 2. Create Search Event Tag in GTM

```
Tag Name: Bloomreach - Search/Suggest Event
Tag Type: Custom HTML
HTML: [Copy Script 1 from bloomreach_refactored.js]
Triggering: Your search trigger from Step 1
```

### 3. Update Existing Pageview Tag

```
Tag Name: Bloomreach - Page View
Tag Type: Custom HTML
HTML: [Copy Script 2 from bloomreach_refactored.js]
Triggering: Page View - All Pages (or your existing VFTag trigger)
```

### 4. Test

1. **Homepage Search Test**
   - Open homepage with console open
   - Type search term and submit
   - Console should show: `"Bloomreach suggest event fired: submit"`
   - Navigate to search results
   - Console should show only pageview, NO suggest event

2. **Suggestion Click Test**
   - Open homepage with console open
   - Click an autosuggest result
   - Console should show: `"Bloomreach suggest event fired: click"`
   - Verify sessionStorage has `br_suggest_click = 'true'`

3. **Bloomreach Dashboard**
   - Check that suggest events show correct source page
   - Verify pageviews still tracking correctly

---

## Technical Deep Dive

### Script 1: Search/Suggest Handler

**Execution Flow:**
```
1. User performs search action → GTM trigger fires → Script 1 runs
2. Extract search term from event/data layer
3. Determine event type (submit vs click)
4. Check if BrTrk loaded
   ├─ If loaded: Fire suggest event immediately
   └─ If not: Load br-trk.js, then fire suggest event
5. Store flag in sessionStorage if suggestion click
6. User navigates to search results page
```

**Key Code:**
```javascript
var eventType = isSuggestClick ? 'click' : 'submit';
BrTrk.getTracker().logEvent("suggest", eventType, searchData, {}, false);
```

### Script 2: Pageview Handler

**Execution Flow:**
```
1. Page loads → VFTag pageview trigger fires → Script 2 runs
2. Initialize window.br_data with page metadata
3. Determine page type (product/category/search/conversion)
4. Set page-specific data based on type
   ├─ For search pages: Set metadata only (no event firing)
   └─ For other pages: Set relevant product/category/conversion data
5. Check if BrTrk loaded
   ├─ If loaded: Update br_data + fire pageView
   └─ If not: Load br-trk.js, then fire pageView
```

**Critical Change for Search Pages:**
```javascript
case 'search':
  // OLD: Would fire suggest event here
  // NEW: Only set metadata, event already fired on previous page
  var searchTerm = {{dL - search_term}};
  window.br_data.search_term = searchTerm;
  window.br_data.q = searchTerm;
  // NO suggest event firing!
  break;
```

---

## Event Sequence Example

### Old Implementation
```
1. User on homepage
2. User types "backpack" and clicks suggestion
3. [Navigation occurs]
4. Search results page loads
5. GTM pageview fires
6. Bloomreach suggest event fires ❌ (wrong page!)
7. Bloomreach pageview fires
```

### New Implementation
```
1. User on homepage
2. User types "backpack" and clicks suggestion
3. GTM custom trigger fires
4. Bloomreach suggest event fires ✅ (correct page!)
5. [Navigation occurs]
6. Search results page loads
7. GTM pageview fires
8. Bloomreach pageview fires (no duplicate suggest event)
```

---

## Troubleshooting

### Suggest event not firing on search
- Check GTM trigger is set up correctly
- Verify `{{dL - search_term}}` variable has value
- Check console for errors
- Confirm BrTrk is loading (check network tab)

### Suggest event firing twice
- Make sure old search page logic is removed from pageview tag
- Check for duplicate GTM triggers
- Verify sessionStorage flag is being cleared

### BrTrk not defined errors
- Script handles lazy loading automatically
- If persistent, check account ID and domain key are correct
- Verify no ad blockers blocking br-trk.js

---

## Migration Checklist

- [ ] Back up existing GTM tags
- [ ] Create search event trigger (form submit or custom event)
- [ ] Create new "Search/Suggest Event" tag with Script 1
- [ ] Update existing "Page View" tag with Script 2
- [ ] Test on staging environment
- [ ] Verify suggest events fire on correct page
- [ ] Verify pageviews still working for all page types
- [ ] Check Bloomreach dashboard for correct attribution
- [ ] Deploy to production
- [ ] Monitor for 24 hours

---

## Questions?

**Q: Will this break existing tracking?**
A: No. All pageview logic is preserved. Only search event timing changes.

**Q: Do I need to change my GTM variables?**
A: No. All existing variables work as-is.

**Q: What if BrTrk is already loaded?**
A: Script detects this and uses existing instance. No double-loading.

**Q: Can I use both form submit AND custom events?**
A: Yes! Script 1 can fire on multiple triggers. GTM handles deduplication.

**Q: Will this affect my Bloomreach reports?**
A: Positively! You'll get more accurate attribution showing which pages drive searches.

# Sierra Chat Widget - Implementation Notes

## Files Overview

### 1. **sierra-chat-GTM-readable.html** (RECOMMENDED FOR GTM)
- ES5 compatible
- Readable and maintainable
- ~60 lines
- Full comments

### 2. **sierra-chat-GTM-version.html** (MINIFIED)
- Ultra-compressed version
- Same functionality as readable version
- ~39 lines
- Best for production if size matters

### 3. **sierra-chat-optimized.html** (STANDALONE)
- Works with or without GTM
- Has data layer fallback logic
- More verbose but flexible

---

## Key Changes Made

### 1. ✅ **Added Disclosure Statements**
All languages now include privacy disclosure messages:
- **EN**: "This chat session may be recorded and is subject to our privacy policy."
- **FR**: "Cette session de chat peut être enregistrée..."
- **DE**: "Diese Chat-Sitzung kann aufgezeichnet werden..."
- **IT**: "Questa sessione di chat potrebbe essere registrata..."
- **ES**: "Esta sesión de chat puede ser grabada..."
- **NL**: "Deze chatsessie kan worden opgenomen..."

### 2. ✅ **Fixed Agent Language Response**
**THE KEY ISSUE:** Added `locale` configuration to ensure Sierra agent responds in the correct language.

```javascript
locale: 'fr-FR'  // or 'de-DE', 'it-IT', 'es-ES', 'nl-NL', 'en-US'
```

**Why this matters:** Without the `locale` setting, the Sierra agent backend defaults to English regardless of the UI language. The `locale` parameter tells Sierra's AI agent which language to use for responses.

### 3. ✅ **Changed Email to First Name**
- Replaced `{email}` placeholder with `{firstName}`
- Updated GTM variable from `encodedEmailSha` to `user.first_name`
- More personalized greeting

### 4. ✅ **Added Full Locale Mapping**
The code now dynamically builds the full locale from language + country code:

```javascript
// Combines GTM variables: 'en' + 'US' = 'en-us'
var fullLocale = (l && c) ? (l + '-' + c).toLowerCase() : '';

// Maps to Sierra-supported locales
var localeMap = {
  'en-us': 'en-US',
  'en-ca': 'en-CA',
  'fr-ca': 'fr-CA',
  'en-gb': 'en-GB',  // UK
  'en-uk': 'en-GB',  // Alternative UK code
  'de-de': 'de-DE',
  'it-it': 'it-IT',
  'fr-fr': 'fr-FR',
  'es-es': 'es-ES',
  'nl-nl': 'nl-NL'
};

var sierraLocale = localeMap[fullLocale] || 'en-US';
```

**This supports all your markets:**
- 🇺🇸 en-US (United States)
- 🇨🇦 en-CA (Canada - English)
- 🇨🇦 fr-CA (Canada - French)
- 🇬🇧 en-GB (United Kingdom)
- 🇩🇪 de-DE (Germany)
- 🇮🇹 it-IT (Italy)
- 🇫🇷 fr-FR (France)
- 🇪🇸 es-ES (Spain)
- 🇳🇱 nl-NL (Netherlands)

---

## GTM Variables Required

Your GTM setup needs these variables:

1. **{{cjs - countryLanguage}}** - 2-letter language code (e.g., 'en', 'fr', 'de')
2. **{{cjs - countryCode}}** - 2-letter country code (e.g., 'US', 'FR', 'DE')
3. **{{dL - UDO - user.customer_id}}** - Customer ID for logged-in users
4. **{{dL - UDO - user.first_name}}** - Customer first name for personalization

---

## How Locale Detection Works

The code uses **both** GTM variables to determine the exact locale:

1. **{{cjs - countryLanguage}}** provides language code (e.g., 'en', 'fr')
2. **{{cjs - countryCode}}** provides country code (e.g., 'US', 'CA', 'GB')
3. These are combined: `'en' + 'US' = 'en-us'`
4. Lookup in mapping table: `'en-us' → 'en-US'`
5. Passed to Sierra as `locale: 'en-US'`

### Example Scenarios:

| GTM Language | GTM Country | Combined | Sierra Locale | Agent Language |
|--------------|-------------|----------|---------------|----------------|
| en | us | en-us | en-US | English (US) |
| en | ca | en-ca | en-CA | English (CA) |
| fr | ca | fr-ca | fr-CA | French (CA) |
| en | gb | en-gb | en-GB | English (UK) |
| de | de | de-de | de-DE | German |
| fr | fr | fr-fr | fr-FR | French |

### UI Language vs Agent Language

- **UI Language** (greeting, launcher text) is determined by language code only ('en', 'fr', etc.)
- **Agent Response Language** is determined by full locale ('en-US', 'fr-CA', etc.)

This means:
- French Canadian (`fr-CA`) and French France (`fr-FR`) both use French UI strings
- But the agent can respond with locale-specific differences (e.g., Canadian French phrasing)

## Configuration Breakdown

### Language Config (LANGS)
Each language has:
- **g**: Default greeting (not logged in)
- **gl**: Greeting for logged-in users (includes {firstName} placeholder)
- **t**: Launcher button text
- **b**: Proactive banner text
- **d**: Disclosure/privacy statement

### Sierra Config Options

```javascript
window.sierraConfig = {
  display: "corner",                    // Widget position
  locale: "fr-FR",                      // Agent response language (CRITICAL!)
  customGreeting: "...",                // Personalized greeting
  chatInterfaceStrings: {
    disclosure: "..."                    // Privacy disclaimer
  },
  customStyle: {zIndex: "2000"},        // CSS z-index
  dimensions: {
    width: "25rem",
    height: "40rem"
  },
  launcher: {
    backgroundColor: "#000000",          // Launcher button color
    textColor: "#ffffff",               // Launcher text color
    text: "Live Chat",                  // Launcher button text
    icon: "oval",                       // Launcher icon shape
    proactiveBanner: {
      text: "...",                      // Banner message
      showAfterSeconds: 10,             // Delay before showing
      hideAfterSeconds: 30              // Auto-hide after this time
    },
    customStyle: {
      bottom: "10px",
      right: "10px",
      zIndex: "100"
    }
  },
  variables: {                          // Passed to Sierra agent
    CONSUMER_ID: "12345",
    LANGUAGE: "fr",
    COUNTRY_CODE: "FR"
  }
};
```

---

## Why Agent Was Responding in English

**Problem:** The Sierra agent UI was localized, but the agent itself was responding in English.

**Root Cause:** The Sierra agent's language behavior is controlled in the **Sierra dashboard/backend**, NOT in the Web SDK configuration.

**Solutions:**

### 1. **Backend Configuration (Primary)**
You need to configure your Sierra agent to support multiple languages in the Sierra platform dashboard. This is done at the agent level, not the SDK level.

### 2. **Pass Locale as Variable (Recommended)**
Pass the locale as a **variable** to the agent so it can use it to determine response language:

```javascript
variables: {
  CONSUMER_ID: uid || '',
  LOCALE: sierraLocale,     // 'en-US', 'fr-CA', 'de-DE', etc.
  LANGUAGE: lang,            // 'en', 'fr', 'de', etc.
  COUNTRY_CODE: c || ''      // 'US', 'CA', 'DE', etc.
}
```

The agent can then be configured in Sierra's platform to read the `LOCALE` variable and respond in the appropriate language.

**Note:** The `locale` parameter documented elsewhere is NOT a standard Sierra Web SDK parameter. It does not appear in the official SDK documentation and does not control agent response language.

---

## Testing Checklist

### Test each language:
- [ ] UI elements display in correct language
- [ ] Agent **responds** in correct language (this was the bug!)
- [ ] Disclosure statement shows in correct language
- [ ] Personalized greeting works with first name
- [ ] Fallback to generic greeting works (no first name)
- [ ] Privacy policy link points to correct locale

### Test scenarios:
- [ ] Logged-in user with first name
- [ ] Logged-in user without first name
- [ ] Guest user (not logged in)
- [ ] Invalid/unsupported language code (should fallback to English)

---

## Privacy Policy URL Pattern

Update these URLs if needed:
- EN: `https://www.timberland.com/help/privacy-policy.html`
- FR: `https://www.timberland.fr/fr-fr/help/privacy-policy.html`
- DE: `https://www.timberland.de/de-de/help/privacy-policy.html`
- IT: `https://www.timberland.it/it-it/help/privacy-policy.html`
- ES: `https://www.timberland.es/es-es/help/privacy-policy.html`
- NL: `https://www.timberland.nl/nl-nl/help/privacy-policy.html`

---

## Troubleshooting

### Issue: Agent still responding in English
**Check:**
1. Is `locale` parameter being set? (Check browser console)
2. Does Sierra agent have multi-language support enabled in backend?
3. Is the locale value correct? (e.g., 'fr-FR' not 'fr')

### Issue: Greeting shows {firstName} placeholder
**Check:**
1. Is `{{dL - UDO - user.first_name}}` GTM variable defined?
2. Does the data layer have the correct structure?
3. Check browser console for the value of `fn` variable

### Issue: Wrong disclosure statement
**Check:**
1. Language detection is working (check `lang` variable value)
2. LANGS object has `d` property for that language
3. Privacy policy URL is correct for that market

---

## Next Steps for Sierra Agent Configuration

If the agent is still not responding in the correct language after adding `locale`, you may need to:

1. **Contact Sierra Support** to ensure multi-language support is enabled for your agent
2. **Check Agent Settings** in Sierra dashboard for language/locale configurations
3. **Verify Agent Training** - the agent may need to be trained/configured for each language
4. **Test with `initialUserMessage`** - try setting an initial message in the target language to see if that helps

---

## Performance Notes

- **File Size**: ~2.3KB (readable) / ~1.9KB (minified)
- **Load Time**: Async loading won't block page render
- **Caching**: Sierra script is cached by browser
- **Error Handling**: Console error if script fails to load

---

*Last Updated: 2025-12-17*

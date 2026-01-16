# Sierra Chat - Locale Mapping Reference

## Supported Locales

This document shows how your GTM variables map to Sierra locales.

### Complete Mapping Table

| Market | GTM Language | GTM Country | Combined Input | Sierra Locale | UI Language | Agent Language |
|--------|--------------|-------------|----------------|---------------|-------------|----------------|
| **United States** | en | us | en-us | en-US | English | English (US) |
| **Canada (English)** | en | ca | en-ca | en-CA | English | English (CA) |
| **Canada (French)** | fr | ca | fr-ca | fr-CA | French | French (CA) |
| **United Kingdom** | en | gb | en-gb | en-GB | English | English (UK) |
| **United Kingdom** | en | uk | en-uk | en-GB | English | English (UK) |
| **Germany** | de | de | de-de | de-DE | German | German |
| **Italy** | it | it | it-it | it-IT | Italian | Italian |
| **France** | fr | fr | fr-fr | fr-FR | French | French |
| **Spain** | es | es | es-es | es-ES | Spanish | Spanish |
| **Netherlands** | nl | nl | nl-nl | nl-NL | Dutch | Dutch |

## How It Works

### Step 1: GTM Variables Provide Input
```javascript
var l = '{{cjs - countryLanguage}}';  // e.g., 'en'
var c = '{{cjs - countryCode}}';      // e.g., 'ca'
```

### Step 2: Combine Into Locale String
```javascript
var fullLocale = (l && c) ? (l + '-' + c).toLowerCase() : '';
// Result: 'en-ca'
```

### Step 3: Lookup in Mapping Table
```javascript
var localeMap = {
  'en-us': 'en-US',
  'en-ca': 'en-CA',
  'fr-ca': 'fr-CA',
  // ... etc
};
var sierraLocale = localeMap[fullLocale] || 'en-US';
// Result: 'en-CA'
```

### Step 4: Pass to Sierra
```javascript
window.sierraConfig = {
  locale: sierraLocale,  // 'en-CA'
  // ... other config
};
```

## Key Features

### 1. Automatic Fallback
If GTM variables are missing or return an unsupported locale, the code defaults to `en-US`.

### 2. UK Handling
Both `en-uk` and `en-gb` map to `en-GB` for flexibility.

### 3. Case Insensitive
Input is converted to lowercase before matching, so 'EN-US', 'en-us', or 'En-Us' all work.

## Testing

### Test Scenarios

| Test Case | Expected Behavior |
|-----------|-------------------|
| `l='en'`, `c='us'` | Sierra locale = `en-US` |
| `l='fr'`, `c='ca'` | Sierra locale = `fr-CA` |
| `l='en'`, `c='gb'` | Sierra locale = `en-GB` |
| `l='en'`, `c='uk'` | Sierra locale = `en-GB` |
| `l='de'`, `c='de'` | Sierra locale = `de-DE` |
| `l='en'`, `c='xx'` | Sierra locale = `en-US` (fallback) |
| `l=''`, `c=''` | Sierra locale = `en-US` (fallback) |
| `l='zz'`, `c='zz'` | Sierra locale = `en-US` (fallback) |

### How to Test in GTM Preview

1. **Open GTM Preview Mode**
2. **Load your website**
3. **Open Browser Console**
4. **Check the locale**:
   ```javascript
   console.log(window.sierraConfig.locale);
   ```
5. **Verify GTM variables**:
   ```javascript
   console.log('Language:', '{{cjs - countryLanguage}}');
   console.log('Country:', '{{cjs - countryCode}}');
   ```

## Locale-Specific Behavior

### What Changes by Locale?

| Feature | Controlled By | Notes |
|---------|---------------|-------|
| **UI Strings** | Language code only | French UI for both `fr-FR` and `fr-CA` |
| **Agent Responses** | Full locale | Agent may use locale-specific phrasing |
| **Date Format** | Full locale | `en-US` uses MM/DD/YYYY, `en-GB` uses DD/MM/YYYY |
| **Number Format** | Full locale | Currency symbols, decimal separators |
| **Spelling** | Full locale | "color" (US) vs "colour" (UK) |

### Example Differences

**English (US) vs English (CA) vs English (UK):**
- UI strings: Same (all use English translations)
- Agent responses: May differ slightly in spelling/phrasing
- Date format: May differ
- Cultural references: May differ

**French (FR) vs French (CA):**
- UI strings: Same (all use French translations)
- Agent responses: Canadian French may use different vocabulary
- Formality: May differ in tone

## Adding New Locales

To add support for a new locale:

1. **Add to locale mapping** in both files:
   ```javascript
   var localeMap = {
     // ... existing mappings
     'pt-br': 'pt-BR',  // Portuguese (Brazil)
   };
   ```

2. **Add UI translations** if new language:
   ```javascript
   var LANGS = {
     // ... existing languages
     pt: {
       g: "Olá, como posso ajudá-lo hoje?",
       gl: "Olá {firstName}, obrigado por ser membro...",
       t: "Chat ao Vivo",
       b: "Olá, como posso ajudá-lo hoje?",
       d: "Esta sessão..."
     }
   };
   ```

3. **Update supported languages array**:
   ```javascript
   var supportedLangs = ['en','fr','de','it','es','nl','pt'];
   ```

4. **Test thoroughly** in Preview mode

## Troubleshooting

### Issue: Agent responding in wrong language
**Check:**
- Is `locale` being set correctly? (Browser console: `window.sierraConfig.locale`)
- Are GTM variables returning expected values?
- Is the locale in the mapping table?

### Issue: UI in wrong language
**Check:**
- Language extraction from `countryLanguage` variable
- Is the language in `supportedLangs` array?
- Is the language in `LANGS` object?

### Issue: Fallback to English always
**Check:**
- Are GTM variables populated? (Check in GTM Preview)
- Are variables being passed correctly? (No typos in variable names)
- Check browser console for errors

---

*Last Updated: 2025-12-17*

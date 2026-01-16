# Sierra Chat - Agent Language Troubleshooting

## Problem: Agent Responds in English Despite Locale Configuration

### Root Cause
**The Sierra Web SDK does NOT control agent response language.** The SDK only controls the UI language (launcher text, greetings, etc.).

Agent response language is configured in the **Sierra backend/dashboard**, not in your JavaScript code.

---

## Solution Steps

### ✅ Step 1: Verify Your Code is Passing the Locale
Check that your variables are being passed correctly:

```javascript
// Open browser console and check:
console.log(window.sierraConfig.variables);

// Should show:
{
  CONSUMER_ID: "12345",
  LOCALE: "fr-FR",      // This is key!
  LANGUAGE: "fr",
  COUNTRY_CODE: "FR"
}
```

### ✅ Step 2: Contact Sierra Support
**This is the critical step!** You need to ask Sierra to:

1. **Enable multi-language support** for your agent
2. **Configure the agent** to read the `LOCALE` variable
3. **Train/configure the agent** for each language (FR, DE, IT, ES, NL, etc.)

**Contact Information:**
- Email: support@sierra.ai (or your account manager)
- In your request, include:
  - Your agent token: `mS6nPAgBlE21KNq6Ntoxx_ftrix3K0nhCHY`
  - Languages you need: EN, FR, DE, IT, ES, NL
  - That you're passing `LOCALE` variable from the SDK

### ✅ Step 3: Configure Agent Logic
Sierra's platform needs to be configured so that when the agent receives the `LOCALE` variable, it:

1. Understands the user's language preference
2. Generates responses in that language
3. Uses locale-specific formatting

This is done through Sierra's agent configuration interface or agent code, NOT through the Web SDK.

---

## What the Web SDK Controls

### ✅ Web SDK Controls (Your Code):
- Launcher button text
- Custom greetings
- Proactive banner text
- Disclosure statements
- Chat UI strings

### ❌ Web SDK Does NOT Control:
- Agent AI responses
- Agent understanding of user queries
- Agent's response language
- Agent's knowledge base language

---

## Verification Checklist

### Test in Browser Console:

```javascript
// 1. Check config was set
console.log(window.sierraConfig);

// 2. Check variables being passed
console.log(window.sierraConfig.variables);
// Should show: {CONSUMER_ID: "...", LOCALE: "fr-FR", LANGUAGE: "fr", COUNTRY_CODE: "FR"}

// 3. Verify GTM variables (before Sierra loads)
console.log('Language:', '{{cjs - countryLanguage}}');
console.log('Country:', '{{cjs - countryCode}}');
```

### Expected Results:

| GTM Lang | GTM Country | Passed LOCALE | UI Language | Agent Language |
|----------|-------------|---------------|-------------|----------------|
| en | us | en-US | ✅ English | ⚠️ Needs Sierra config |
| fr | fr | fr-FR | ✅ French | ⚠️ Needs Sierra config |
| de | de | de-DE | ✅ German | ⚠️ Needs Sierra config |

---

## Why This Happens

### Architecture Understanding:

```
┌─────────────────────────────────────────────────────────┐
│ Your Website                                             │
│  ├─ GTM provides: language='fr', country='FR'            │
│  └─ Your Code creates: LOCALE='fr-FR'                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Sierra Web SDK (JavaScript)                              │
│  ├─ Controls: UI strings (✅ works)                      │
│  ├─ Passes: variables={LOCALE:'fr-FR'}                   │
│  └─ Does NOT control: Agent AI responses                 │
└─────────────────┬───────────────────────────────────────┘
                  │ Variables passed via API
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Sierra Backend (AI Agent)                                │
│  ├─ Receives: LOCALE variable                            │
│  ├─ Needs Configuration: How to use LOCALE               │
│  └─ Must be trained: For multiple languages              │
└─────────────────────────────────────────────────────────┘
```

---

## What to Tell Sierra Support

### Email Template:

```
Subject: Multi-Language Support Request for Agent [Your Agent Token]

Hi Sierra Team,

We're implementing your chat widget with multi-language support across 9 locales:
- en-US (United States)
- en-CA (Canada - English)
- fr-CA (Canada - French)
- en-GB (United Kingdom)
- de-DE (Germany)
- it-IT (Italy)
- fr-FR (France)
- es-ES (Spain)
- nl-NL (Netherlands)

Our implementation:
- Agent Token: mS6nPAgBlE2009YBlE21KNq6Ntoxx_ftrix3K0nhCHY
- We're passing the locale via the `LOCALE` variable in sierraConfig.variables
- UI is properly localized (working ✅)
- Agent responses are in English regardless of LOCALE variable (not working ❌)

Questions:
1. How do we configure the agent to respond in the language specified by the LOCALE variable?
2. Does the agent need to be trained for each language?
3. Is there additional configuration required in the Sierra dashboard?
4. Are there any agent code changes needed to read the LOCALE variable?

Current test results:
- LOCALE='fr-FR' → Agent responds in English (expected: French)
- LOCALE='de-DE' → Agent responds in English (expected: German)

Please advise on next steps to enable multi-language agent responses.

Thank you!
```

---

## Alternative Solutions

### Option A: Language-Specific Agents (Not Recommended)
Create separate agents for each language:
- Agent_EN for English
- Agent_FR for French
- Agent_DE for German
- etc.

Then load the appropriate agent based on locale. **This is NOT recommended** as it's harder to maintain.

### Option B: Use initialUserMessage (Workaround)
As a temporary workaround, you could set an initial hidden message:

```javascript
initialUserMessage: "Please respond to me in French" // for fr-FR locale
```

But this is **not a proper solution** and should only be used temporarily.

---

## Expected Timeline

Once Sierra configures your agent for multi-language:
1. ✅ Immediate: UI strings work (already done)
2. ⏱️ 1-2 weeks: Sierra configures agent backend
3. ⏱️ Additional time: Agent training/testing per language

---

## Debug Mode

Add this to your code temporarily to verify what's being passed:

```javascript
// Add AFTER window.sierraConfig is set
console.group('Sierra Chat Debug');
console.log('Full Config:', window.sierraConfig);
console.log('Locale being passed:', window.sierraConfig.variables.LOCALE);
console.log('Language code:', window.sierraConfig.variables.LANGUAGE);
console.log('Country code:', window.sierraConfig.variables.COUNTRY_CODE);
console.log('UI Language (greeting):', window.sierraConfig.customGreeting);
console.groupEnd();
```

---

*Last Updated: 2025-12-17*

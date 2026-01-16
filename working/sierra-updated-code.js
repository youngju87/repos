<script>
(function() {
  // Language configs: g=greeting (not logged in), gl=greetingLoggedIn, t=launcherText, b=proactiveBannerText, d=disclosure
  var LANGS = {
    en: {
      g: "Hi, what can I help you with today?",
      gl: "Hi {firstName}, thank you for being a nature.rewards member. What can I help you with today?",
      t: "Live Chat",
      b: "Hi, what can I help you with today?",
      d: {
        US: "This chat session may be recorded and is subject to our [privacy policy](https://na.icebreaker.com/en-us/pages/privacy-policy).",
        CA: "This chat session may be recorded and is subject to our [privacy policy](https://na.icebreaker.com/en-ca/pages/privacy-policy).",
        default: "This chat session may be recorded and is subject to our [privacy policy](https://na.icebreaker.com/{lang-country}/pages/privacy-policy)."
      }
    },
    fr: {
      g: "Bonjour, que puis-je faire pour vous aujourd'hui ?",
      gl: "Bonjour {firstName}, merci d'être membre nature.rewards. Comment puis-je vous aider aujourd'hui?",
      t: "Chat en Direct",
      b: "Bonjour, comment puis-je vous aider aujourd'hui?",
      d: {
        CA: "Cette session de chat peut être enregistrée et est soumise à notre [politique de confidentialité](https://na.icebreaker.com/fr-ca/pages/privacy-policy).",
        FR: "Cette session de chat peut être enregistrée et est soumise à notre [politique de confidentialité](https://eu.icebreaker.com/fr-fr/pages/privacy-policy-complete).",
        default: "Cette session de chat peut être enregistrée et est soumise à notre [politique de confidentialité](https://eu.icebreaker.com/{lang-country}/pages/privacy-policy-complete)."
      }
    },
    de: {
      g: "Hallo, womit kann ich dir heute helfen?",
      gl: "Hallo {firstName}, danke, dass du nature.rewards Mitglied bist. Wie kann ich dir heute helfen?",
      t: "Live-Chat",
      b: "Hallo, wie kann ich Ihnen heute helfen?",
      d: "Diese Chatsitzung kann aufgezeichnet werden und unterliegt unseren [Datenschutzerklärung](https://eu.icebreaker.com/{lang-country}/pages/privacy-policy-complete)."
    },
    it: {
      g: "Salve, in cosa posso aiutarla oggi?",
      gl: "Ciao {firstName}, grazie per essere un nature.rewards member. Come posso aiutarti oggi?",
      t: "Chat dal Vivo",
      b: "Ciao, come posso aiutarti oggi?",
      d: "Questa sessione di chat potrebbe essere registrata ed è soggetta alla nostra [politica sulla privacy](https://eu.icebreaker.com/{lang-country}/pages/privacy-policy-complete)."
    },
    es: {
      g: "Hola, ¿En qué puedo ayudarte hoy?",
      gl: "Hola {firstName}, gracias por ser miembro de nature.rewards. ¿En qué puedo ayudarte hoy?",
      t: "Chat en Vivo",
      b: "Hola, ¿en qué puedo ayudarte hoy?",
      d: "Esta sesión de chat puede ser grabada y está sujeta a nuestra [política de privacidad](https://eu.icebreaker.com/{lang-country}/pages/privacy-policy-complete)."
    },
    nl: {
      g: "Hoi, waarmee kan ik je vandaag helpen?",
      gl: "Hey {firstName}, bedankt dat je lid bent van nature.rewards. Hoe kan ik je vandaag helpen?",
      t: "Live Chat",
      b: "Hallo, waarmee kan ik je vandaag helpen?",
      d: "Deze chatsessie kan worden opgenomen en valt onder ons [privacybeleid](https://eu.icebreaker.com/{lang-country}/pages/privacy-policy-complete)."
    }
  };

  // Variables
  var l = '{{dL - PDO - page.countryLanguage}}';
  var c = '{{dL - PDO - page.countryCode}}';
  var uid = '{{dL - UDO - user.customer_id}}';
  var fn = '{{dL - UDO - user.firstName}}';
  var b = 'icebreaker';

  // Config: launcherText
  var showLauncherText = false;

  // Full locale from language + country
  var fullLocale = (l && c) ? (l + '-' + c).toLowerCase() : '';

  // Sierra-supported locales
  var localeMap = {
    'en-us': 'en-US',
    'en-ca': 'en-CA',
    'fr-ca': 'fr-CA',
    'en-gb': 'en-GB',  // UK locale
    'en-uk': 'en-GB',  // Alternative UK code
    'de-de': 'de-DE',
    'it-it': 'it-IT',
    'fr-fr': 'fr-FR',
    'es-es': 'es-ES',
    'nl-nl': 'nl-NL'
  };

  // Get Sierra locale or fallback
  var sierraLocale = localeMap[fullLocale] || 'en-US';

  // Extract base language for UI strings
  var rawLang = (l || document.documentElement.lang || navigator.language || 'en').split('-')[0].toLowerCase();
  var supportedLangs = ['en','fr','de','it','es','nl'];
  var lang = supportedLangs.indexOf(rawLang) > -1 ? rawLang : 'en';
  var cfg = LANGS[lang];

  // Helper: Check if GTM variable resolved
  function isResolved(val) {
    if (!val || typeof val !== 'string') return false;
    var trimmed = val.trim();
    var openBrace = String.fromCharCode(123, 123);
    var closeBrace = String.fromCharCode(125, 125);
    var invalidValues = ['null', 'undefined', 'false', ''];
    return trimmed !== '' &&
           trimmed.indexOf(openBrace) === -1 &&
           trimmed.indexOf(closeBrace) === -1 &&
           invalidValues.indexOf(trimmed.toLowerCase()) === -1;
  }

  // Determine user state
  var isLoggedIn = isResolved(uid) && isResolved(fn);

  // Helper: Get greeting based on user state
  function getGreeting() {
    if (!isLoggedIn) {
      // Not logged in
      return cfg.g;
    } else {
      // Logged in
      return cfg.gl.replace("{firstName}", fn);
    }
  }

  var greeting = getGreeting();

  // Helper: Get disclosure
  var disclosure;
  if (typeof cfg.d === 'object' && !Array.isArray(cfg.d)) {
    disclosure = cfg.d[c] || cfg.d.default || '';
  } else {
    disclosure = cfg.d || '';
  }
  disclosure = disclosure.replace('{lang-country}', fullLocale || 'en-us');

  // Config: Sierra
  window.sierraConfig = {
    display: "corner",
    customGreeting: greeting,
    chatInterfaceStrings: {
      disclosure: disclosure
    },
    customStyle: {zIndex: "2000"},
    dimensions: {width: "25rem", height: "40rem", maxHeight: "calc(100% - 9rem)"},
    launcher: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      text: showLauncherText ? cfg.t : '',
      icon: "oval",
      // proactiveBanner: {text: cfg.b, showAfterSeconds: 10, hideAfterSeconds: 30},
      customStyle: {bottom: "10px", right: "10px", zIndex: "100"}
    },
    variables: {
      brand: b,
      consumerId: isResolved(uid) ? uid : '',
      locale: sierraLocale.toLowerCase(),
      language: lang,
      country_code: c || ''
    }
  };

  // Script Library
  var s = document.createElement('script');
  s.type = 'module';
  s.src = '{{RegEx - Sierra Ai - Embed ID}}';
  s.async = true;
  s.onerror = function() {
    console.error('Failed to load Sierra chat widget');
  };
  document.head.appendChild(s);
})();
</script>

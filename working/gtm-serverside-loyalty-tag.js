/**
 * GTM Server-Side Tag Template
 * This runs on your GTM Server-Side container and makes the API call without CORS issues
 *
 * Setup:
 * 1. Create a new tag template in GTM Server-Side
 * 2. Paste this code into the template
 * 3. Configure the tag to trigger on customer login/page view
 */

const sendHttpRequest = require('sendHttpRequest');
const setCookie = require('setCookie');
const JSON = require('JSON');
const getEventData = require('getEventData');
const logToConsole = require('logToConsole');
const generateRandom = require('generateRandom');

// Get customer data from the event
const customerId = getEventData('customer_id');
const customerEmail = getEventData('customer_email');

if (!customerId) {
  logToConsole('No customer ID available');
  data.gtmOnSuccess();
  return;
}

// Generate UUID v4
function generateUUID() {
  const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return pattern.replace(/[xy]/g, function(c) {
    const r = generateRandom(0, 15);
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// VFC API Configuration
const clientId = 'd75d7b376d6e4881a7c7d8d0161ee734';
const clientSecret = 'f5B15dDdb5D446f9b1591E4812635361';

// Build API URL
const apiUrl = 'https://preprod.xapi.vfc.com/data/v2/consumer/' +
               customerId +
               '?includeLoyaltySummary=true';

// API Request Options
const requestOptions = {
  method: 'GET',
  headers: {
    'x-transaction-id': generateUUID(),
    'channel': 'ECOMM',
    'siteid': 'IB-US',
    'source': 'ECOM15',
    'region': 'NORA',
    'brand': 'IB',
    'locale': 'en_US',
    'client_id': clientId,
    'client_secret': clientSecret,
    'x-usid': generateUUID()
  }
};

logToConsole('Fetching loyalty data for customer:', customerId);

// Make API request
sendHttpRequest(apiUrl, requestOptions, (statusCode, headers, body) => {
  if (statusCode >= 200 && statusCode < 300) {
    const responseData = JSON.parse(body);

    logToConsole('Loyalty API Response:', responseData);

    if (responseData && responseData.opt_in && responseData.vip_tier_name) {
      // Set cookies (30 days = 2592000 seconds)
      const cookieOptions = {
        domain: 'auto',
        path: '/',
        'max-age': 2592000,
        secure: true,
        httpOnly: false,
        sameSite: 'Lax'
      };

      setCookie('loyalty_member', 'true', cookieOptions);
      setCookie('loyalty_tier', responseData.vip_tier_name, cookieOptions);
      setCookie('loyalty_points', responseData.points_balance.toString(), cookieOptions);

      logToConsole('Loyalty cookies set successfully:', {
        member: true,
        tier: responseData.vip_tier_name,
        points: responseData.points_balance
      });
    } else {
      // Not a loyalty member
      const cookieOptions = {
        domain: 'auto',
        path: '/',
        'max-age': 2592000,
        secure: true,
        httpOnly: false,
        sameSite: 'Lax'
      };

      setCookie('loyalty_member', 'false', cookieOptions);
      setCookie('loyalty_tier', 'None', cookieOptions);

      logToConsole('Customer is not a loyalty member');
    }

    data.gtmOnSuccess();
  } else {
    logToConsole('API request failed with status:', statusCode);
    logToConsole('Response:', body);

    // Set default values on error
    const cookieOptions = {
      domain: 'auto',
      path: '/',
      'max-age': 2592000,
      secure: true,
      httpOnly: false,
      sameSite: 'Lax'
    };

    setCookie('loyalty_member', 'false', cookieOptions);
    setCookie('loyalty_tier', 'None', cookieOptions);

    data.gtmOnFailure();
  }
});

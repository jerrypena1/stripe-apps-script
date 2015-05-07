// IFRAME mode required
function doGet() {
  return HtmlService.createHtmlOutputFromFile('HTML')
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Read Stripe token passed from google.script.run instead of
 * using a form POST request - which can't happen in HtmlService.
 *
 * @param {Object} token from checkout.js
 * @return {number} HTTP Response code 
 */
function processCharge(token) { 
    
    var tokenId = token.id;
    var stripeEmail =  token.email;
    
    // Create a Customer ( optional )
    var path = "/customers";
    var customer = Stripe_PostRequest(path, [], [], {
      "description": "test customer", 
      "source": tokenId,
      "email": stripeEmail
    });
    
    var custId = JSON.parse( customer.getContentText() ).id;
    
    // Create a Charge
    path = "/charges";
    var charge = Stripe_PostRequest(path, [], [], {
       "currency": "usd", 
       "amount": "500",
       "customer": custId
    });
    
    return charge.getResponseCode();
}

/**
 * Generic function for making a POST request to the Stripe API.
 * Provided by Stripe support
 *
 * @param {string} path
 * @param {Object} parameters 
 * @return {HTTPResponse} 
 */
var Stripe_PostRequest = function(path, fields, expandableFields, parameters) {
  // Expand related fields when accessing sub-properties
  // (e.g. `customer.email` should expand the customer
  // object when retrieving a charge).
  if (expandableFields !== undefined) {
    parameters["expand[]"] = [];
    fields.forEach(function(field) {
      field = field.split(".")[0];
      if (expandableFields.indexOf(field) !== -1) {
        parameters["expand[]"].push("data." + field);
      }
    });
  }
  
  var scriptProperties = PropertiesService.getScriptProperties();
  var secret = scriptProperties.getProperty('testSecret');
  
  var options = {
    "method" : "post",
    "headers": {
      "Authorization": "Bearer " + secret,
      "User-Agent": "Stripe Example/0.1"
    }
  };
  var url = "https://api.stripe.com/v1" + path + serializeQueryString(parameters);
  return UrlFetchApp.fetch(url, options); 
}

/**
 * Serialize a dictionary to a query string for GET requests
 */
var serializeQueryString = function(parameters) {
  var str = [];
  for (var key in parameters) {
    var value = parameters[key];
    if (parameters.hasOwnProperty(key) && value) {
      if (value.map) {
        str.push(value.map(function(array_value) {
          return key + "=" + encodeURIComponent(array_value);
        }).join("&"));
      } else {
        str.push(key + "=" + encodeURIComponent(value));
      }
    }
  }
  return '?' + str.join("&");
}

  
  

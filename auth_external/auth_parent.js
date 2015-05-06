/**
 * SETUP
 * 
 * In the following, we define the URL where we will obtain authentication
 * tokens. More informations about how the server side works is available here:
 * https://docs.sightcall.com/GD/04_backend/02_ServerSDK.html
 * 
 * If you are using our server-SDK, use the following URL 
 * and replace the placeholder YOUR_AUTH_URL
 * 
 * For Java, Ruby or Node.js:
 * var AUTH_URL = 'YOUR_AUTH_URL/gettoken?uid=';
 * 
 * For PHP:
 * var AUTH_URL = 'YOUR_AUTH_URL/gettoken.php?uid=';
 *
 * Otherwise, you are free on the AUTH_URL format.
 */
var AUTH_URL = 'INSERT AUTH URL HERE';


//Insert here the application identifier you received from SightCall.
//See here how to find it: https://docs.sightcall.com/GD/01_javascript/Tutorials/01_js_authentication.html
var APP_IDENTIFIER = 'YOUR_APP_IDENTIFIER';

// Define the optional parameters
var rtccOptions = {
  debugLevel: 3
};

/**
 * AUTHENTICATION
 *
 * In this part, we manage the authentication process. First we create an instance of the
 * API, then we define the callbacks related to the authentication events.
 *
 * Detailed tutorial available here:
 * https://docs.sightcall.com/GD/01_javascript/Tutorials/01_js_authentication.html
 */

//Creates the rtcc object with the given options
var rtcc = new Rtcc(APP_IDENTIFIER, undefined, 'internal', rtccOptions);
var storedDisplayName = '';

//Creates the rtcc object and define the callbacks to the events of the API
var bindAuthCallbacks = function(rtcc, user_id) {
  //log each event
  rtcc.onAll(function() {
    if (window.console) {
      console.log('Rtcc: event "' + this.eventName + '"" with arguments: ' + JSON.stringify(arguments));
    }
  })

  //what to do when we are ready to make calls


  rtcc.on('cloud.sip.ok', function() {
    $('#connecting').css('display', 'none');
    $('#stat').text('You are now connected in mode: ' + rtcc.getConnectionMode());
    rtcc.setDisplayName(storedDisplayName)
  })

  //what to do when we are connected when we are connected with another user id
  //in plugin or driver mode
  rtcc.on('cloud.loggedasotheruser', function() {
    // force connection, kick other logged users
    getToken(user_id, function(token) {
      rtcc.setToken(token);
      rtcc.forceAuthenticate();
    });
  })


  //what do to when we are disconnected from the client: we reconnect
  rtcc.on('cloud.authenticate.error', function(number) {
    if (number === 15 || number === 29) {
      getToken(user_id, rtcc.setToken);
    }
  });
};

function showError(error) {
  $('#error-content').text(error)
  $('#error').show()
}

//this will get an authentification token from your backend
function getToken(uid, callback) {
  $.ajax(AUTH_URL + uid, {
      dataType: 'json'
    })
    .done(function(response) {
      var token = response.token;
      if (!token) {
        showError('error getting the token:' + JSON.stringify(response))
      } else {
        callback(token);
      }
    })
    .fail(showError)
}


//start by getting a token, then initialize the rtcc object.
function initialize(userId, displayName) {
  bindAuthCallbacks(rtcc, userId);
  storedDisplayName = displayName
  getToken(userId, function(token) {
    rtcc.setToken(token);
    rtcc.initialize();
  });
}

/**
 * Call
 *
 * In this part, we manage the creation and the reception of a  call. We use the rtcc.createCall function,
 * and we define the callbacks for changing the UI on various call events.
 *
 * Detailed tutorial available here:
 * https://docs.sightcall.com/GD/01_javascript/Tutorials/02_js_call.html
 */

var currentUserId;


//when we are connected to the presence service, we show the chat
rtcc.on('cloud.sip.ok', function() {
  $('#once_connected').show();
  $('#call').html('Ready for incoming/outgoing call');
})


// Define the callbacks each time we have a new call
function defineCallListeners(call) {
  if (call.getDirection() === "incoming") {
    $('#call').html('Receiving call from ' + call.dn);
  }
  call.onAll(function() {
    if (window.console) {
      console.log('Call: event "' + this.eventName + '"" with arguments: ' + JSON.stringify(arguments));
    }
  })
  call.on('active', function() {
    $('#call').html('Call active');
  });

  // for webrtc screen share
  call.on('chrome.screenshare.missing', function(url) {
    window.open(url);
  });

  call.on('terminate', function(reason) {
    if (reason === 'not allowed') {
      $('#call').html('Only allowed to call the parent, Mike in our case');
    } else {
      $('#call').html('Ready for incoming/outgoing call');
    }
  })
}

//when a call has started
rtcc.on('call.create', defineCallListeners)

//called when the send button has been clicked
//send a message through the API to the selected target
function call() {
  var uid = $('#user_to_call').val();
  var displayNameToCall = $('#user_to_call option:selected').text();
  $('#call').html('Calling ' + displayNameToCall);
  rtcc.createCall(uid, 'internal', displayNameToCall);
}

//get the choices from the menu, disable them and initialize the rtcc connection
function startCallUi() {
  $('#start_btn').prop("disabled", true);
  $('#currentUser').prop("disabled", true);
  $('#connecting').text('Connecting...');
  currentUserId = $('#currentUser').val();
  var displayName = $('#currentUser option:selected').text();
  initialize(currentUserId, displayName);
}

//set interface listeners
$(document).ready(function() {
  $('#start_btn').on('click', startCallUi)
  $('#call_button').on('click', call)
})

//the example has to be loaded from a webserver for the connexion to work
if (window.location.protocol === 'file:') {
  alert('your project must be served from a webserver and not from the file system');
}

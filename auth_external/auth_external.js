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
 * EXTERNAL AUTHENTICATION
 *
 * In this part, we manage the authentication process of an external user.
 * First we create an instance of the
 * API, then we define the callbacks related to the authentication events.
 * 
 * In order to be connected as an external user, it must have a parent user.
 * In order for the parent to exist, is must connect at least once. You can 
 * open the file auth_parent.html to do this.
 */

//The second parameter is the UID of the parent user, here mike_doe.
//The third parameter is the external mode
var rtcc = new Rtcc(APP_IDENTIFIER, 'mike_doe', 'external', rtccOptions);

//Creates the rtcc object and define the callbacks
var bindAuthCallbacks = function(rtcc, user_id) {
  //Now, we define the callbacks to the events of the API

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
  })

  //what to do when we are connected when we are connected with another user id
  //in plugin or driver mode
  rtcc.on('cloud.loggedasotheruser', function() {
    // force connection, kick other logged users
    rtcc.forceAuthenticate();
  })


};


//start by getting a token, then initialize the rtcc object.
function initialize(userId, displayName) {
  bindAuthCallbacks(rtcc, userId);
  rtcc.setDisplayName(displayName)
  rtcc.initialize();
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

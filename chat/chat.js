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
 * CHAT
 *
 * In the following part, we create a basic chat. First, we define the callbacks related
 * to the message events from the API. Then we bind the actions of the interface.
 *
 * Detailed tutorial available here:
 * https://docs.sightcall.com/GD/01_javascript/Tutorials/04_js_chat.html
 */

var currentMessageId = 1;
var currentUserId;

//what to do when we are acknowledged that a message has been received
rtcc.on('message.acknowledge', function(message_id, uid, status) {
  $('#status_msg_' + message_id).text("Status: Received!");
})

//what to do when we receive a message
rtcc.on('message.receive', function(message_id, uid, message) {
  currentMessageId++;
  rtcc.acknowledgeMessage(message_id, uid, 1);
  var message_dom = "<div'>From: " + uid + "<br/>TO: " + currentUserId + "<br/>MSG: " + message + "</div><br/><br/>";
  $('#chat_container').append(message_dom);
})

//when we are connected to the presence service, we show the chat
rtcc.on('presence.ok', function() {
  $('#once_connected').show();
})

//called when the send button has been clicked
//send a message through the API to the selected target
function sendMessage() {
  var uid = $('#send_to_user').val();
  var message = $('#message-to-send').val();
  $('#message-to-send').val('')
  var message_dom = "<div'>From: " + currentUserId + "<br/>To: " + uid + "<br/>Message: " + message + "<div id='status_msg_" + currentMessageId +
    "'>Status: Sent</div></div><br/>";
  $('#chat_container').append(message_dom);
  rtcc.sendMessage(currentMessageId, uid, message);
  currentMessageId++;
}

//get the choices from the menu, disable them and initialize the rtcc connection
function startChat() {
  $('#start_btn').prop("disabled", true);
  $('#currentUser').prop("disabled", true);
  $('#connecting').text('Connecting...');
  currentUserId = $('#currentUser').val();
  var displayName = $('#currentUser option:selected').text();
  initialize(currentUserId, displayName)
}

//set interface listeners
$(document).ready(function() {
  $('#start_btn').on('click', startChat)
  $('#send_button').on('click', sendMessage)
})

//the example has to be loaded from a webserver for the connexion to work
if (window.location.protocol === 'file:') {
  alert('your project must be served from a webserver and not from the file system');
}

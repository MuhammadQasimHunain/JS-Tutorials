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
 * PRESENCE
 *
 * In the following part, we create presence system. Each user can set
 * a presence level, and the others can instantly see the changes.
 *
 * First, we define who are the possible users, which images use. Then we define
 * the callbacks that will listen to the presence events of the API. We listen
 * to the presence change of all the users of the list, using a roster.
 * Finally, we bind the interface actions.
 *
 * Detailed tutorial available here:
 * https://docs.sightcall.com/GD/01_javascript/Tutorials/03_js_presence.html
 */

//we define the constants for the application
var presenceIcons = {
  '0': 'img/offline.png',
  '7': 'img/away.png',
  '8': 'img/busy.png',
  '15': 'img/online.png'
};
var rosterUids = ['charlie', 'thomas', 'alexander'];
var rosterDisplayName = {
  'charlie': 'Charlie',
  'thomas': 'Thomas',
  'alexander': 'Alexander'
};

var bindPresenceCallbacks = function(rtcc) {

  //when we have the presence roster, we build a list indicating the status of each user
  rtcc.on('presence.roster.retrieve', function(roster) {
    var presence_html = '<ul  class="list-unstyled">';
    for (var i = 0; i < roster.length; i++) {
      var iconImg = '<img  style="height:20px;" src="' + presenceIcons[roster[i].presence] + '"/>';
      presence_html += '<li id="presence_' + roster[i].uid + '">' + iconImg + rosterDisplayName[roster[i].uid] + '</li>';
    }
    $('#presence_container').empty().append(presence_html + '</ul>');
  });

  //when the presence of a user changes, we update his icon status
  rtcc.on('presence.update', function(uids_updated) {
    for (var i = 0; i < uids_updated.length; i++) {
      var elem = $("#presence_" + uids_updated[i].uid);
      if (elem.length) {
        var iconImg = '<img src="' + presenceIcons[uids_updated[i].presence] + '"/>';
        elem.html(iconImg + rosterDisplayName[uids_updated[i].uid])
      }
    }
  });

  //when we have the result of an explicit status query, we display it
  rtcc.on('presence.burstupdate', function(data) {
    var presence_answer_str = "<h3>onBurstUpdate</h3><ul class='list-unstyled'>";
    for (var i = 0; i < data.length; i++) {
      presence_answer_str += '<li>UID: ' + data[i].uid + ' PRESENCE VALUE:' + data[i].presence + '</li>';
    }
    $('#presence-answer').empty().append(presence_answer_str + '</ul>');
  });

  //if this user is not yet in the presence server, we create his roster
  //which consists of a list of users he wants to have the presence notifications
  rtcc.on('presence.newuser', function() {
    rtcc.rosterAdd(rosterUids);
    rtcc.setMyPresence(15);
  });

  //when connected to the presence server, we get the roster and start the presence interface
  rtcc.on('presence.ok', function() {
    rtcc.getRoster();
    $('#once_connected').show();
  });
}

function setMyPresence() {
  rtcc.setMyPresence($('#presence_value').val());
}

function getPresence() {
  rtcc.getPresence($('#get_presence').val().split(','));
}

function startPresence() {
  $('#currentUser').prop("disabled", true);
  $('#start_btn').prop("disabled", true);
  $('#connecting').text('Connecting...');
  var element = document.getElementById('currentUser')
  var uid = $('#currentUser').val();
  var displayName = $('#currentUser option:selected').text()
  initialize(uid, displayName);
}


//set interface listeners
$(document).ready(function() {
  bindPresenceCallbacks(rtcc);
  $('#set_presence').on('click', setMyPresence)
  $('#get_presence_button').on('click', getPresence)
  $('#start_btn').on('click', startPresence)
})

//the example has to be loaded from a webserver for the connexion to work
if (window.location.protocol === 'file:') {
  alert('your project must be served from a webserver and not from the file system');
}

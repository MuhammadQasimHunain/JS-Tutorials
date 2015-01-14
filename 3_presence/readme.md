# Sightcall JavaScript Presence


This is an example of a sightcall presence process

For a full JavaScript API reference please refer to our [official documentation website](https://docs.sightcall.com/GD/01_javascript/).

- [Quick-start RtccDriver and WebRTC](https://docs.sightcall.com/GD/01_javascript/01_jsquickstart.html)


### How to deploy the example

##### Requirement

- It is important that the project is served from a webserver and not from the file system when using WebRTC.
- Be aware of your AppId, and understand what is a ```UID``` and a ```Display Name```. All of them are described in our [definition page](https://docs.sightcall.com/GD/06_definitions.html).

You can find more details about AppID, UID and Display Name [here](https://docs.sightcall.com/GD/01_javascript/01_jsquickstart.html)

You also need to be able to get tokens out of the weemo cloud. The fastest way to obtain a token is to use one of our Authentication Client for backends. Description and samples are available [here](https://docs.sightcall.com/GD/04_backend/).

##### Setting up the AppID and the Authentication URL

Once you have received your ```AppID``` provided by Sightcall, you can setup this example with your AppId in order to test the API. The only thing you have to do is to setup the ```AppId``` as well as the Authentication URL.
To do so, you must edit the index.html file and
replace the placeholder "YOUR_APP_IDENTIFIER" by your AppID in the following lines"

```html
<script type="text/javascript" src="https://download.rtccloud.net/js/webappid/YOUR_APP_IDENTIFIER"></script>
```

and

```JavaScript
var rtcc = new Rtcc("YOUR_APP_IDENTIFIER", token, "internal", options);
```

You also need to replace the following line if you are using our java, node.js or ruby Authentication API Client sample:

```
//AUTH_URL = 'http://YOUR_AUTH_URL/gettoken?uid=',
```
 or if you are using our PHP Authentication API Client Sample.

```
// AUTH_URL = 'http://YOUR_AUTH_URL/gettoken.php?uid=',

```
In any case, you have to uncomment the right line and specify the URL where a token can be found by the web page.
Of course, if you have implemented your own client parameters and URL might be different and you need to update the samples accordingly.

Now you can upload the examples on a webserver and start using them.


#### How to use

This example is composed of this readme and one index.md

- Open ```index.html``` pick a user name, and click start.  You will know that you are connected when you will see these sentences appear in your browswer:

```JavaScript
You are now connected WebRTC
```

Once connected, notice the roster with a list of connected and not connected users.
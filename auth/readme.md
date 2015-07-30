# Sightcall JavaScript Authentication


This is an example of a SightCall authentication process

For a full JavaScript API reference please refer to our [official documentation website](https://docs.sightcall.com/gd).


### How to deploy the example

##### Requirement

- It is important that the project is served from a webserver and not from the file system when using WebRTC.
- Be aware of your AppId, and understand what is a `UID` and a `Display Name`. All of them are described in our [definition page](https://docs.sightcall.com/gd/definitions/).

You also need to be able to get tokens out of the SightCall cloud. The fastest way to obtain a token is to use one of our Authentication Clients for backends. Description and samples are available [here](https://docs.sightcall.com/gd/how-to/authenticate/).

##### Setting up the AppID and the Authentication URL

Once you have received your `AppID` provided by Sightcall and implemented the Authentication Client, you can setup this example to test the API.

 * Edit the `auth.html` file and replace the placeholder `YOUR_APP_IDENTIFIER` by your AppID in the following line

```html
<script type="text/javascript" src="https://download.rtccloud.net/js/webappid/YOUR_APP_IDENTIFIER"></script>
```

 * Edit the file `auth.js`, in the `SETUP` part, replace the placeholder `APP_IDENTIFIER` by your AppId, and the placeholder `AUTH_URL` by the URL of your Authentication Client.


#### How to use

- Open `auth.html` in one computer and wait te be connected. You will know that you are connected when you will see these sentences appear in your brower:

`You are now connected in mode: webrtc|driver|plugin.`

Now that you have successfully connected to the cloud you can check out the other tutorials.

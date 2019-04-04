# VidChat
VidChat is a WebRTC Client that allows users a simple way to embed video chat functionality into their web app.

Demo link: https://swapnikkatkoori.github.io/VidChat/


How It Works:
1) Include a script tag for videochat.js

```
<script type="text/javascript" src="videochat.js"></script>
```
2) The backend is already setup by default using Node.js and Socket.io for signaling between peers. Include the script tag for the socket.io cdn in the head of the html.
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.dev.js"></script>
```
  -The code for the backend can be found here: https://github.com/SwapnikKatkoori/VidChatBackend.
3) Create the two video elements. This is where the streams will be displayed.
```
  <video class="left" id="my_video"></video>
	<video class="right" id="friends_video"></video>
```
4) Now create a button element. This button will be the button that actually makes the "call".
```
<button id="connect_button" disabled="true">connect</button>
```
5) To actually include the video chat, create a new instance of it like so:
```
<script type="text/javascript">
  vc = new VideoChat({
          my_video_id: "my_video", //This is the video element's id for the user's video
				  other_video_id: "friends_video", //This is the video element's id for the remote peer
				  connect_button_Id: "connect_button", //The div id of the button that will actually make the connection
				  height: "600", //The height of the video element
				  width: "600",  //THe width of the video element
				  chat_room: document.getElementById("chat_room_input").value //The chat room identification
        })
</script>
```
  -The WebRTC peer-to-peer connection process starts immediately once the new instance of VideoChat is created, so it would be a good idea to make sure that the chat room identification is set before creating the VideoChat instance.
  -For the chat room identification in the demo, I just created an input field with a button, and called a function to create a new instance of VideoChat when the button was pressed. See the index.html for more details.
  -A better way to get the chat room identification might be to have the user input it in another page and implement a simple backend to retrieve it when you create the chat. 

All done! A one on one video chat should appear with the users in the "chat room".

Disclaimer:
-I created this just for fun and to learn WebRTC. It has not been tested extensively and it is definetly a work in progress. With that being said, please feel free to use any of the code from this mini project to set up your own implementation of WebRTC and video chat.
-The RTCPeerConnection method addStream(), which I use in this, has been deprecated and while it works currently, browsers may not support at some point. This is the link to see what browsers support it: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream.

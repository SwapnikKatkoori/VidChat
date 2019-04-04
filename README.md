# VidChat
VidChat is a WebRTC Client that allows users a simple way to embed video chat functionality into their web app.

Demo link: https://swapnikkatkoori.github.io/VidChat/


How It Works:
1) Include a script tag for videochat.js

```
<script type="text/javascript" src="videochat.js"></script>
```
2) To actually include the video chat, create a new instance of it like so:
```
<script type="text/javascript">
  vc = new VideoChat({
          divID: "video_player",  //This is the 
          connect_button_Id: "connect_button",
          height: "600",
          width: "600",
          chat_room: document.getElementById("chat_room_input").value
        })
</script>
```
More updates coming soon!

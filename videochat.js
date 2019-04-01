class VideoChat{
	constructor(initial_obj){
		//initial obj is an object that the client passes in.

		//The id of the div that the video chat should be in
		this.divID = initial_obj.divID
		//height and width of each video player
		this.height = initial_obj.height
		this.width = initial_obj.width
		//The number of potential people in the chat
		this.number = initial_obj.number

		this.peer_connection = null;
		this.initial_setup()
	}

	initial_setup(){
		let join_button = document.getElementById("connect_button");
		join_button.onclick = this.joinCall
	 }
	//Asks the user for permissiton to use camera and audio
	async getPermissionAndStream(){
		let stream = null;
		try{
			let constraints = {
				auido:true,
				video:true
			};
			stream = await navigator.mediaDevices.getUserMedia(constraints);
			this.peer_connection.addStream(stream)
			
		}
		catch(err){
			console.log(err);
		}
	}

	displayVideo(stream){
		let video_player_div = document.getElementById(this.divID);
		for (var i = this.number; i > 0; i--) {
			let new_div = document.createElement("DIV")
			let video_player = document.createElement("VIDEO");
			video_player.height = this.height;
			video_player.width = this.width;
			video_player.autoplay = true;
			video_player.style.transform = "scaleX(-1)";
			video_player.srcObject = stream;
			new_div.appendChild(video_player);
			video_player_div.appendChild(new_div)
		}
	}

	createConnection(){
		let config = {iceServers:[{urls:'stun:stun.l.google.com:19302'}]}
		this.peer_connection = new RTCPeerConnection(config);
		this.peer_connection.addEventListener = ('onicecandidate', this.handleConnection)
		this.peer_connection.addEventListener = ('onaddstream', this.streamAdded)
		this.getPermissionAndStream()
	}

	handleConnection(event){
		console.log("The handleConnectionEvent: ", event)
	}

	streamAdded(event){
		console.log("The streamAdded event: ",event)
	}

	joinCall(){
		let ws = new WebSocket("ws://localhost:8000");
		ws.onopen = (event)=>{
			console.log("connected to websocket on the client side");
			ws.send('sendMessage',(err)=>{
				console.log(err)
			})
		}
		
	}
}


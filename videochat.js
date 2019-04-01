
function handleConnection(event){
		console.log("The handleConnectionEvent: ", event)
	}

function streamAdded(event){
	console.log("The streamAdded event: ",event)
}


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

		this.ws = new WebSocket("ws://localhost:8000");
		this.ws.onopen = (event) =>{
			console.log("connected to websocket on the client side");
			this.ws.send('sendMessage',(err)=>{
				console.log(err)
			})
		}
		this.ws.onmessage = (mssg) =>{
			this.recieve_message(mssg)
		}
		let config = {iceServers:[{urls:'stun:stun.l.google.com:19302'}]}
		
		this.peer_connection = new RTCPeerConnection(config);
		this.peer_connection.addEventListener = ('onicecandidate', handleConnection)
		this.peer_connection.addEventListener = ('onaddstream', streamAdded)
		this.personal_id = Math.floor(Math.random()*1000000000);

		this.send_message = this.send_message.bind(this)
		this.initial_setup()
	}

	initial_setup(){
		let join_button = document.getElementById("connect_button");
		join_button.onclick = this.send_message
		this.getPermissionAndStream()
		this.show_all()
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
			this.show_my_face(stream)			
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


	show_my_face(stream){
		let my_video = document.getElementById("my_video")
		my_video.srcObject = stream
		my_video.height = this.height;
		my_video.width = this.width;
		my_video.autoplay = true;
		this.peer_connection.addStream(stream)
	}
	async show_all(){
		try{
			let offer = await this.peer_connection.createOffer();
			await this.peer_connection.setLocalDescription(offer)
			this.send_message()
		}
		catch(err){
			console.log("error in show_all(): ", err);
		}

	}

	send_message(){
		var id = this.personal_id
		var description = this.peer_connection.localDescription
		var json_string = JSON.stringify({user_id:id, message: description})
		console.log(JSON.parse(json_string))
		this.ws.send(json_string)
	}

	recieve_message(mssg){
		console.log(mssg)
	}
}


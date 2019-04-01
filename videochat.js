
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

		//this.ws = new WebSocket("ws://localhost:8000");
		this.ws = new WebSocket("wss://swapnikkatkoori.github.io/VidChat/")
		this.ws.onopen = (event) =>{
			console.log("connected to websocket on the client side");
		}
		this.ws.onmessage = (mssg) =>{
			this.recieve_message(mssg)
		}
		let config = {iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.l.mozilla.com:3478'}, {urls: 'stun:stun.l.samsungsmartcam.com:3478'}]}
		
		//This creates a peer connection for this instance of video chat
		//Peer connection api 
		this.peer_connection = new RTCPeerConnection(config);
		this.peer_connection.onicecandidate = ((event)=>{
			this.send_message(event.candidate)
		})

		this.peer_connection.onaddstream = ((event)=>{
			console.log(event.stream)
			let friends_video = document.getElementById("friends_video")
			friends_video.srcObject = event.stream
			friends_video.autoplay = true
			friends_video.height = this.height;
			friends_video.width = this.width;
			console.log("here")

		})


		this.personal_id = Math.floor(Math.random()*1000000000);

		this.send_message = this.send_message.bind(this)
		this.show_all = this.show_all.bind(this)
		this.recieve_message = this.recieve_message.bind(this)
		// this.handleConnection = this.handleConnection.bind(this)
		this.initial_setup()
	}

	initial_setup(){
		let join_button = document.getElementById("connect_button");
		join_button.onclick = this.show_all
		this.getPermissionAndStream()
		//this.show_all()
	 }
	//Asks the user for permissiton to use camera and audio
	async getPermissionAndStream(){
		let stream = null;
		try{
			let constraints = {
				audio:false,
				video:true
			};
			stream = await navigator.mediaDevices.getUserMedia(constraints);
			this.show_my_face(stream)			
		}
		catch(err){
			console.log(err);
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

	send_message(ice_candidate=null){
		var id = this.personal_id
		var description = this.peer_connection.localDescription
		if (ice_candidate instanceof MouseEvent){
			ice_candidate = null
		}
		var json_string = JSON.stringify({user_id:id, message: [description,ice_candidate]})
		this.ws.send(json_string)
	}

	async recieve_message(mssg){
		let data = JSON.parse(mssg.data);
		console.log(data)
		let message = data.message
		let description = message[0]
		let description_type = description.type
		let ice_candidate = message[1]
		if (ice_candidate != null){
			console.log("recieved ice candidate")
			this.peer_connection.addIceCandidate(new RTCIceCandidate(ice_candidate))
		}
		else{
			if(description_type === "offer"){
				console.log("an offer was made:", description)
				try{
					await this.peer_connection.setRemoteDescription(new RTCSessionDescription(description))
					let answer = await this.peer_connection.createAnswer()
					await this.peer_connection.setLocalDescription(answer)
					this.send_message()
				}catch(err){
					console.log(err)
				}
			}
			else if(description_type === "answer"){
				console.log("This is the answer:", description)
				await this.peer_connection.setRemoteDescription(new RTCSessionDescription(description));	
			}
			
		}
	}

	
}


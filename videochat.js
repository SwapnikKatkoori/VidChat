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
		this.room_name = initial_obj.chat_room;
		this.got_stream = false;
		this.socket = io.connect('https://pumpkin-cake-47918.herokuapp.com/');
	
		
		let config = {iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.l.mozilla.com:3478'}, {urls: 'stun:stun.l.samsungsmartcam.com:3478'}]}
		this.show_all = this.show_all.bind(this)
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
			friends_video.style.transform = "scaleX(-1)";
		})

		this.join_button = document.getElementById(initial_obj.connect_button_Id);
		this.join_button.onclick = this.show_all
		this.send_message = this.send_message.bind(this)
		
		this.recieve_message = this.recieve_message.bind(this)
		this.stream = null

		//This signifies that there are two users in the chat room
		this.socket.on('clients_in_room', (mssg)=>{
			console.log("both clients in room")
			const self = this
			if (!self.got_stream){
				self.getPermissionAndStream()
			}
		})

		this.socket.on('recieve_message', (mssg)=>{
			this.recieve_message(mssg)
		})

		this.socket.on('initial_message', (mssg)=>{
			this.socket.emit('room_name', this.room_name)
		})

		this.socket.on('both_streams_available', (mssg)=>{
			const self = this
			self.join_button.removeAttribute('disabled');
		})


	}

	//Asks the user for permissiton to use camera and audio
	async getPermissionAndStream(){
		let stream = null;
		try{
			let constraints = {
				audio:true,
				video:true
			};
			stream = await navigator.mediaDevices.getUserMedia(constraints);
			this.got_stream = true;
			this.show_my_face(stream)
		}
		catch(err){
			console.log(err);
		}
	}

	show_my_face(stream){
		this.socket.emit("got_stream", "Got stream!")
		let my_video = document.getElementById("my_video")
		my_video.srcObject = stream
		my_video.height = this.height;
		my_video.width = this.width;
		my_video.autoplay = true;
		my_video.style.transform = "scaleX(-1)";
		my_video.muted = "muted"
		this.peer_connection.addStream(stream)
	}
	async show_all(){
		var self = this
		try{
			let offer = await self.peer_connection.createOffer();
			await self.peer_connection.setLocalDescription(offer)
			self.send_message()
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
		const message_to_send = {user_id:id, message: [description,ice_candidate]};
		this.socket.emit("message", message_to_send)
	}

	async recieve_message(data){
		let message = data.message
		let description = message[0]
		let description_type = description.type
		let ice_candidate = message[1]
		if (ice_candidate != null){
			console.log("receved ice candidate")
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


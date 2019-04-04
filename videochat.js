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

		//Connects to the socket
		this.socket = io.connect('https://pumpkin-cake-47918.herokuapp.com/');
	
		////////////////////////////////////////////////////////////////
		//This creates a peer connection for this instance of video chat
		////////////////////////////////////////////////////////////////		
		let config = {iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.l.mozilla.com:3478'}, {urls: 'stun:stun.l.samsungsmartcam.com:3478'}]}
		this.show_all = this.show_all.bind(this)
		
		this.peer_connection = new RTCPeerConnection(config);
		this.peer_connection.onicecandidate = ((event)=>{
			this.send_message(event.candidate)
		})
		this.peer_connection.onaddstream = ((event)=>{
			let friends_video = document.getElementById("friends_video")
			friends_video.srcObject = event.stream;
			friends_video.autoplay = true
			friends_video.height = this.height;
			friends_video.width = this.width;
			friends_video.style.transform = "scaleX(-1)";
		})


		/*
		The user passes in the Id of the "connect button element". 
		-It will initially be disabled
		-When it is enables, if the user clicks on it, it will call this.show_all()
		*/
		this.join_button = document.getElementById(initial_obj.connect_button_Id);
		this.join_button.setAttribute('disabled', "true")
		this.join_button.onclick = this.show_all
		this.send_message = this.send_message.bind(this)
		
		this.recieve_message = this.recieve_message.bind(this)
		this.stream = null

		///////////////////////////////////////////////
		//These are all of the initial socket listeners
		///////////////////////////////////////////////

		/*
		The initial message is sent by the socket when the client intially connects to it.
		*/
		this.socket.on('initial_message', (mssg)=>{
			this.socket.emit('room_name', this.room_name)
		})

		/*
		This signifies that there are two users in the chat room.
		-Once there are two users in the chat room, it asks the user for permission to use the camera and audio
		*/
		this.socket.on('clients_in_room', (mssg)=>{
			console.log("both clients in room")
			const self = this
			if (!self.got_stream){
				self.getPermissionAndStream()
			}
		})

		/*
		This is called when a message is recieved
		*/
		this.socket.on('recieve_message', (mssg)=>{
			this.recieve_message(mssg)
		})

		/*
		This is called when two users have entered a chat room. It will enable the connect button.
		*/
		this.socket.on('both_streams_available', (mssg)=>{
			console.log("both streams available")
			const self = this
			self.join_button.removeAttribute('disabled');
		})


	}

	/*
	Asks the user for permissiton to use camera and audio
	*/
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

	/*
	This method will show take in the stream of video and audio and display it in a video element
	-The client must pass in the Id for the user's video as well as the user to connect's video
	-Adds the stream to the peer connection
	*/
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

	/*	
	This method is called when the user clicks the join_button
	-It will create an offer and set the local description
	-It then calls the method send_message() to send the local description to the other user
	*/
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

	/*
	This method emits the description and ice_candidate of the peer connection
	-The ice candidate is set to null if there is no ice candidate
	*/
	send_message(ice_candidate=null){
		var id = this.personal_id
		var description = this.peer_connection.localDescription
		if (ice_candidate instanceof MouseEvent){
			ice_candidate = null
		}
		const message_to_send = {message: [description,ice_candidate]};
		this.socket.emit("message", message_to_send)
	}


	/*
	This method is called when a message is recieved.
	-If the message contains an ice candidate, it will add the ice candidate to the peer connection
	-If an offer is recieved from another user:
		-It sets the remote description to the offer
		-it creates an answer to send and sets the answer as the local description
		-it sends the answer to the peer
	-If an answer to an offer is recieved:
		-It sets the remote description as the answer
	*/
	async recieve_message(data){
		let message = data.message
		let description = message[0]
		let description_type = description.type
		let ice_candidate = message[1]
		if (ice_candidate != null){
			console.log("receved ice candidate", ice_candidate)
			await this.peer_connection.addIceCandidate(new RTCIceCandidate(ice_candidate))
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


const WebSocket = require('ws');
const server = require('http').createServer((req,res)=>{
	res.write("Socket server started up");
	res.end();
});
const wss = new WebSocket.Server({server});
let user_count = 0

wss.on('connection', function (ws) {
	user_count+=1
	console.log(user_count)
	console.log("socket connected on the server side")
	ws.on('message',(mssg)=>{
		console.log(mssg);
		wss.clients.forEach(function each(client) {
      		if (client !== ws && client.readyState === WebSocket.OPEN) {
        		client.send("hello");
      		}
    	});
	});
});

server.listen(8000,(err)=>{
	console.log("server started")
})
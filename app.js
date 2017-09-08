const http = require('http'),
	express = require('express'),
	GameServer = require('./server').Server,
	socketIO = require('socket.io'),
	consts = require('./consts.js').consts,
	port = consts.SERVER_PORT;
	app = express(),
	server = require('http').createServer(app),
	io = socketIO.listen(server);

app.use("/", express.static('public'));
app.use("/humanVsComputer", express.static('public'));
app.use("/computerVsComputer", express.static('public'));
app.use("/multiplayer", express.static('public'));
app.use("/peer2peer", express.static('public'));

server.listen(port, "localhost", () => {
	console.log("Bull and Cows Server is listening...");
});

const gameServer = new GameServer(io);
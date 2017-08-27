var http = require('http');
var express = require('express');
var GameServer = require('./server').Server;
var socketIO = require('socket.io');

var consts = require('./consts.js').consts;

var port = consts.SERVER_PORT;


var app = express(),
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

var gameServer = new GameServer(io);
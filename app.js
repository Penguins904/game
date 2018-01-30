
var express = require('express');
var http = require("http");
var path = require("path")
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000, function() {
	console.log("starting server");
});

var io = require('socket.io')(serv);
var sockets = {};
io.on('connection', function(socket){

	socket.on("newPlayer", function(data){
		socket.Id = data.Id;
		socket.Name = data.name;
		socket.player = Math.round(Math.random());
		socket.emit("number",{
			number:socket.player
		});
		socket.opponent = null;
		socket.bullets = null;
		if (socket.player){
			socket.x = 0;
			socket.y = 0;
		}else {
			socket.x = 449;
			socket.y = 0;
		}
		socket.Xs = 0;
		socket.Ys = 0;
	sockets[socket.Id] = socket;
	});

	socket.on("chords", function(data) {
		socket.x = data.x;
		socket.y = data.y;
		sockets[socket.Id] = socket;
	})

});
io.on("disconect", function(socket){
	if (socket.opponent != null) {
		sockets[socket.opponent].emit("leave");
		delete sockets[socket.Id];
	}else {
		delete sockets[socket.Id];
	}
});
var games = {};
setInterval(function(){
	var waiting = {};
	for (var i in sockets) {
		var socket = sockets[i];
		if (socket.opponent == null) {
			if (Object.keys(waiting).length) {
			waiting[Object.keys(waiting).length] = socket;
		} else {
			waiting[0] = socket;
		}
			if (Object.keys(waiting).length == 2) {
				if (waiting[0].player == waiting[1].player) {
					while (waiting[0].player == waiting[1].player) {
						waiting[0].player = Math.round(Math.random());
					}
					console.log(waiting[0].number);
					waiting[0].emit("number",{
						number: waiting[0].number
					});
				}
				if (waiting[0].player){
					if (Object.keys(games).length){
						games[Object.keys(games).length - 1] = {
						p1: waiting[0],
						p2: waiting[1]
					};
				} else {
					games[0] = {
					p1: waiting[0],
					p2: waiting[1]
				};
				}
				} else {
					if (Object.keys(games).length){
						games[Object.keys(games).length - 1] = {
						p1: waiting[1],
						p2: waiting[0]
					};
				} else {
					games[0] = {
					p1: waiting[1],
					p2: waiting[0]
				};
				}
				}
				waiting[0].emit("inGame");
				waiting[1].emit("inGame");
			}
		}
		}

waiting = {};
	for (var i in games) {
		var game = games[i];
		game.p1.emit("chords", {
			x: game.p2.x,
			y: game.p2.y,
			//bullets = game.p2.bullets;
		});
		game.p2.emit("chords", {
			x: game.p1.x,
			y: game.p1.y,
		});

	}
}, 1000/30);

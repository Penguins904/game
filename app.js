
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var count = 0;
app.get('Penguins904.github.io/game',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);

var io = require('socket.io')(serv);

io.on('connection', function(socket){
  
});

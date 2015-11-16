// We need to use the express framework: have a real web servler that knows how to send mime types etc.
var express=require('express');

// Init globals variables for each module required
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

// launch the http server on given port
server.listen(8082);

// Indicate where static files are located. Without this, no external js file, no css...  
app.use(express.static(__dirname + '/'));    

console.log("http://localhost:8082/");

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var listOfPlayers = {};

io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendpos', function (player) {
		listOfPlayers[socket.username] = player;
		// we tell the client to execute 'updatepos' with 2 parameters
		socket.broadcast.emit('updatepos', listOfPlayers);

		socket.emit('upposplayer', listOfPlayers[socket.username]);

	});

	socket.on('tir', function (tir) {
		socket.broadcast.emit('tirClient', tir);
	});

	socket.on('key', function (inputStates) {
		io.sockets.emit('key', inputStates, socket.username);
		socket.emit('upposplayer', listOfPlayers[socket.username]);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){

		socket.username = username;

		usernames[username] = username;

		socket.emit('getUsername', username);

		console.log("Connection de : "+username);

		var monster = {
	      'x': 100,
	      'y': 100,
	      'speed': 200, // pixels/s this time !
	      'size': 50,
	      'boundingCircleRadius': 70,
	      'inputStates': {},
	    };

		monster.x = Math.round(600 / 2) - monster.size / 4;
       	monster.y = Math.round((3 * 600) / 4) - monster.size;

		listOfPlayers[username] = monster;
		io.sockets.emit('updateMonsters',listOfPlayers);
	});

	socket.on('getMonster', function(){
		socket.emit('updateMonster', listOfPlayers[socket.username]);
	});

	socket.on('getMonsters', function(){
		io.sockets.emit('updateMonsters', listOfPlayers);
	});


	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];

		// Remove the player too
		delete listOfPlayers[socket.username];		
		io.sockets.emit('updatePlayers',listOfPlayers);
	});
});
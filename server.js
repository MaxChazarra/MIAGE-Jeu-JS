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

	socket.on('keydown', function (keycode) {
		socket.broadcast.emit('keydown', keycode, socket.username);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		// the 'socket' variable is unique for each client connected,
		// so we can use it as a sort of HTTP session
		socket.username = username;
		// add the client's username to the global list
		// similar to usernames.michel = 'michel', usernames.toto = 'toto'
		usernames[username] = username;
		// echo to the current client that he is connecter
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo to all client except current, that a new person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// tell all clients to update the list of users on the GUI
		io.sockets.emit('updateusers', usernames);

		console.log("Connection de : "+username);


		// Create a new player and store his position too... for that
		// we have an object that is a "list of players" in that form
		// listOfPlayer = {'michel':{'x':0, 'y':0, 'v':0}, 
		// 							john:{'x':10, 'y':10, 'v':0}}
		// for this example we have x, y and v for speed... ?
		var monster = {
	      'x': 100,
	      'y': 100,
	      'speed': 100, // pixels/s this time !
	      'size': 50,
	      'boundingCircleRadius': 70
	    };
		listOfPlayers[username] = monster;
		io.sockets.emit('updatePlayers',listOfPlayers);
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
				// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);

		// Remove the player too
		delete listOfPlayers[socket.username];		
		io.sockets.emit('updatePlayers',listOfPlayers);
	});
});
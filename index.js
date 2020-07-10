//code by sadi @ 9-7-2020 wednesday 2:17am :)

var PORT = process.env.PORT || 3000;

//load dependencies
const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const app = express();

//set template engine and folders
app.set('engine', 'ejs');
app.set('view', './views');

//middlewares
app.use(express.static('static'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({ secret: "saditheunknownlegendsadiboy1", resave: true, saveUninitialized: true }));

//routes
app.get('/', function(req,res) {
	res.sendFile(__dirname+'/views/index.html');
});

//listen to requests and sockets
let server = app.listen(PORT, function() { console.log('server running at port : '+PORT); });
const io = require('socket.io')(server);

//chat users object
var chatters = [];
var users = 0;
var prevusername = '';
// var typing = false;

io.on('connection', function(socket) {

	users++;
	socket.usernumber = users;
	socket.username = `user${users}`;


	/*handle outgoing events
	=========================*/

	//inform chatters about new chatter
	/*console.log('new user connected : '+socket.username)*/
	socket.broadcast.emit('newuser', { uname: socket.username, totalusers: users });


	/*handle incoming events:
	=========================*/

	//manage new messages
	socket.on('newmessage', function(data) {
		//console.log(socket.username+" : "+data.msg);
		socket.broadcast.emit('newmessage', { msgfrom: socket.username, msg: data.msg });
	});

/*	//user is typing..
	socket.on('typing', function(data) {
		socket.broadcast.emit('typing', { typer: socket.username, typing: data });
	});
*/

	//manage username change
	socket.on('username', function(data) {
		prevusername = socket.username;
		socket.username = (data) ? data : `user${users}`;
		socket.broadcast.emit('username', { oldname: prevusername, newname: data });
		//console.log("debug infro prevusername : "+prevusername);
	});

	//disconnect event
	socket.on('disconnect', function() {
		users--;
		//console.log(socket.username+' disconnected, total users : '+users);
		socket.broadcast.emit('disconnected', socket.username);
	});
});
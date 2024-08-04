//code by sadi @ 9-7-2020 wednesday 2:17am :)

var PORT = process.env.PORT || 3000;

//load dependencies
const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const timestamp = require('./public/msgtime_server');
const app = express();

//set template engine and folders
app.set('engine', 'ejs');
app.set('view', './views');
app.use(express.static('public'));

//middlewares
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({ secret: "saditheunknownlegendsadiboy1", resave: true, saveUninitialized: true }));

//routes
app.get('/', function(req,res) {
	res.sendFile(`${__dirname}/public/index.html`);
});

//listen to requests and sockets
let server = app.listen(PORT, function() { console.log('server running at port : '+PORT); });
const io = require('socket.io')(server);

//chat users object
var chatters = [];
var userindex = 0;
var users = 0;
var prevusername = '';
var typing = false;
const bubblecolors = ['#3e1313','#393838','#443f0d','#384e1b','#384e1b','#404a34','#0f6334','#152c4a','#00275a','#29214c','#3e3954','#2e2d33','#11054e','#334965','#370e42','#4e4e4e','#5c1d49','#370a2a','#4a1e1e','#503b01'];

io.on('connection', function(socket) {

	// total users count (chatters.length)
	users++;

	// new user object
	chatters.push({
		userid: socket.id,
		username: socket.username = `user${users}`,
		userjointime: timestamp.gettime(),
		usercolor: bubblecolors[Math.floor(Math.random()*bubblecolors.length)]
	});


	// handle incoming events:
	//------------------------

	// info new user joined
	socket.on('username', function(data) {
		let i; prevusername = socket.username;
		socket.username = (data) ? data : `user${users}`;

		// find this user in array and modify username
		for(i = 0; i < chatters.length; i++) {
			if(chatters[i].username == prevusername) {
				chatters[i].username = socket.username;
				userindex = i; break;
			}
		}

		// send users list only to new user
		socket.emit('chatdata', chatters);
		// for rest of users to push to users list
		socket.broadcast.emit('newuser', { uid: socket.id, uname: socket.username, ujointime: chatters[userindex].userjointime, ucolor: chatters[userindex].usercolor });
	});

	// manage new messages
	socket.on('newmessage', function(data) {
		socket.broadcast.emit('newmessage', { socketid: socket.id, msgfrom: socket.username, msg: data.msg, msgtimestamp: data.msgtime });
	});

	// message read status to sender
	socket.on('msgread', function(id) {
		// inform the sender msg had read
		socket.broadcast.to(id).emit('msgread', true);
	});

	// user is typing..
	socket.on('typing', function(data) {
		socket.broadcast.emit('typing', { typer: socket.username, typing: data });
	});

	// disconnect event
	socket.on('disconnect', function() {
		users--;
		// remove from array
		for(let i = 0; i < chatters.length; i++) {
			if(chatters[i].username == socket.username) {
				chatters.splice(i,1);
				userindex = i; break;
			}
		}
		console.log(socket.username+' disconnected, total users : '+users);
		socket.broadcast.emit('disconnected', { dropeduser: socket.username, userindex: userindex });
	});
});
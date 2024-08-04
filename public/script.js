//script for chat features by sadi
//-------------------------//-

function setchat() {

	var chatterscopy;

	//log start time
	console.log('script begin running at : '+gettimestamp());

	//connect to socket
	var socketlink = window.location.origin;
	var socket = io.connect(socketlink) || io();
	if(socket) console.log('connected to socket '+socketlink); else console.log('cant connect to socket : '+socketlink);

	//grab elements
	const chatbody = document.getElementById('chat-container');
	const mychatname = document.getElementById('myusername');
	const mymsg = document.getElementById('usermsgbox');

	//global variables
	let lastmsgbbl = "", lastmsg = "", chatname = "", totalusers = 0;


	/*handle sending events
	========================*/

	//send chat message
	mymsg.addEventListener('change', function() {
		let chatholder = '',
			chat = '', chattime;
			lastmsg = mymsg.value;
		
		//create and append my msgs dynamically
		chatholder = document.createElement('div');
		chatholder.classList.add('mymessage');
		chatholder.style.textAlign = 'right';
		chat = document.createElement('p')
		chat.classList.add('message');
		chat.append(lastmsg);
		chattime = document.createElement('label');
		chattime.classList.add('chatinfolabel');
		chattime.style.textAlign = "right";

		//set msg time
		chattime.innerHTML = gettimestamp();
		chat.append(chattime);
		chatholder.append(chat);

		//clear input value
		mymsg.value = "";
		lastmsgbbl = chatholder;
		chatbody.append(chatholder);
		scrollnewmessages();
		//send msg to socket
		socket.emit('newmessage', { msg: lastmsg, msgtime: gettimestamp() });
	});

	//finally the user is typing .. message
	mymsg.addEventListener('keypress', function(event) {
		scrollnewmessages();
		//console.log("typing event : "+event.which); //13 is enter , 97 - a
		var typingtime = undefined;
		if(event.which != 13) { // which prop is deprecated !
			socket.emit('typing', true);
			clearTimeout(typingtime);
			typingtime = setTimeout(istyping, 1400);
		} else {
			clearTimeout(typingtime);
			istyping();
		}

		function istyping() {
			// console.log('user not typing..');
			socket.emit('typing', false);
		}

	});



	/*handle recieving messages:
	=============================*/

	//previous users data before me if any
	socket.on('chatdata', function(data) {
		// recieved chatdata plot it
		chatterscopy = data;
		updatechattersinfo();
		playinfosounds(0);
	});

	//new user joined
	socket.on('newuser', function(data) {
		removetypinginfo();
		showchatinfo(data.uname+" joined the chat");
		chatterscopy.push({
			userid: data.uid,
			username: data.uname,
			userjointime: data.ujointime,
			usercolor: data.ucolor
		});
		updatechattersinfo();
		playinfosounds(0);
		scrollnewmessages();
	});

	//incoming chats
	socket.on('newmessage', function(data) {
		//remove user is typing message if there is any
		removetypinginfo();
		let chatholder = '', chat = '', chattime, chattername, bubblecolor,
		newmsg = data.msg, newmsgby = data.msgfrom, newtimestamp = data.msgtimespamp, sockid = data.socketid;
		for(i = 0; i < chatterscopy.length; i++) {
			if(chatterscopy[i].username == newmsgby) {
				bubblecolor = chatterscopy[i].usercolor;
				break;
			}
		}
		//create and append msgs dynamically
		chatholder = document.createElement('div');
		chatholder.classList.add('newmessage');
		
		chat = document.createElement('p')
		chat.classList.add('message');
		chat.style.backgroundColor = bubblecolor;
		// chat.style.boxShadow = `2px 4px 3px ${bubblecolor}`;

		chattername = document.createElement('label');
		chattername.classList.add('chatinfolabel');
		chattername.style.color = "#65f1fa";
		chattername.style.fontWeight = "bold";
		chattername.innerHTML = newmsgby;
		chat.append(chattername);
		chat.append(newmsg);

		//msg time label
		chattime = document.createElement('label');
		chattime.classList.add('chatinfolabel');
		chattime.innerHTML = newtimestamp || gettimestamp();

		//wrap up all
		chat.append(chattime);
		chatholder.append(chat);
		chatbody.append(chatholder);

		//play new message sound after it rendered
		playinfosounds(1);
		//scroll to last message
		scrollnewmessages();

		// open keyboard if not open
		if(document.activeElement.id === "usermsgbox") {
			// console.log('keyboard is on :)');
		} else {
			// console.log('keyboard is off :(');
			setTimeout(function() {mymsg.focus();}, 1400);
		}

		//tell message have read(ed)
		socket.emit('msgread', sockid);
	});

	socket.on('msgread', function(data) {
		if(data) {
			// console.log('msg read..');
			lastmsgbbl.classList.add('msgread');
		}
	});

// TO BE REPLACED BY 'onchatdata' EVENT

	//disconnect event
	socket.on('disconnected', function(data) {
		removetypinginfo();
		console.log('removed user from chatterscopy: '+chatterscopy.splice(data.userindex,1));
		updatechattersinfo();
		showchatinfo(data.dropeduser+" droped the chat");
		scrollnewmessages();
		updatechattersinfo();
	});

	//user is typing..
	socket.on('typing', function(data) {
		removetypinginfo();
		if(data.typing) {
			let temptyping = document.createElement('span');
			temptyping.classList.add('usertyping');
			temptyping.append(data.typer+' is typing..');
			chatbody.append(temptyping);
			// console.log('user is typing..'+data);
			scrollnewmessages();
		} else {
			removetypinginfo();
		}
	});


//quick functions

	//to remove user is typing msg
	function removetypinginfo() {
		if(chatbody.childElementCount > 0 && (chatbody.lastElementChild.className == "usertyping" || chatbody.lastElementChild.localName == "span")) {
			//console.log("removing "+chatbody.lastElementChild);
			chatbody.lastElementChild.remove();
			// if there is multiple labels
			removetypinginfo();
		}
	}

	//to scroll towards new messages
	function scrollnewmessages() {
		if(chatbody.scrollTop < chatbody.scrollHeight) {
			chatbody.scrollTop = chatbody.scrollHeight;
		}
	}

	//to show notifications and info
	function showchatinfo(msg) {
		//console.log(msg);
		let tempp = document.createElement('p');
		let tempmsg = (msg) ? `- ${msg} -` : '- notification missed -';
		tempp.classList.add('info');
		tempp.append(tempmsg);
		chatbody.append(tempp);
	}


	//update how many currently online
	function updatechattersinfo() {
		const totalonline = document.getElementById('totalonline');
		const usersdropdown = document.getElementById('usersdropdown');
		let i, tempp, currentusers, jointime;
		// clear old values if any
		totalonline.innerHTML = '';
		usersdropdown.innerHTML = '';
		totalusers = chatterscopy.length - 1; //excluding my
		currentusers = (totalusers > 0) ? totalusers : "nobody";
		// logic to show single-single chat or x-online on topbar
		if(currentusers == 1) showtopbarchatname();
		else mychatname.innerHTML = "Me";
		totalonline.innerHTML = currentusers+" online";

		// update chatters details
		for(i=0; i<chatterscopy.length; i++) {
			tempp = document.createElement('p');
			tempp.classList.add('userslist');
			tempp.textContent = chatterscopy[i].username;
			jointime = document.createElement('label');
			jointime.classList.add('jointime');
			// console.log('setting join time: '+chatterscopy[i].userjointime);
			jointime.innerHTML = chatterscopy[i].userjointime;
			tempp.append(jointime);
			// hilite my socket from list
			if(chatterscopy[i].userid == socket.id) {
				tempp.style.color = "darkcyan";
				tempp.style.fontStyle = "italic";
				tempp.style.order = -1;
				jointime.style.color = "cyan";
			}

			usersdropdown.append(tempp);
		}
	}

	function showtopbarchatname() {
		let i, myindex, hisindex;
		for(i=0; i<2; i++) { if(chatterscopy[i].userid == socket.id) myindex = i; }
		hisindex = (myindex == 0) ? 1 : 0;
		mychatname.innerHTML = chatterscopy[hisindex].username || 'Me';
	}

	function playinfosounds(audio) {
		//audio 0 = joined, 1 = recieved
		const joinedsound = document.getElementById('audiojoined');
		const recievedsound = document.getElementById('audiorecieved');
		if(audio) recievedsound.play(); else joinedsound.play();
	}

	function sendusername(name) {
		if(name) socket.emit('username',name);
	}


	// MICRO INTERACTIONS AND EVENT LISTENERS
	// =====================================

	// show ok inside input 
	document.getElementById('enterusername').addEventListener('keypress', function(event) {
		let checkname = document.getElementById('checkname');
		// console.log('enterd value'+this.value);
		if(this.value.length > 2) {
			checkname.style.visibility = 'visible';
			checkname.style.opacity = '1';
			myname = this.value;
			if(event.key === "Enter") checkname.click();
		} else { 
			checkname.style.visibility = 'none'; 
			checkname.style.opacity = '0';
		}
	});

	// enter name first
	document.getElementById('enterusername').focus();

	// send username and hide promptbox
	document.getElementById('checkname').addEventListener('click', function() {
		let promptbox = document.getElementById('custom_promptbox');
		let bgblur = document.getElementById('bg_blur');

		// validate username if needed ..

		// if all fine send username
		myname = document.getElementById('enterusername').value;
		chatname = myname || prompt('enter username', 'user');
		sendusername(chatname); //send to server

		// animation stuff
		promptbox.style.borderTop = '3px solid lightgreen';
		promptbox.style.animation = 'bottomslidedown 0.7s ease';

		// remove background blur
		bgblur.style.animation = 'fadetoclear 0.7s linear';
		bgblur.style.opacity = '0';

		setTimeout(function() {
			promptbox.style.opacity = '0';
			promptbox.style.visibility = 'hidden';
			promptbox.style.display = 'none';
			bgblur.style.display = 'none';
		}, 700);
		
		// open chat with fullscreen
		togglefullscreen();
	});

	// outside box touch to send username
	document.getElementById('bg_blur').addEventListener('click', function() {
		// myname = document.getElementById('enterusername').value;
		// if(myname) alert('sending username: '+myname);
		// chatname = myname || prompt('enter username', 'user');
		// sendusername(chatname); //send to server
		document.getElementById('checkname').click();
	});

}

//single line that starts the whole process
window.addEventListener('load', setchat, false);


// ==============END==============//
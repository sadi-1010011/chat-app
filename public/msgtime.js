//current time generator for public chat by sadi 13-7-2020

function gettimestamp() {
	let currentdate = new Date();
	let hrs = currentdate.getHours();
	let mns = currentdate.getMinutes();
	let fulltimestamp = `${hrs}:${mns} pm`;
	// console.log('used msgtime.js at: '+fulltimestamp);
	//AM or PM attaching logic here..
	return fulltimestamp;
}
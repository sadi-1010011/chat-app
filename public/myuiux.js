let myname;
let toggle1 = true; // true = open


// TOGGLE FULLSCREEN

function togglefullscreen() {
	var e = document.documentElement;
	console.log('FULLSCREEN Toggled!')
	if(toggle1) {
		try {
			if(e.requestFullscreen) { e.requestFullscreen(); }
			else if(e.mozRequestFullScreen) { e.mozRequestFullScreen(); }
			else if(e.webkitRequestFullscreen) { e.webkitRequestFullscreen(); }
			else if(e.msRequestFullscreen) { e.msRequestFullscreen(); }
		}
		catch(err) { alert('FULLSCREEN not fully functional in your device .. update ur daaamnn browser maaahnn!'); }
		toggle1 = false;
	} else {
		// console.log('closing FULLSCREEN')
		if(e.exitFullscreen) { e.exitFullscreen(); }
		else if(e.mozCancelFullScreen) { e.mozCancelFullScreen(); }
		else if(e.webkitExitFullscreen) { e.webkitExitFullscreen(); }
		else if(e.msExitFullscreen) { e.msExitFullscreen(); }
		else { 
			try { document.exitFullscreen(); }
			catch(err) { alert('FULLSCREEN not fully functional in your device .. update ur daaamnn browser maaahnn!'); }
		}
		toggle1 = true;
	}
}


// TOGGLE DROPDOWN

let toggle2 = true; // true = open
const inline_x = document.getElementById('totalonline');
const inline_y = document.getElementById('usersdropdown')

function toggledropdown() {
	if(toggle2) {
		if(inline_y.childElementCount > 1) {
			inline_y.style.visibility = 'visible';
			inline_y.style.opacity = 1;
		} else {
			inline_y.innerHTML = "nobody online bro :(";
			inline_y.style.visibility = 'visible';
			inline_y.style.opacity = 1;
		}
		toggle2 = false;
	} else {
		inline_y.style.visibility = 'hidden';
		inline_y.style.opacity = 0;
		toggle2 = true;
	}
}


// stop bg animation if not smartphone

// let ismobile = false;
// if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|/i.test(navigator.userAgent)) {
// 	ismobile = true;
// 	window.document.body.animation = 'animatedspacebg 120s linear infinite';
// 	alert('this is smartphone');
// } else {
// 	alert('not smartphone');
// 	window.document.body.animation = 'none';
// }
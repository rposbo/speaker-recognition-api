



// This method adds the recorded audio to the page so you can listen to it
function addAudioPlayer(blob){	
	var url = URL.createObjectURL(blob);
	var log = document.getElementById('log');

	var audio = document.querySelector('#replay');
	if (audio != null) {audio.parentNode.removeChild(audio);}

	audio = document.createElement('audio');
	audio.setAttribute('id','replay');
	audio.setAttribute('controls','controls');

	var source = document.createElement('source');
	source.src = url;

	audio.appendChild(source);
	log.parentNode.insertBefore(audio, log);
}

// Example phrases
var thingsToRead = [
	"Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you",
	"There's a voice that keeps on calling me\n	Down the road, that's where I'll always be.\n	Every stop I make, I make a new friend,\n	Can't stay for long, just turn around and I'm gone again\n	\n	Maybe tomorrow, I'll want to settle down,\n	Until tomorrow, I'll just keep moving on.\n	\n	Down this road that never seems to end,\n	Where new adventure lies just around the bend.\n	So if you want to join me for a while,\n	Just grab your hat, come travel light, that's hobo style.",
	"They're the world's most fearsome fighting team \n	They're heroes in a half-shell and they're green\n	When the evil Shredder attacks\n	These Turtle boys don't cut him no slack! \n	Teenage Mutant Ninja Turtles\nTeenage Mutant Ninja Turtles",
	"If you're seein' things runnin' thru your head \n	Who can you call (ghostbusters)\n	An' invisible man sleepin' in your bed \n	Oh who ya gonna call (ghostbusters) \nI ain't afraid a no ghost \n	I ain't afraid a no ghost \n	Who ya gonna call (ghostbusters) \n	If you're all alone pick up the phone \n	An call (ghostbusters)",
];

// vanilla javascript queystring management
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

// Get the Cognitive Services key from the querystring
var key = qs['key'];
var baseApi = qs['endpoint'];

// Speaker Recognition API profile configuration - constructs to make management easier
var Profile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId;}};
var VerificationProfile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId; this.remainingEnrollments = 3}};
var profileIds = [];
var verificationProfile = new VerificationProfile();

(function () {
	// Cross browser sound recording using the web audio API
	navigator.getUserMedia = ( navigator.getUserMedia ||
							navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia ||
							navigator.msGetUserMedia);

	// Really easy way to dump the console logs to the page
	var old = console.log;
	var logger = document.getElementById('log');
	var isScrolledToBottom = logger.scrollHeight - logger.clientHeight <= logger.scrollTop + 1;
    
	console.log = function () {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == 'object') {
				logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
			} else {
				logger.innerHTML += arguments[i] + '<br />';
			}
			if(isScrolledToBottom) logger.scrollTop = logger.scrollHeight - logger.clientHeight;
		}
		old(...arguments);
	}
	console.error = console.log; 
})();

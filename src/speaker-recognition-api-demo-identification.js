const createIdentificationProfileEndpoint = `${baseApi}/speaker/identification/v2.0/text-independent/profiles`;
const enrollIdentificationProfileEndpoint = (profileId) => `${baseApi}/speaker/identification/v2.0/text-independent/profiles/${profileId}/enrollments?ignoreMinLength=true`;
const enrollIdentificationProfileStatusEndpoint = (profileId) => `${baseApi}/speaker/identification/v2.0/text-independent/profiles/${profileId}`;
const identifyProfileEndpoint = (Ids) => `${baseApi}/speaker/identification/v2.0/text-independent/profiles/identifySingleSpeaker?profileIds=${Ids}&ignoreMinLength=true`;

//-- Speaker Identification methods
// 1. Start the browser listening, listen for 15 seconds, pass the audio stream to "createProfile"
function enrollNewProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		onMediaSuccess(stream, createProfile, 15);
	}, onMediaError);
}

// createProfile calls the profile endpoint to get a profile Id, then calls enrollProfileAudio
function createProfile(blob){
	addAudioPlayer(blob);

	var request = new XMLHttpRequest();
	request.open("POST", createIdentificationProfileEndpoint, true);

	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log('creating profile');
		var json = JSON.parse(request.responseText);
		console.log(json);

		var profileId = json.profileId;

		// Now we can enrol this profile using the profileId
		enrollProfileAudio(blob, profileId);
	};

	request.send(JSON.stringify({ 'locale' :'en-us'}));
}

// enrollProfileAudio enrolls the recorded audio with the new profile Id, polling the status
function enrollProfileAudio(blob, profileId){
  
  var request = new XMLHttpRequest();
  request.open("POST", enrollIdentificationProfileEndpoint(profileId), true);
  request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
  request.onload = function () {
  	console.log('enrolling');
	
	if (request.status==200 || request.status==201) {
		var json = JSON.parse(request.responseText);
		console.log(json);

		const location = enrollIdentificationProfileStatusEndpoint(profileId);
		pollForEnrollment(location, profileId);
	} else {
		console.log(`Failed to submit for enrollment: got a ${request.status} response code.`);
		var json = JSON.parse(request.responseText);
		console.log(`${json.error.code}: ${json.error.message}`);
	}
  };  
  request.send(blob);
}

// Ping the status endpoint to see if the enrollment for identification has completed
function pollForEnrollment(location, profileId){
	var enrolledInterval;

	// hit the endpoint every few seconds 
	enrolledInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);
		request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
		request.onload = function()
		{
			console.log('getting status');
			var json = JSON.parse(request.responseText);
			console.log(json);

			if (json.enrollmentStatus == 'Enrolled')
			{
				// Woohoo! The audio was enrolled successfully! 

				// stop polling
				clearInterval(enrolledInterval);
				console.log('enrollment complete!');

				// ask for a name to associated with the ID to make the identification nicer
				var name = window.prompt('Who was that talking?');
				profileIds.push(new Profile(name, profileId));
				console.log(profileId + ' is now mapped to ' + name);
			}
			else 
			{
				// keep polling
				console.log('Not done yet..');
			}
		};

		request.send();
	}, 1000);
}

// 2. Start the browser listening, listen for 10 seconds, pass the audio stream to "identifyProfile"
function startListeningForIdentification(){
	if (profileIds.length > 0 ){
		console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, identifyProfile, 10)}, onMediaError);
	} else {
		console.log('No profiles enrolled yet! Click the other button...');
	}
}

// 3. Take the audio and send it to the identification endpoint
function identifyProfile(blob){
	addAudioPlayer(blob);

	// comma delimited list of profile IDs we're interested in comparing against
	var Ids = profileIds.map(x => x.profileId).join();
  
	var request = new XMLHttpRequest();
	request.open("POST", identifyProfileEndpoint(Ids), true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
	request.onload = function () {
		console.log('identifying profile');
		var json = JSON.parse(request.responseText);
		console.log(json);

		if (request.status == 200) {
			var speaker = profileIds.filter(function(p){return p.profileId == json.identifiedProfile.profileId});

			if (speaker != null && speaker.length > 0){
				console.log('I think ' + speaker[0].name + ' was talking');
			} else {
				console.log('I couldn\'t tell who was talking. So embarrassing.');
			}
		} else {
			console.log(`Failed to submit for identification: got a ${request.status} response code.`);
			console.log(`${json.error.code}: ${json.error.message}`);
		}
	};
  
	request.send(blob);
}
const createTextIndependentVerificationProfileEndpoint = `${baseApi}/speaker/verification/v2.0/text-independent/profiles`;
const enrolTextIndependentVerificationProfileEndpoint = (profileId) => `${baseApi}/speaker/verification/v2.0/text-independent/profiles/${profileId}/enrollments?ignoreMinLength=false`;
const verifyTextIndependentProfileEndpoint = (profileId) => `${baseApi}/speaker/verification/v2.0/text-independent/profiles/${profileId}/verify`;

//-- Speaker Verification methods
// 1. Start the browser listening, listen for 6 seconds, pass the audio stream to "createVerificationProfile"
function enrollNewTextIndependentVerificationProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		onMediaSuccess(stream, createTextIndependentVerificationProfile, 6);
	}, onMediaError);
}

// createTextIndependentVerificationProfile calls the profile endpoint to get a profile Id, then calls enrollProfileAudioForVerification
function createTextIndependentVerificationProfile(blob){
	
	// just check if we've already fully enrolled this profile
	if (verificationProfile && verificationProfile.profileId) 
	{
		if (verificationProfile.remainingEnrollmentsSpeechLength == 0)
		{
			console.log("Verification enrollment already completed");
			return;
		} 
		else 
		{
			console.log("Verification enrollment time remaining: " + verificationProfile.remainingEnrollmentsSpeechLength);
			enrolTextIndependentProfileAudioForVerification(blob, verificationProfile.profileId);
			return;
		}
	}

	var request = new XMLHttpRequest();
	request.open("POST", createTextIndependentVerificationProfileEndpoint, true);
	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log(request.responseText);
		var json = JSON.parse(request.responseText);
		var profileId = json.profileId;
		verificationProfile.profileId = profileId;

		// Now we can enrol this profile with the profileId
		enrolTextIndependentProfileAudioForVerification(blob, profileId);
	};

	request.send(JSON.stringify({'locale' :'en-us'}));
}

// enrolTextIndependentProfileAudioForVerification enrols the recorded audio with the new profile Id
function enrolTextIndependentProfileAudioForVerification(blob, profileId){
	addAudioPlayer(blob);

	if (profileId == undefined)
	{
		console.log("Failed to create a profile for verification; try again");
		return;
	}
	  
	var request = new XMLHttpRequest();
	request.open("POST", enrolTextIndependentVerificationProfileEndpoint(profileId), true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
	request.onload = function () {
		console.log('enrolling');
		console.log(request.responseText);

		var json = JSON.parse(request.responseText);

		verificationProfile.remainingEnrollmentsSpeechLength = json.remainingEnrollmentsSpeechLength;
		if (verificationProfile.remainingEnrollmentsSpeechLength == 0) 
		{
			console.log("Verification should be enabled!")
		}
	};
  
	request.send(blob);
}

// 2. Start the browser listening, listen for 4 seconds, pass the audio stream to "verifyTextIndependentProfile"
function startListeningForTextIndependentVerification(){
	if (verificationProfile.profileId){
		console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, verifyTextIndependentProfile, 6)}, onMediaError);
	} else {
		console.log('No verification profile enrolled yet! Click the other button...');
	}
}

// 3. Take the audio and send it to the verification endpoint for the current profile Id
function verifyTextIndependentProfile(blob){
	addAudioPlayer(blob);
  
	var request = new XMLHttpRequest();
	request.open("POST", verifyTextIndependentProfileEndpoint(verificationProfile.profileId), true);
	
	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
  
	request.onload = function () {
		console.log('verifying profile');

		// Was it a match?
		console.log(JSON.parse(request.responseText));
	};
  
	request.send(blob);
}

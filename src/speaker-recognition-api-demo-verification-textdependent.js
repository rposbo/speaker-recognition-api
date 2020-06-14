const phrasesEndpoint = `${baseApi}/speaker/verification/v2.0/text-dependent/phrases/en-US`;
const createVerificationProfileEndpoint = `${baseApi}/speaker/verification/v2.0/text-dependent/profiles`;
const enrollVerificationProfileEndpoint = (profileId) => `${baseApi}/speaker/verification/v2.0/text-dependent/profiles/${profileId}/enrollments`;
const verifyProfileEndpoint = (profileId) => `${baseApi}/speaker/verification/v2.0/text-dependent/profiles/${profileId}/verify`;

//-- Speaker Verification methods
// Get the supported verification phrases
function getVerificationPhrases() {
	var request = new XMLHttpRequest();
	request.open("GET", phrasesEndpoint, true);

	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function(){ console.log(JSON.parse(request.responseText)); };
	request.send();
}

// 1. Start the browser listening, listen for 4 seconds, pass the audio stream to "createVerificationProfile"
function enrollNewVerificationProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... say one of the predefined phrases...');
		onMediaSuccess(stream, createVerificationProfile, 4);
	}, onMediaError);
}

// createVerificationProfile calls the profile endpoint to get a profile Id, then calls enrollProfileAudioForVerification
function createVerificationProfile(blob){
	
	// just check if we've already fully enrolled this profile
	if (verificationProfile && verificationProfile.profileId) 
	{
		if (verificationProfile.remainingEnrollmentsCount == 0)
		{
			console.log("Verification enrollment already completed");
			return;
		} 
		else 
		{
			console.log("Verification enrollments remaining: " + verificationProfile.remainingEnrollmentsCount);
			enrollProfileAudioForVerification(blob, verificationProfile.profileId);
			return;
		}
	}

	var request = new XMLHttpRequest();
	request.open("POST", createVerificationProfileEndpoint, true);
	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log(request.responseText);
		var json = JSON.parse(request.responseText);
		var profileId = json.profileId;
		verificationProfile.profileId = profileId;

		// Now we can enrol this profile with the profileId
		enrollProfileAudioForVerification(blob, profileId);
	};

	request.send(JSON.stringify({'locale' :'en-us'}));
}

// enrollProfileAudioForVerification enrolls the recorded audio with the new profile Id
function enrollProfileAudioForVerification(blob, profileId){
	addAudioPlayer(blob);

	if (profileId == undefined)
	{
		console.log("Failed to create a profile for verification; try again");
		return;
	}
	  
	var request = new XMLHttpRequest();
	request.open("POST", enrollVerificationProfileEndpoint(profileId), true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
	request.onload = function () {
		console.log('enrolling');
		console.log(request.responseText);

		var json = JSON.parse(request.responseText);

		// need 3 successful enrolled chunks of audio per profile id
		verificationProfile.remainingEnrollmentsCount = json.remainingEnrollmentsCount;
		if (verificationProfile.remainingEnrollmentsCount == 0) 
		{
			console.log("Verification should be enabled!")
		}
	};
  
	request.send(blob);
}

// 2. Start the browser listening, listen for 4 seconds, pass the audio stream to "verifyProfile"
function startListeningForVerification(){
	if (verificationProfile.profileId){
		console.log('I\'m listening... say your predefined phrase...');
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, verifyProfile, 4)}, onMediaError);
	} else {
		console.log('No verification profile enrolled yet! Click the other button...');
	}
}

// 3. Take the audio and send it to the verification endpoint for the current profile Id
function verifyProfile(blob){
	addAudioPlayer(blob);
  
	var request = new XMLHttpRequest();
	request.open("POST", verifyProfileEndpoint(verificationProfile.profileId), true);
	
	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
  
	request.onload = function () {
		console.log('verifying profile');

		// Was it a match?
		console.log(request.responseText);		
	};
  
	request.send(blob);
}


---

# AI Awesomeness
## The Speaker Recognition API
Robin Osborne - @rposbo

---

## Who on Earth is this guy talking at you?
### Hello!

Robin Osborne
Microsoft AI MVP
@rposbo - robinosborne.co.uk

---

Microsoft have been consistently ramping up their AI offerings over the past couple of years under the grouping of "**Cognitive Services**". These include some incredible offerings as services for things that would have required a degree in Maths and a deep understanding of Python to achieve, such as image recognition, video recognition, speech synthesis, intent analysis, sentiment analysis and so much more.

It's quite incredible to have the capability to ping an endpoint with an image and very quickly get a response containing a text description of the image contents. Surely we live in the future!

---

Examples of Cognitive Sevices

* image tags (use my blog)
* LUIS intent
    * examples of utterance to intent
        * "find me some retro movies about hacking" -> intent "movie search", entities: "genre: retro, keyword: hacking"
        * "tell me about River Pheonix" -> intent "actor search", entities: "name:river phoenix"

---

Cognitive Services listing page
(img)

---

Vision Services
(img)

---

Knowledge Services
(img)

---

Language Services
(img)

---

Speech Services
(img)

---

The Speaker Recognition API
(img)

## Speaker Recognition
One of the more recent Cognitive Services offerings is the [Speaker Recognition API](https://azure.microsoft.com/en-gb/services/cognitive-services/speaker-recognition/) which has two main features: **Speaker Verification** and **Speaker Identification**.

---

### Speaker Verification
The first one is intended to be used as a type of login or authentication; just buy talking a key phrase to your Cognitive Services enhanced app you can, with a degree of confidence, verify the user is who they (literally) say they are.

Each user is required to "enrol" by repeating a known phrase three times, clearly enough for the API to have a high confidence for that voice print. You can set this phrase yourself, which could be fun...

> Could this spell the end to the concept of the password? The usually-just-barely-complex-enough-to-pass-validation word with a capital letter at the start, and a number and an exclamation mark at the end that you increment the number for and reuse everywhere (am I close?). 

Yeah, that needs to be fixed. For those of you not willing to move to something like LastPass or 1Password (and you really really should if you can), perhaps speaking a phrase everywhere that is unique to your voice print is the answer.

However, one of the demo enrolment phases is indicative of an old nerd (like me) trolling the entire concept of using your voice as a means of authentication: "my voice is my passport, verify me" is the same voice print authentication used in the 1992 movie Sneakers, which sees Robert Redford and his gang "hack" into a system using a spliced recording of someone saying those key words:

<iframe width="560" height="315" src="https://www.youtube.com/embed/-zVgWpVXb64?rel=0" frameborder="0" allowfullscreen></iframe>

If you haven't seen this movie already, get on it! I love it. Classic retro hacking action. Plus Ben Kingsley is in it.

---

Example

Create -> Enrol -> Poll for Status

---

### Speaker Identification
For this flavour, instead of repeating a preset phrase three times, the user speaks for around 15 seconds or thereabouts (you get to define this) which is used to determine a voice print.

From now on you are able to send a segment of audio to the Speaker Identification API and receive a pretty speedy response which returns an enrolled user's id and a confidence level. This won't give you the high level of confidence you might get from the verification endpoint, but it will give a handy "I think this person is talking" response.

Imagine having a selection of panellists at a conference who have been enrolled, then as they're speaking that panellist's picture, name, and bio appear behind them on the screen automatically. Cool stuff.

---

Example

Create -> Enrol -> Poll for Status

---

Create Profile

```javascript
var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles';

var request = new XMLHttpRequest();
    request.open("POST", create, true);

    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

    request.onload = function (oEvent) {
        var json = JSON.parse(request.responseText);
        var profileId = json.identificationProfileId;

        enrollProfileAudio(blob, profileId);
    };

request.send(JSON.stringify({ 'locale' :'en-us'}));

```

---
Assign Audio to Profile (Enrol)

```javascript
function enrollProfileAudio(blob, profileId){
  var enroll = 
    'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/'
    + profileId +
    '/enroll?shortAudio=true';

  var request = new XMLHttpRequest();
  request.open("POST", enroll, true);
  
  request.setRequestHeader('Content-Type','multipart/form-data');
  request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

  request.onload = function () {
    var location = request.getResponseHeader('Operation-Location');

	if (location!=null) {
    	pollForEnrollment(location, profileId);
	} else {
		console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
	}
  };

  request.send(blob);
}
```

---
Check for Status

```javascript
function pollForEnrollment(location, profileId){
	var success = false;
	var enrolledInterval;

	enrolledInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);

		request.setRequestHeader('Content-Type','multipart/form-data');
		request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

		request.onload = function()
		{
			var json = JSON.parse(request.responseText);
            if (json.status == 'succeeded' && 
                json.processingResult.enrollmentStatus == 'Enrolled')
			{
				clearInterval(enrolledInterval);				
				console.log('Yey!');
			}
            else if(json.status == 'succeeded' && 
                    json.processingResult.remainingEnrollmentSpeechTime > 0) {
				clearInterval(enrolledInterval);
				console.log('That audio wasn\'t long enough to use');
			}
			else 
			{			
				console.log('Not done yet..');
			}
		};

		request.send();
	}, 2000);
}
```

---

## Use Cases - 

In May 2013 it was announced that Barclays Wealth was to use passive speaker recognition to verify the identity of telephone customers within 30 seconds of normal conversation.  The system used had been developed by voice recognition company Nuance (that in 2011 acquired the company Loquendo, the spin-off from CSELT itself for speech technology), the company behind Apple's Siri technology. A verified voiceprint was to be used to identify callers to the system and the system would in the future be rolled out across the company.
The private banking division of Barclays was the first financial services firm to deploy voice biometrics as the primary means to authenticate customers to their call centers. 93% of customer users had rated the system at "9 out of 10" for speed, ease of use and security.

cite: https://en.wikipedia.org/wiki/Speaker_recognition#Applications

---

## Go try them out
Pop on over to the [Speaker Recognition API](https://azure.microsoft.com/en-gb/services/cognitive-services/speaker-recognition/) page to have a play for yourself. Is this the future of passwords? What do you think?


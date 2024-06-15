
export function asrOfLocal(phrase: string,
  lang: string,
  onStart: () => void,
  onDelta: (text: string) => void,
  onDone: (text: string) => void,
  onMatch: (ok: boolean) => void,
  onError: (e: any) => void,
) {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

  // To ensure case consistency while checking with the returned output text
  phrase = phrase.toLowerCase();
  onStart();

  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase + ';';
  console.log(grammar);

  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event: any /* SpeechRecognitionEvent */) {
    console.log('SpeechRecognitionEvent: ', event.results);
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object 
    let isFinal = event.results[0].isFinal;
    let speechResult = event.results[0][0].transcript;
    if (isFinal) {
      onDone(speechResult);
      let s1 = removePunctuation(speechResult.toLowerCase());
      let s2 = removePunctuation(phrase);
      if (s1 === s2) {
        onMatch(true);
      } else {
        onMatch(false);
      }
    } else {
      onDelta(speechResult);
    }
  }

  recognition.onspeechend = function () {
    console.log('SpeechRecognition.onspeechend');
    recognition.stop();
  }

  recognition.onerror = function (event: any) {
    console.log('SpeechRecognition.onerror', event);
    onError(event.error)
  }

  recognition.onaudiostart = function (event: any) {
    //Fired when the user agent has started to capture audio.
    console.log('SpeechRecognition.onaudiostart');
  }

  recognition.onaudioend = function (event: any) {
    //Fired when the user agent has finished capturing audio.
    console.log('SpeechRecognition.onaudioend');
  }

  recognition.onend = function (event: any) {
    //Fired when the speech recognition service has disconnected.
    console.log('SpeechRecognition.onend');
  }

  recognition.onnomatch = function (event: any) {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    console.log('SpeechRecognition.onnomatch');
  }

  recognition.onsoundstart = function (event: any) {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log('SpeechRecognition.onsoundstart');
  }

  recognition.onsoundend = function (event: any) {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log('SpeechRecognition.onsoundend');
  }

  recognition.onspeechstart = function (event: any) {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log('SpeechRecognition.onspeechstart');
  }

  recognition.onstart = function (event: any) {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log('SpeechRecognition.onstart');
  }
}

function removePunctuation(str: string) {
  // 定义一个匹配所有标点符号的正则表达式
  const punctuationRegex = /[\s',，.。!！/、"〞〝;:：@\[\]`{—}-~\?？]+/g;

  // 使用 replace() 方法去掉标点符号
  return str.replace(punctuationRegex, '');
}
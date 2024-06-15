// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

declare namespace SpeechSynthesisUtterance {}
declare namespace SpeechSynthesisErrorEvent {}
declare namespace SpeechSynthesisEvent {}
declare namespace SpeechSynthesisUtteranceExt {}

declare global {
	interface Window {
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
		SpeechGrammarList: any;
		webkitSpeechGrammarList: any;
		SpeechRecognitionEvent: any;
		webkitSpeechRecognitionEvent: any;
	}
}

export { };
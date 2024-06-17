<script lang="ts">
	import { TranslateResult, TranslaterChannels, translate } from '$lib/translate';
	import { speechSynthesis, MSSpeechSynthesisUtterance } from '$lib/synth';
	import { asrOfLocal } from '$lib/asr';
	import { langEq } from '$lib/index';
	import { onMount } from 'svelte';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { initializeStores, getModalStore, Modal } from '@skeletonlabs/skeleton';
	import { type ModalSettings, type ModalComponent } from '@skeletonlabs/skeleton';

	import ModalComponentOne from '$lib/modals/ModalSetting.svelte';

	const modalRegistry: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		modalComponentOne: { ref: ModalComponentOne }
		// modalComponentTwo: { ref: ModalComponentTwo }
		// ...
	};

	let q = '';
	let lang = '';
	let result: TranslateResult = new TranslateResult();
	let error: any = undefined;

	let synth = speechSynthesis;
	let voices = synth.getVoices();
	let voice = voices[0];
	let boundary = '';

	let speechText = '';
	let speechMatch = false;

	let showProgressRadial = false;

	initializeStores();

	const modalStore = getModalStore();

	function play() {
		showProgressRadial = true;
		voice = voices.find((v) => langEq(v.Locale, result.sl)) || voices[0];
		const utterance = new MSSpeechSynthesisUtterance(result.query);
		utterance.lang = voice.Locale;
		utterance.onstart = (e) => {
			showProgressRadial = false;
		};
		utterance.onboundary = (e) => {
			boundary = e.utterance.text.substring(0, e.charIndex + e.charLength);
		};
		utterance.onend = (e) => {
			boundary = e.utterance.text;
			showProgressRadial = false;
		};
		utterance.onerror = (e) => {
			error = e.error;
			showProgressRadial = false;
		};
		synth.speak(utterance, voice);
	}

	onMount(() => {
		synth.onvoiceschanged = () => {
			voices = synth.getVoices();
			voice = voices[0];
		};
	});

	function handleTest() {
		const modal: ModalSettings = {
			type: 'component',
			// Data
			component: 'modalComponentOne',
			title: '欢迎使用两只猫',
			body: '初次使用，请先简单的设置一下你的语言和昵称.'
		};
		modalStore.trigger(modal);
	}

	function trans() {
		if (!lang) {
			lang = navigator.language;
		}

		showProgressRadial = true;
		translate(q, 'en', lang, TranslaterChannels.Edge)
			.then((data) => {
				result = data;
				q = '';
				showProgressRadial = false;
			})
			.catch((e) => {
				error = e;
				showProgressRadial = false;
			});
	}

	function handleKeydown(e: any) {
		if (e.key === 'Enter') {
			trans();
		}
	}

	function handleQueryWord(word: string) {}

	function handleCopyTrans() {}

	function handleSpeech() {
		asrOfLocal(
			result.query,
			result.sl,
			onSpeechStart,
			onSpeechDelta,
			onSpeechDone,
			onSpeechMatch,
			onSpeechError
		);
	}

	function onSpeechStart() {
		showProgressRadial = true;
	}

	function onSpeechDelta(text: string) {
		speechText = text;
	}

	function onSpeechDone(text: string): void {
		showProgressRadial = false;
		speechText = text;
	}

	function onSpeechMatch(ok: boolean): void {
		speechMatch = ok;
	}

	function onSpeechError(e: any): void {
		showProgressRadial = false;
		error = e;
	}
</script>

<title>🐈2Cats🐱 —— 一个多语言学习 APP</title>
<div class="container h-full mx-auto flex justify-center">
	<div class="space-y-10 text-center flex flex-col items-center w-9/12">
		<h2 class="h2">Welcome to TwoCats.</h2>
		<div class="input-group input-group-divider grid-cols-[1fr_auto]">
			<input type="search" placeholder="Search..." bind:value={q} on:keypress={handleKeydown} />
			<button class="variant-filled-primary" on:click={trans}>🔍</button>
		</div>
		<div class="w-full flex space-x-2">
			<button class="btn variant-filled" on:click={handleSpeech}> 背单词 </button>
			<button class="btn variant-filled" on:click={handleTest}> (TEST) </button>
			{#if showProgressRadial}
				<ProgressRadial width="w-10" />
			{/if}
		</div>
		<div class="w-full text-left space-y-3 my-3">
			{#if result.text}
				<p>{voice.ShortName}:</p>
				<div>
					{#each result.origSens as sent, i}
						<span id="orig-{i}">{sent}</span>
					{/each}
					<button class="btn variant-filled" on:click={play}>Play</button>
				</div>
				<div>
					{#each result.tranSens as sent, i}
						<span id="tran-{i}">{sent}</span>
					{/each}
					<span data-clipboard="translateElement" class="hidden">{result.text}</span>
					<button class="btn variant-filled" use:clipboard={{ element: 'translateElement' }}
						>Copy</button
					>
				</div>
			{:else}
				<p>NO RESULT</p>
			{/if}
			{#if speechText}
				<p>{speechText}</p>
				<p>{speechMatch}</p>
			{/if}
			{#if error}
				<p>{error}</p>
			{/if}
		</div>
	</div>
	<Modal components={modalRegistry} />
</div>

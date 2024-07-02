<script lang="ts">
	import { TranslaterChannels, translate } from '$lib/translate';
	import { speechSynthesis, MSSpeechSynthesisUtterance, type MSVoice } from '$lib/synth';
	import type { SvelteComponent } from 'svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { LANGUAGES } from '$lib';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	const displayNames = new Intl.DisplayNames([navigator.language], { type: 'language' });

	// Form Data
	const formData = {
		name: '',
		sl: navigator.language,
		svoice: {},
		tl: 'en',
		tvoice: {}
	};

	let langs = LANGUAGES;

	$: slregex = new RegExp(formData.sl.length == 2 ? `${formData.sl}-` : formData.sl, 'g');
	$: slmatches = (item: any) => (slregex ? slregex.test(item.Locale) : true);

	$: regex = new RegExp(formData.tl.length == 2 ? `${formData.tl}-` : formData.tl, 'g');
	$: matches = (item: any) => (regex ? regex.test(item.Locale) : true);

	function getReaderName(shortName: string, locale: string) {
		let name = shortName.substring(0, shortName.length - 6);
		return name.substring(locale.length + 1);
	}

	function getReaderShowName(item: any) {
		let lang = displayNames.of(item.Locale);
		let gender = item.Gender === 'Male' ? '♂' : '♀';
		let shortName = getReaderName(item.ShortName, item.Locale);
		return `${gender} ${shortName} - ${lang}`;
	}

	function handleSrcTryListen() {
		handleTryListen(formData.svoice)
	}

	function handleTarTryListen() {
		handleTryListen(formData.tvoice)
	}

	function isMSVoice(voice: any): voice is MSVoice {
		return (
			typeof voice.ShortName === 'string' &&
			typeof voice.Gender === 'string' &&
			typeof voice.Locale === 'string' &&
			typeof voice.FriendlyName === 'string' &&
			typeof voice.SuggestedCodec === 'string'
		);
	}

	function handleTryListen(voice: any) {
		if (isMSVoice(voice)) {
			let readerName: string = getReaderName(voice.ShortName, voice.Locale);
			translate(
				`Hello, my name is ${readerName}, this is a preview audio, welcome to use the Two Cats APP.`,
				'en',
				voice.Locale,
				TranslaterChannels.Edge
			)
				.then((data) => {
					playTryListen(voice, data.text);
				})
				.catch((e) => {});
		}
	}

	function playTryListen(voice: any, text: string) {
		if (isMSVoice(voice)) {
			const utterance = new MSSpeechSynthesisUtterance(text);
			utterance.lang = voice.Locale;
			utterance.onstart = (e) => {};
			utterance.onboundary = (e) => {};
			utterance.onend = (e) => {};
			speechSynthesis.speak(utterance, voice);
		}
	}

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<form class="modal-form {cForm}">
			<label class="label">
				<span>昵称</span>
				<input class="input" type="text" bind:value={formData.name} placeholder="你的昵称..." />
			</label>
			<label class="label">
				<span>你的母语</span>
				<select class="select" bind:value={formData.sl}>
					{#each langs as v, i}
						<option value={v[0]}>{displayNames.of(v[0])}</option>
					{/each}
				</select>
			</label>
			<label class="label">
				<span>母语朗读人</span>
				<select class="select" bind:value={formData.svoice}>
					{#each $modalStore[0].meta.ms_readers.filter(slmatches) as v, i}
						<option value={v}> {getReaderShowName(v)}</option>
					{/each}
				</select>
			</label>
			<button class="btn variant-filled" on:click={handleSrcTryListen}>试听 ▶</button>
			<label class="label">
				<span>你想学习或翻译的语言</span>
				<select class="select" bind:value={formData.tl}>
					{#each langs as v, i}
						<option value={v[0]}>{displayNames.of(v[0])}</option>
					{/each}
				</select>
			</label>
			<label class="label">
				<span>目标朗读人</span>
				<select class="select" bind:value={formData.tvoice}>
					{#each $modalStore[0].meta.ms_readers.filter(matches) as v, i}
						<option value={v}> {getReaderShowName(v)}</option>
					{/each}
				</select>
			</label>
			<button class="btn variant-filled" on:click={handleTarTryListen}>试听 ▶</button>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>{parent.buttonTextSubmit}</button>
		</footer>
	</div>
{/if}

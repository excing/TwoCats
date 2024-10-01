<script>
	import { I18N } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';
	import AutoLineHeightInput from './AutoLineHeightInput.svelte';

	const dispatch = createEventDispatcher();

	const TYPE_USER_TRANSLATE = 0;
	const TYPE_USER_SEARCH_WORD = 1;
	const _types = [TYPE_USER_TRANSLATE, TYPE_USER_SEARCH_WORD];

	export let type = TYPE_USER_SEARCH_WORD;
	export let userMessage = '';

	function onSendUserMessage() {
		if (TYPE_USER_TRANSLATE === type) {
			dispatch('translateText', userMessage);
		} else {
			dispatch('searchWord', userMessage);
		}
	}

	function onSwitchType() {
		let i = 0;
		for (; i < _types.length; i++) {
			const element = _types[i];
			if (type === element) {
				break;
			}
		}
		if (_types.length <= i + 1) {
			type = _types[0];
		} else {
			type = _types[i + 1];
		}
	}
</script>

<div class="flex items-end justify-center">
	<button type="button" class="btn-icon btn-icon-lg variant-filled mx-1" on:click={onSwitchType}>
		{#if TYPE_USER_TRANSLATE === type}
			<i class="fa-solid fa-language"></i>
		{:else}
			<i class="fa-solid fa-magnifying-glass"></i>
		{/if}
	</button>
	<AutoLineHeightInput placeholder={I18N.enterSomeContentPlaceholder} bind:value={userMessage}
	></AutoLineHeightInput>
	<button
		type="button"
		title={I18N.enterSomeContentPlaceholder}
		class="btn variant-filled mx-1"
		on:click={onSendUserMessage}
	>
		<i class="fa-solid fa-paper-plane"></i>
		<span>Send</span>
	</button>
</div>

<svelte:window
	on:keydown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSendUserMessage()}
/>

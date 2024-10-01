<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LanguageSeletct from './LanguageSeletct.svelte';
	import { UserInputTypes } from './Types';
	import UserTextInput from './UserTextInput.svelte';

	export let type = UserInputTypes.UserSearchWord;

	export let userMessage = '';

	const dispatch = createEventDispatcher();

	function onContent(e: CustomEvent) {
		dispatch('content', {
			type: type,
			content: e.detail
		});
	}

	function onSearchWord(e: CustomEvent) {
		dispatch('content', {
			type: UserInputTypes.UserSearchWord,
			content: e.detail
		});
	}

	function onTranslateText(e: CustomEvent) {
		dispatch('content', {
			type: UserInputTypes.UserTranslate,
			content: e.detail
		});
	}
</script>

{#if type === UserInputTypes.UserSearchWord}
	<UserTextInput
		type={1}
		bind:userMessage
		on:searchWord={onSearchWord}
		on:translateText={onTranslateText}
	/>
{:else if type === UserInputTypes.UserTranslate}
	<UserTextInput
		type={0}
		bind:userMessage
		on:searchWord={onSearchWord}
		on:translateText={onTranslateText}
	/>
{:else if type === UserInputTypes.UserSelectMainLanguage}
	<LanguageSeletct on:content={onContent} />
{:else}
	<UserTextInput bind:userMessage on:searchWord={onSearchWord} on:translateText={onTranslateText} />
{/if}

<script lang="ts">
	import { displayLangName, LANGUAGES } from '$lib';
	import { onMount } from 'svelte';
	import UserSelectInput from './UserSelectInput.svelte';

	let langs: any[] = [];

	onMount(() => {
		let locales = navigator.language;
		let _langs = [{ name: displayLangName(locales, locales), value: locales }];
		for (let i = 0; i < LANGUAGES.length; i++) {
			const el = LANGUAGES[i];
			if (locales !== el[0]) {
				_langs.push({ name: displayLangName(locales, el[0]), value: el[0] });
			}
		}
		langs = _langs;
	});
</script>

<UserSelectInput bind:optionList={langs} on:content />

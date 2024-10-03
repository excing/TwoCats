<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	type Option = {
		name: string;
		value: string;
	};

	const dispatch = createEventDispatcher();

	export let optionList: Option[] = [];

	let userOption: Option;

	$: {
		if (!userOption) userOption = optionList[0];
	}

	function onSendUserOptions(option: Option) {
		dispatch('content', option);
	}
</script>

<div class="flex flex-wrap justify-center items-end space-x-2 space-y-2 box">
	<div class="btn-group variant-filled">
		<select class="variant-filled" bind:value={userOption}>
			{#each optionList as option, i}
				<option value={option}>{option.name}</option>
			{/each}
		</select>
		<button
			on:click={() => {
				onSendUserOptions(userOption);
			}}><i class="fa-solid fa-check"></i></button
		>
	</div>
</div>

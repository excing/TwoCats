<script lang="ts">
	import { I18N } from '$lib/i18n';
	import AutoLineHeightInput from '$lib/components/AutoLineHeightInput.svelte';

	export let userMessage = '';
	export let commandList: string[] = [];

	function onSendUserMessage() {}
</script>

{#if commandList && 0 < commandList.length}
	<div class="flex flex-wrap justify-center items-end space-x-2 space-y-2 box">
		<!-- {#each commandList as command}
			<button class="btn btn-sm variant-filled">{command}</button>
		{/each} -->
		<button class="btn btn-sm variant-filled">{commandList[0]}</button>
		<select class="btn btn-sm variant-filled">
			{#each commandList as command}
				<option value="command">{command}</option>
			{/each}
		</select>
	</div>
{:else}
	<div class="flex items-end justify-center">
		<button type="button" class="btn-icon variant-filled-secondary mx-1">🛠</button>
		<AutoLineHeightInput placeholder={I18N.enterSomeContentPlaceholder} bind:value={userMessage}
		></AutoLineHeightInput>
		<button type="button" class="btn variant-filled-secondary mx-1" on:click={onSendUserMessage}>
			Send
		</button>
	</div>
{/if}
<svelte:window
	on:keydown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSendUserMessage()}
/>

<style>
	.box {
		max-height: 80px;
		overflow-y: hidden;
	}
</style>

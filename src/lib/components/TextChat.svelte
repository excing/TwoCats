<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import DateTimeText from './DateTimeText.svelte';

	export let dir = 0;
	export let username = '';
	export let content = '';
	export let avatar = '';
	export let time = new Date();
</script>

<div class="grid {0 === dir ? 'grid-cols-[1fr_auto]' : 'grid-cols-[auto_1fr]'} gap-2">
	{#if 0 !== dir}
		<Avatar src={avatar} width="w-12" />
	{/if}
	<div
		class="card p-4 {0 === dir
			? 'rounded-tr-none variant-soft-secondary'
			: 'rounded-tl-none variant-soft'} space-y-2"
	>
		<header class="flex justify-between items-center">
			<p class="font-bold">{username}</p>
			<DateTimeText {time}></DateTimeText>
		</header>
		<p>{content}</p>
	</div>
	{#if 0 === dir}
		<Avatar src={avatar} width="w-12" />
	{/if}
</div>

<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import DateTimeText from './DateTimeText.svelte';

	import { createEventDispatcher } from 'svelte';
	import { UserInputTypes } from './Types';

	const dispatch = createEventDispatcher();

	function handleSegment(segmentText: string) {
		dispatch('content', {
			type: UserInputTypes.UserSearchWord,
			content: segmentText
		});
	}

	export let dir = 0;
	// export let username = '';
	export let content: any;
	// export let avatar = '';
	export let time = new Date();
</script>

<div class="flex gap-2">
	{#if 0 === dir}
		<div class="flex-1"></div>
	{/if}
	<div
		style="width: fit-content; max-width: 95%"
		class="card p-4 {0 === dir ? 'variant-soft-secondary' : 'variant-soft'} space-y-2"
	>
		<header class="flex justify-between items-center">
			<!-- <p class="font-bold">{username}</p> -->
			<DateTimeText {time}></DateTimeText>
		</header>

		<div>
			{#each content as { pos, terms }}
				<div style="word-break: break-all;">
					<span style="font-weight: 600;">{pos}.</span>

					{#each terms as term}
						<!-- <span class="chip variant-filled m-1">{term}</span> -->
						<span class="mx-1"><a
							style="font-weight: 400;"
							href="#{term}"
							on:click={() => {
								handleSegment(term);
							}}>{term}</a>;</span>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

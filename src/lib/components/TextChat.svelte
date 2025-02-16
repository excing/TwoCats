<script lang="ts">
	import DateTimeText from './DateTimeText.svelte';
	import { createEventDispatcher } from 'svelte';
	import { UserInputTypes } from './Types';

	const dispatch = createEventDispatcher();

	export let dir = 0;
	export let content: any;
	export let time = new Date();

	function segmentText(text: string) {
		// 创建一个 Intl.Segmenter 实例，指定语言和粒度（'word' 表示按词分隔）
		const segmenter = new Intl.Segmenter('en', { granularity: 'word' });

		// 使用 segmenter.segment 方法进行分词
		let segments = segmenter.segment(text);

		// 遍历分词结果
		for (const segment of segments) {
			console.log(segment); // 输出每个词
		}

		return segments;
	}

	function handleSegment(segmentText: string) {
		dispatch('content', {
			type: UserInputTypes.UserSearchWord,
			content: segmentText
		});
	}

	function handlePlayAudio() {
		dispatch('play', {
			content: content
		});
	}
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
			<DateTimeText {time}></DateTimeText>

			<button class="btn-icon btn-icon-sm" on:click={handlePlayAudio}
				><span class="w-3"
					><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
						><path
							d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
						/></svg
					></span
				></button
			>
		</header>
		<p>
			{#each segmentText(content) as seg}
				{#if seg.isWordLike}
					<a
						style="font-weight: 400;"
						href="#{seg.segment}"
						on:click={() => {
							handleSegment(seg.segment);
						}}>{seg.segment}</a
					>
				{:else}
					<span>{seg.segment}</span>
				{/if}
			{/each}
		</p>
	</div>
</div>

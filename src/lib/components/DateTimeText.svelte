<script lang="ts">
	import { onMount } from 'svelte';

	export let time = new Date();

	let timeText = 'Just now';

	onMount(() => {
		timeText = new Intl.DateTimeFormat('default', {
			dateStyle: 'short',
			timeStyle: 'short'
		}).format(time);
	});
</script>

<small class="opacity-50">{timeText}</small>

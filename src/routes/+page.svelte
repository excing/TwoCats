<script lang="ts">
	import { onMount } from 'svelte';
	import { Message, User } from '$lib/entity';
	import { randomUUID } from '$lib/utils';
	import { Avatar } from '@skeletonlabs/skeleton';
	import DateTimeText from '$lib/components/DateTimeText.svelte';
	import UserContentInput from '$lib/components/UserContentInput.svelte';
	import { UserInputTypes } from '$lib/components/Types';

	let systemUid = randomUUID();
	let userId = randomUUID();
	let cid = randomUUID();
	let userMessage = '';

	let userInputType = UserInputTypes.UserTranslate;

	const _01 = [
		'欢迎使用两猫多语言学习和查询 APP, 我们使用对话的形式完成所有操作，比如学习、查询、翻译等，希望可以带给你一些不一样的使用体验。',
		'现在，请先选择你日常使用的语言。'
	];

	let messages: Message[] = [];

	let elemChat: HTMLElement;

	onMount(() => {
		elemChat.style.maxHeight = `${elemChat.clientHeight}px`;

		let system = new User();
		system.id = systemUid;
		system.name = 'SYSTEM';
		for (let i = 0; i < _01.length; i++) {
			const element = _01[i];
			let msg = new Message(cid, system);
			msg.content = element;
			messages = [...messages, msg];
		}

		userInputType = UserInputTypes.UserSelectMainLanguage;
	});

	function scrollChatBottom(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	function onUserContent(event: CustomEvent) {
		let user = new User();
		user.id = userId;
		user.name = 'USER';
		let msg = new Message(cid, user);
		msg.content = event.detail.content.name;
		messages = [...messages, msg];
		// 消息列表置底
		setTimeout(() => {
			scrollChatBottom('smooth');
		}, 0);

		userInputType = UserInputTypes.UserSearchWord;
	}
</script>

<title>🐈2Cats🐱 —— 一个多语言学习 APP</title>
<div class="flex h-full">
	<div class="flex-1"></div>
	<div style="width: 680px;" class="flex flex-col h-full p-2 space-y-4">
		<div class="flex-1 overflow-y-auto space-y-4" bind:this={elemChat}>
			{#each messages as { user, content, time }}
				{#if user.id === userId}
					<div class="grid grid-cols-[1fr_auto] gap-2">
						<div class="card p-4 rounded-tr-none space-y-2 variant-ghost-primary">
							<header class="flex justify-between items-center">
								<p class="font-bold">{user.name}</p>
								<DateTimeText {time}></DateTimeText>
							</header>
							<p>{content}</p>
						</div>
						<Avatar src="/favicon.png" width="w-12" />
					</div>
				{:else}
					<div class="grid grid-cols-[auto_1fr] gap-2">
						<Avatar src="/favicon.png" width="w-12" />
						<div class="card p-4 rounded-tl-none space-y-2 variant-ghost-surface">
							<header class="flex justify-between items-center">
								<p class="font-bold">{user.name}</p>
								<DateTimeText {time}></DateTimeText>
							</header>
							<p>{content}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
		<UserContentInput bind:type={userInputType} bind:userMessage on:content={onUserContent} />
	</div>
	<div class="flex-1"></div>
</div>

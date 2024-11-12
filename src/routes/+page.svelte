<script lang="ts">
	import { onMount } from 'svelte';
	import { Message, User } from '$lib/entity';
	import { randomUUID } from '$lib/utils';
	import UserContentInput from '$lib/components/UserContentInput.svelte';
	import { ChatTypes, UserInputTypes } from '$lib/components/Types';
	import TextChat from '$lib/components/TextChat.svelte';
	import { getUserSettings, opendb } from '$lib/db';

	const cid = randomUUID();

	let userMessage = '';

	let userInputType = UserInputTypes.UserSearchWord;

	// const _01 = [
	// 	'欢迎使用两猫多语言学习和查询 APP, 我们使用对话的形式完成所有操作，比如学习、查询、翻译等，希望可以带给你一些不一样的使用体验。',
	// 	'现在，请先完成一些简单的设置。'
	// ];

	let messages: Message[] = [];

	let elemChat: HTMLElement;

	let user = new User();
	let system = new User();

	const init = () => {
		opendb()
			.then(({ page, db }: any) => {
				return Promise.all([page(db, new User()), page(db, new Message(), -1)]);
			})
			.then((values) => {
				values[0].arr?.forEach((u: User) => {
					if (u.role === 'user') {
						user = u;
					} else if (u.role === 'system') {
						system = u;
					}
				});
				messages = values[1].arr;
			})
			.then(() => {
				// 消息列表置底
				setTimeout(() => {
					scrollChatBottom('smooth');
				}, 0);
			});
	};

	onMount(() => {
		elemChat.style.maxHeight = `${elemChat.clientHeight}px`;

		init();
	});

	function scrollChatBottom(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	function onUserContent(event: CustomEvent) {
		let msg = new Message();
		msg.cid = cid;
		msg.uid = user.uuid;
		msg.user = user;
		msg.content = event.detail.content;
		msg.type = event.detail.type;
		messages = [...messages, msg];
		// 消息列表置底
		setTimeout(() => {
			scrollChatBottom('smooth');
		}, 0);

		userInputType = UserInputTypes.UserSearchWord;
		userMessage = '';

		opendb()
			.then(({ insert, db }: any) => {
				return insert(db, msg);
			})
			.then(() => {
				console.log('success');
			});
	}
</script>

<title>🐈2Cats🐱 —— 一个多语言学习 APP</title>
<div class="flex h-full">
	<div class="flex-1"></div>
	<div style="width: 680px;" class="flex flex-col h-full p-2 space-y-4">
		<div class="flex-1 overflow-y-auto space-y-4" bind:this={elemChat}>
			{#each messages as { user, content, time }}
				<TextChat
					dir={user.role === 'user' ? 0 : 1}
					username={user.name}
					{time}
					avatar="/favicon.png"
					{content}
				/>
			{/each}
		</div>
		<UserContentInput bind:type={userInputType} bind:userMessage on:content={onUserContent} />
	</div>
	<div class="flex-1"></div>
</div>

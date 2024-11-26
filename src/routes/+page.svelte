<script lang="ts">
	import { onMount } from 'svelte';
	import { Message, User } from '$lib/entity';
	import { randomUUID } from '$lib/utils';
	import UserContentInput from '$lib/components/UserContentInput.svelte';
	import { ChatTypes, UserInputTypes } from '$lib/components/Types';
	import TextChat from '$lib/components/TextChat.svelte';
	import { getUserSettings, opendb, type AppDB } from '$lib/db';
	import { translate } from '$lib/translate';
	import { franc, francAll } from 'franc';

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
			.then(({ page, db }: AppDB) => {
				return page(db, new User());
			})
			.then(({ page, db, result }: AppDB) => {
				result?.forEach((u: User) => {
					if (u.role === 'user') {
						user = u;
					} else if (u.role === 'system') {
						system = u;
					}
				});
				return page(db, new Message(), -1);
			})
			.then(({ close, db, result }: AppDB) => {
				messages = result;
				return close(db);
			})
			.then(() => {
				// 消息列表置底
				scrollChatBottom('smooth');
			});
	};

	onMount(() => {
		elemChat.style.maxHeight = `${elemChat.clientHeight}px`;
		elemChat.addEventListener('scroll', (e) => {
			if (elemChat.scrollTop === 0) {
				// console.log('load prev more');

				opendb()
					.then(({ page, db }) => {
						// console.log('load prev more start msg: ', messages[0]);

						return page(db, new Message().copy(messages[0]), -1);
					})
					.then(({ close, db, result }) => {
						if (!result || result.length <= 0) return;

						messages = [...result, ...messages];

						close(db);
						// console.log('load prev more success', arr);
					});
			}
		});

		init();
	});

	function scrollChatBottom(behavior?: ScrollBehavior): void {
		setTimeout(() => {
			elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
		}, 10);
	}

	function onUserContent(event: CustomEvent) {
		let msg = new Message();
		msg.cid = cid;
		msg.uid = user.uuid;
		msg.user = user;
		msg.content = event.detail.content;
		msg.type = event.detail.type;

		userInputType = UserInputTypes.UserSearchWord;
		userMessage = '';

		let langs = francAll(msg.content, { only: ['eng', 'cmn'], minLength: 3 });
		let language = langs[0][0];
		console.log();
		language = language === 'cmn' ? 'zh-CN' : language;
		language = language === 'eng' ? 'en' : language;
		console.log(msg.content, language);

		let sl = language === 'und' ? user.settings.language : language;
		let tl = system.settings.language;
		console.log(sl, tl, user.settings, system.settings);

		if (language === system.settings.language) {
			tl = user.settings.language;
		}

		opendb()
			.then(({ insert, db }) => {
				return insert(db, msg);
			})
			.then(async ({ insert, db }) => {
				messages = [...messages, msg];
				// 消息列表置底
				scrollChatBottom('smooth');

				const { text } = await translate(msg.content, sl, tl);
				let msg1 = new Message();
				msg1.cid = cid;
				msg1.uid = system.uuid;
				msg1.user = system;
				msg1.content = text;
				msg1.type = '';
				return await insert(db, msg1);
			})
			.then(({ result }) => {
				messages = [...messages, result];
				scrollChatBottom('smooth');
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

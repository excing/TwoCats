<script lang="ts">
	import { onMount } from 'svelte';
	import { Message, User } from '$lib/entity';
	import { randomUUID } from '$lib/utils';
	import UserContentInput from '$lib/components/UserContentInput.svelte';
	import { ChatTypes, UserInputTypes } from '$lib/components/Types';
	import TextChat from '$lib/components/TextChat.svelte';
	import { getUserSettings, opendb, type AppDB } from '$lib/db';
	import { translate, TranslaterChannels } from '$lib/translate';
	import { franc, francAll } from 'franc';
	import { isMSVoice, MSSpeechSynthesisUtterance, speechSynthesis, type MSVoice } from '$lib/synth';
	import DictChat from '$lib/components/DictChat.svelte';

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
		switch (langs[0][0]) {
			case 'und':
			case 'cmn':
				language = 'zh-CN';
				break;
			case 'eng':
				language = 'en';
			default:
				break;
		}

		const userlang = user.settings.language;
		const syslang = system.settings.language;

		let sl = language;
		let tl = language === syslang ? userlang : syslang;

		let svoice = language === userlang ? user.settings.voice : system.settings.voice;
		let tvoice = language === syslang ? user.settings.voice : system.settings.voice;

		opendb()
			.then(({ insert, db }) => {
				return insert(db, msg);
			})
			.then(async ({ insert, db }) => {
				messages = [...messages, msg];
				// 消息列表置底
				scrollChatBottom('smooth');

				const { text, dict } = await translate(msg.content, sl, tl, TranslaterChannels.Chrome);
				let msg1 = new Message();
				msg1.cid = cid;
				msg1.uid = system.uuid;
				msg1.user = system;
				if (dict) {
					msg1.content = dict;
					msg1.type = 'dict';
				} else {
					msg1.content = text;
					msg1.type = 'text';
				}
				return await insert(db, msg1);
			})
			.then(({ result }) => {
				messages = [...messages, result];
				scrollChatBottom('smooth');
			});
	}

	function onPlayContent(event: CustomEvent) {
		let content = event.detail.content;
		let voice = contentVoice(content);
		if (isMSVoice(voice)) {
			new Audio(
				`https://pubapi.blendiv.com/ms/tts?text=${content}&lang=${voice.Locale}&voice=${voice.ShortName}&rate=0.7&bearer=602dec30-02a4-4575-9c27-540505caabaf`
			).play();
		}
	}

	function contentVoice(content: string) {
		let langs = francAll(content, { only: ['eng', 'cmn'], minLength: 3 });
		let language = langs[0][0];
		switch (langs[0][0]) {
			case 'und':
			case 'cmn':
				language = 'zh-CN';
				break;
			case 'eng':
				language = 'en';
			default:
				break;
		}

		const userlang = user.settings.language;

		let svoice = language === userlang ? user.settings.voice : system.settings.voice;

		return svoice;
	}

	function onRemberWord() {
		// 记单词

		let msg = new Message();
		msg.cid = cid;
		msg.uid = user.uuid;
		msg.user = user;
		msg.content = '开始记单词';
		msg.type = '';

		messages = [...messages, msg];

		scrollChatBottom('smooth');
	}
</script>

<title>🐈2Cats🐱 —— 一个多语言学习 APP</title>
<div class="flex h-full">
	<div class="flex-1"></div>
	<div style="width: 680px;" class="flex flex-col h-full p-2 space-y-4">
		<div class="flex-1 overflow-y-auto space-y-4" bind:this={elemChat}>
			{#each messages as { user, type, content, time }}
				{#if type === 'dict'}
					<DictChat
						dir={user.role === 'user' ? 0 : 1}
						{time}
						{content}
						on:content={onUserContent}
					/>
					<!-- {:else if type === 'text'}
					<TextChat
						dir={user.role === 'user' ? 0 : 1}
						username={user.name}
						{time}
						avatar="/favicon.png"
						{content}
					/> -->
				{:else}
					<TextChat
						dir={user.role === 'user' ? 0 : 1}
						{time}
						{content}
						on:content={onUserContent}
						on:play={onPlayContent}
					/>
				{/if}
			{/each}
		</div>
		<div>
			<button class="chip variant-filled" on:click={onRemberWord}>记单词</button>
		</div>
		<UserContentInput bind:type={userInputType} bind:userMessage on:content={onUserContent} />
	</div>
	<div class="flex-1"></div>
</div>

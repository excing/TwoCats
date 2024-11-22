<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, ProgressRadial } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	import { opendb } from '$lib/db';
	import { User, UserSettings } from '$lib/entity';
	import { randomUUID } from '$lib/utils';

	// 0: 页面加载中；1: 新用户引导设置；2: 主页
	let style = 0;

	onMount(() => {
		opendb()
			.then(({ page, db }: any) => {
				return page(db, new User());
			})
			.then(({ arr }: any) => {
				if (0 < arr.length) {
					style = 3;
				} else {
					let user = new User();
					user.uuid = randomUUID();
					user.name = 'You';
					user.role = 'user';
					user.type = 'guest';
					let userSettings = new UserSettings();
					userSettings.language = navigator.language;
					userSettings.voice = {
						Name: 'Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)',
						ShortName: 'zh-CN-XiaoxiaoNeural',
						Gender: 'Female',
						Locale: 'zh-CN',
						SuggestedCodec: 'audio-24khz-48kbitrate-mono-mp3',
						FriendlyName: 'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
						Status: 'GA',
						VoiceTag: {
							ContentCategories: ['News', 'Novel'],
							VoicePersonalities: ['Warm']
						}
					};
					user.settings = userSettings;

					let system = new User();
					system.uuid = randomUUID();
					system.name = 'System';
					system.role = 'system';
					system.type = 'system';
					let systemSettings = new UserSettings();
					systemSettings.language = 'en';
					systemSettings.voice = {
						Name: 'Microsoft Server Speech Text to Speech Voice (en-GB, SoniaNeural)',
						ShortName: 'en-GB-SoniaNeural',
						Gender: 'Female',
						Locale: 'en-GB',
						SuggestedCodec: 'audio-24khz-48kbitrate-mono-mp3',
						FriendlyName: 'Microsoft Sonia Online (Natural) - English (United Kingdom)',
						Status: 'GA',
						VoiceTag: {
							ContentCategories: ['General'],
							VoicePersonalities: ['Friendly', 'Positive']
						}
					};
					system.settings = systemSettings;

					opendb()
						.then(({ insert, db }: any) => {
							return Promise.all([insert(db, user), insert(db, system)]);
						})
						.then(() => {
							style = 3;
						});
				}
			});
	});
</script>

<!-- todo -->
<!-- if 未加载结果，则显示加载页面 -->
<!-- if 用户未初始化，则显示用户初始化全屏对话框 -->
<!-- 最后显示 APP 主页面 -->
<!-- App Shell -->
{#if 0 === style}
	<!-- if 未加载结果，则显示加载页面 -->
	<title>🐈2Cats🐱 —— 一个多语言学习 APP</title>

	<div class="m-8">
		<LightSwitch />
	</div>
	<div class="flex justify-center my-36">
		<ProgressRadial />
	</div>
{:else if 1 === style}
	<!-- if 用户未初始化，则显示用户初始化全屏对话框 -->
{:else if 3 === style}
	<!-- Page Route Content -->
	<div class="w-full h-full flex flex-col overflow-hidden">
		<div class=" w-full flex-none z-10">
			<div class="w-full flex items-center bg-surface-100-800-token p-4">
				<a href="/" rel="noreferrer" class="">
					<strong class="text-3xl uppercase">🐱🐱</strong>
				</a>
				<div class="flex-1"></div>
				<div class="flex items-center space-x-2">
					<a class="btn btn-sm variant-ghost-surface" href="/ft" rel="noreferrer"> Feature </a>
					<a
						class="btn btn-sm variant-ghost-surface"
						href="https://github.com/excing/TwoCats"
						target="_blank"
						rel="noreferrer"
					>
						GitHub
					</a>
					<LightSwitch />
				</div>
			</div>
		</div>
		<slot />
	</div>
{:else}
	<AppShell>
		<svelte:fragment slot="header">
			<!-- App Bar -->
			<AppBar>
				<svelte:fragment slot="lead">
					<a href="/" rel="noreferrer">
						<strong class="text-3xl uppercase">🐱🐱</strong>
					</a>
				</svelte:fragment>
				<svelte:fragment slot="trail">
					<a class="btn btn-sm variant-ghost-surface" href="/ft" rel="noreferrer"> Feature </a>
					<a
						class="btn btn-sm variant-ghost-surface"
						href="https://github.com/excing/TwoCats"
						target="_blank"
						rel="noreferrer"
					>
						GitHub
					</a>
					<LightSwitch />
				</svelte:fragment>
			</AppBar>
		</svelte:fragment>
		<!-- Page Route Content -->
		<slot />
	</AppShell>
{/if}

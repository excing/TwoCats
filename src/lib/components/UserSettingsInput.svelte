<script lang="ts">
	import { initializeStores, getModalStore, Modal } from '@skeletonlabs/skeleton';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';

	import { saveUserSettings, getUserSettings } from '$lib/db';
	import ModalComponentOne from '$lib/modals/ModalSetting.svelte';

	const modalRegistry: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		modalComponentOne: { ref: ModalComponentOne }
		// modalComponentTwo: { ref: ModalComponentTwo }
		// ...
	};

	initializeStores();

	const modalStore = getModalStore();

	function handleStartSettings() {
		const modal: ModalSettings = {
			type: 'component',
			// Data
			component: 'modalComponentOne',
			title: '欢迎使用两只猫',
			body: '初次使用，请先简单的设置一下你的语言和昵称.',
			meta: {
				save_form: getUserSettings()
			},
			response: (r: any) => {
				if (r) {
					saveUserSettings(r);
				}
			}
		};
		modalStore.trigger(modal);
	}
</script>

<button class="btn variant-filled" on:click={handleStartSettings}>开始设置</button>
<Modal components={modalRegistry} />

<script lang="ts">
	export let placeholder = '';

	export let value = '';
</script>

<div
	class="enterSomeContentStyle textarea"
	contenteditable="plaintext-only"
	bind:innerHTML={value}
	{placeholder}
></div>

<style>
	.enterSomeContentStyle {
		width: 100%;
		height: auto;
		max-height: 140px;
		overflow: auto;
		transition-property:
			color,
			background-color,
			border-color,
			text-decoration-color,
			fill,
			stroke,
			opacity,
			box-shadow,
			transform,
			filter,
			backdrop-filter,
			-webkit-backdrop-filter;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 200ms;
		border-width: var(--theme-border-base);
		padding-top: 0.5rem;
		padding-right: 0.75rem;
		padding-bottom: 0.5rem;
		padding-left: 0.75rem;
		font-size: 1rem;
		line-height: 1.5rem;
		--tw-shadow: 0 0 #0000;
		appearance: none;
		resize: vertical;
		font-family: inherit;
		font-feature-settings: inherit;
		font-variation-settings: inherit;
		font-weight: inherit;
		letter-spacing: inherit;
		color: inherit;
		margin: 0;
		--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width)
			var(--tw-ring-offset-color) !important;
		--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width))
			var(--tw-ring-color) !important;
		box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;
		outline: none;
	}

	.enterSomeContentStyle:empty::before {
		content: attr(placeholder);
		opacity: 0.6;
	}
</style>

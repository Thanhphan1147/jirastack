<script lang="ts">
	interface Props {
		ticketKey: string;
		onsubmit: () => void;
	}

	let { ticketKey, onsubmit }: Props = $props();

	let description = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);

	let isEmpty = $derived(!description.trim());

	async function handleSubmit() {
		if (isEmpty || submitting) return;

		submitting = true;
		errorMsg = null;

		try {
			const res = await fetch(`/api/tickets/${ticketKey}/description`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description: description.trim() })
			});

			if (!res.ok) {
				const data = await res.json();
				errorMsg = data.error || 'Failed to update description';
				return;
			}

			description = '';
			onsubmit();
		} catch {
			errorMsg = 'Failed to connect to server';
		} finally {
			submitting = false;
		}
	}
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="mt-6 space-y-3">
	<label for="description-editor" class="sr-only">Description for {ticketKey}</label>
	<textarea
		id="description-editor"
		bind:value={description}
		placeholder="Write a description..."
		disabled={submitting}
		class="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 transition-colors
			focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none
			disabled:cursor-not-allowed disabled:opacity-50"
		style="min-height: 160px;"
	></textarea>

	{#if errorMsg}
		<p class="text-sm text-red-600">{errorMsg}</p>
	{/if}

	<button
		type="submit"
		disabled={isEmpty || submitting}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors
			hover:bg-teal-700 active:scale-[0.97]
			disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-teal-600"
	>
		{#if submitting}
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
			Submitting…
		{:else}
			Submit Description
		{/if}
	</button>
</form>

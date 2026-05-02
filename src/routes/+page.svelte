<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';

	interface Ticket {
		key: string;
		summary: string;
		issueType: string;
		priority: string;
		status: string;
	}

	let tickets = $state<Ticket[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function fetchTickets() {
		try {
			const res = await fetch('/api/tickets');
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Failed to fetch tickets';
				return;
			}
			tickets = data.tickets;
		} catch {
			error = 'Failed to connect to server';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		fetchTickets();
	});
</script>

<div class="min-h-screen bg-[#FAFAFA]">
	<header class="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
		<span class="text-lg font-semibold text-gray-900">JiraStack</span>
	</header>

	<main class="mx-auto max-w-[640px] px-6 py-8">
		{#if loading}
			<div class="flex items-center justify-center py-16">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600"></div>
			</div>
		{:else if error}
			<div class="rounded-xl bg-red-50 p-6 text-center">
				<p class="text-[15px] text-red-600">{error}</p>
			</div>
		{:else}
			<CardStack {tickets} />
		{/if}
	</main>
</div>

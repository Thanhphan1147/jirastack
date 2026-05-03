<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';
	import DescriptionEditor from '$lib/components/DescriptionEditor.svelte';

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
	let totalCount = $state(0);

	let currentTicket = $derived(tickets.length > 0 ? tickets[0] : null);
	let completedCount = $derived(totalCount - tickets.length);

	async function fetchTickets() {
		try {
			const res = await fetch('/api/tickets');
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Failed to fetch tickets';
				return;
			}
			tickets = data.tickets;
			totalCount = data.tickets.length;
		} catch {
			error = 'Failed to connect to server';
		} finally {
			loading = false;
		}
	}

	function handleDescriptionSubmitted() {
		tickets = tickets.slice(1);
	}

	function handleTicketRemoved(key: string) {
		tickets = tickets.filter((t) => t.key !== key);
	}

	$effect(() => {
		fetchTickets();
	});
</script>

<div class="min-h-screen bg-[#FAFAFA]">
	<header class="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
		<span class="text-lg font-semibold text-gray-900">JiraStack</span>
		{#if !loading && !error && totalCount > 0}
			<span class="text-[13px] text-gray-500">
				{tickets.length} of {totalCount} remaining
			</span>
		{/if}
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
			<CardStack {tickets} ondone={handleTicketRemoved} onreject={handleTicketRemoved} />

			{#if currentTicket}
				{#key currentTicket.key}
					<DescriptionEditor
						ticketKey={currentTicket.key}
						onsubmit={handleDescriptionSubmitted}
					/>
				{/key}
			{/if}

			{#if totalCount > 0 && tickets.length > 0}
				<div class="mt-6">
					<div class="h-1 overflow-hidden rounded-full bg-gray-200">
						<div
							class="h-full rounded-full bg-teal-600 transition-all duration-500"
							style="width: {(completedCount / totalCount) * 100}%"
						></div>
					</div>
					<p class="mt-2 text-center text-[13px] text-gray-500">
						{completedCount} of {totalCount} tickets completed
					</p>
				</div>
			{/if}
		{/if}
	</main>
</div>

<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import TicketCard from './TicketCard.svelte';

	interface Ticket {
		key: string;
		summary: string;
		issueType: string;
		priority: string;
		status: string;
	}

	interface Props {
		tickets: Ticket[];
		ondone: (key: string) => void;
		onreject: (key: string) => void;
	}

	let { tickets, ondone, onreject }: Props = $props();

	let actionLoading = $state<string | null>(null);

	const MAX_VISIBLE = 3;
	let visibleTickets = $derived(tickets.slice(0, MAX_VISIBLE));

	let reducedMotion = $derived.by(() => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	function cardOut(node: HTMLElement) {
		if (reducedMotion) {
			return { duration: 0 };
		}
		return fly(node, { y: -80, duration: 400, easing: cubicOut });
	}

	function cardIn(node: HTMLElement) {
		if (reducedMotion) {
			return { duration: 0 };
		}
		return fade(node, { duration: 300, delay: 100 });
	}

	async function handleAction(key: string, action: 'done' | 'reject') {
		if (actionLoading) return;
		actionLoading = `${action}-${key}`;

		try {
			const status = action === 'done' ? 'Done' : 'Rejected';
			const res = await fetch(`/api/tickets/${key}/transition`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});

			if (!res.ok) {
				const data = await res.json();
				console.error(`Failed to ${action} ${key}:`, data.error);
				return;
			}

			if (action === 'done') {
				ondone(key);
			} else {
				onreject(key);
			}
		} catch (err) {
			console.error(`Failed to ${action} ${key}:`, err);
		} finally {
			actionLoading = null;
		}
	}
</script>

{#if tickets.length === 0}
	<div class="flex flex-col items-center justify-center py-16 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">All caught up!</h2>
		<p class="text-[15px] text-gray-500">All your tickets have descriptions.</p>
	</div>
{:else}
	<div class="relative pb-4">
		{#each visibleTickets as ticket, i (ticket.key)}
			<div
				class="{i === 0 ? 'relative' : 'absolute inset-x-0'} origin-top"
				style="
					{i > 0 ? `top: ${i * 8}px;` : ''}
					z-index: {MAX_VISIBLE - i};
					opacity: {i === 0 ? 1 : i === 1 ? 0.6 : 0.3};
					transform: scale({1 - i * 0.03});
					pointer-events: {i === 0 ? 'auto' : 'none'};
				"
				in:cardIn
				out:cardOut
			>
				<div
					class="rounded-xl bg-white shadow-md"
					class:shadow-lg={i === 0}
				>
					<TicketCard {...ticket} />
					{#if i === 0}
						<div class="flex gap-2 border-t border-gray-100 px-6 py-3">
							<button
								onclick={() => handleAction(ticket.key, 'reject')}
								disabled={actionLoading !== null}
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors
									hover:bg-red-50 hover:text-red-600
									disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if actionLoading === `reject-${ticket.key}`}
									<div class="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-red-500"></div>
								{/if}
								Reject
							</button>
							<button
								onclick={() => handleAction(ticket.key, 'done')}
								disabled={actionLoading !== null}
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors
									hover:bg-green-50 hover:text-green-600
									disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if actionLoading === `done-${ticket.key}`}
									<div class="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-green-500"></div>
								{/if}
								Done
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

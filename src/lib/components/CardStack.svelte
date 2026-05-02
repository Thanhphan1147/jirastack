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
	}

	let { tickets }: Props = $props();

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
</script>

{#if tickets.length === 0}
	<div class="flex flex-col items-center justify-center py-16 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">All caught up!</h2>
		<p class="text-[15px] text-gray-500">All your tickets have descriptions.</p>
	</div>
{:else}
	<div class="relative" style="min-height: 160px;">
		{#each visibleTickets as ticket, i (ticket.key)}
			<div
				class="absolute inset-x-0 origin-top"
				style="
					top: {i * 8}px;
					z-index: {MAX_VISIBLE - i};
					opacity: {i === 0 ? 1 : i === 1 ? 0.6 : 0.3};
					transform: scale({1 - i * 0.03});
					pointer-events: {i === 0 ? 'auto' : 'none'};
				"
				in:cardIn
				out:cardOut
			>
				<div
					class="rounded-xl shadow-md"
					class:shadow-lg={i === 0}
				>
					<TicketCard {...ticket} />
				</div>
			</div>
		{/each}
	</div>
{/if}

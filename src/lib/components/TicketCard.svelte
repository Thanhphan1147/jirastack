<script lang="ts">
	interface Props {
		key: string;
		summary: string;
		issueType: string;
		priority: string;
		status: string;
	}

	let { key, summary, issueType, priority, status }: Props = $props();

	const priorityColors: Record<string, string> = {
		Highest: 'bg-red-100 text-red-700',
		High: 'bg-orange-100 text-orange-700',
		Medium: 'bg-yellow-100 text-yellow-700',
		Low: 'bg-blue-100 text-blue-700',
		Lowest: 'bg-gray-100 text-gray-600'
	};

	const typeColors: Record<string, string> = {
		Bug: 'bg-red-100 text-red-700',
		Story: 'bg-green-100 text-green-700',
		Task: 'bg-blue-100 text-blue-700',
		Epic: 'bg-purple-100 text-purple-700',
		Spike: 'bg-amber-100 text-amber-700'
	};

	let priorityClass = $derived(priorityColors[priority] ?? 'bg-gray-100 text-gray-600');
	let typeClass = $derived(typeColors[issueType] ?? 'bg-gray-100 text-gray-600');

	let expanded = $state(false);
</script>

<article class="rounded-xl bg-white p-6">
	<p class="mb-1 text-[13px] font-medium tracking-wide text-gray-400 uppercase">
		{key}
	</p>
	<button
		type="button"
		onclick={() => (expanded = !expanded)}
		class="mb-3 flex w-full cursor-pointer items-start gap-1.5 text-left"
	>
		<h2 class="text-xl font-semibold text-gray-900" class:line-clamp-2={!expanded}>
			{summary}
		</h2>
		<svg
			class="mt-1.5 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200"
			class:rotate-180={expanded}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
	</button>
	<div class="flex items-center gap-2">
		<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {typeClass}">
			{issueType}
		</span>
		<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {priorityClass}">
			{priority}
		</span>
		<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
			{status}
		</span>
	</div>
</article>

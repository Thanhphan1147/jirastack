<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>JiraStack</title>
</svelte:head>

{@render children()}

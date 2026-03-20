<script>
  import Landing from './lib/Landing.svelte';
  import Portrait from './lib/Portrait.svelte';

  let data = $state(null);

  function handleData(event) {
    data = event.detail;
  }
</script>

{#if data}
  <Portrait {data} />
{:else}
  <Landing on:parsed={handleData} />
{/if}

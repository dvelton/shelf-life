<script>
  let { stats, read } = $props();

  // Group by decade
  const decades = {};
  stats.pubYears.forEach(y => {
    const decade = Math.floor(y / 10) * 10;
    decades[decade] = (decades[decade] || 0) + 1;
  });

  const sortedDecades = Object.entries(decades).sort((a, b) => a[0] - b[0]);
  const maxDecade = sortedDecades.length > 0 ? Math.max(...sortedDecades.map(d => d[1])) : 1;

  const oldest = read
    .filter(b => (b.originalYear || b.yearPublished) > 0)
    .sort((a, b) => (a.originalYear || a.yearPublished) - (b.originalYear || b.yearPublished))[0];

  const newest = read
    .filter(b => (b.originalYear || b.yearPublished) > 0)
    .sort((a, b) => (b.originalYear || b.yearPublished) - (a.originalYear || a.yearPublished))[0];
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 6</div>
  <h2>Through the Ages</h2>

  {#if oldest || newest}
    <div class="stat-grid">
      {#if oldest}
        <div class="stat-card">
          <span class="stat-value">{oldest.originalYear || oldest.yearPublished}</span>
          <span class="stat-label">Oldest: {oldest.title.slice(0, 35)}{oldest.title.length > 35 ? '...' : ''}</span>
        </div>
      {/if}
      {#if newest}
        <div class="stat-card">
          <span class="stat-value">{newest.originalYear || newest.yearPublished}</span>
          <span class="stat-label">Newest: {newest.title.slice(0, 35)}{newest.title.length > 35 ? '...' : ''}</span>
        </div>
      {/if}
    </div>
  {/if}

  {#if sortedDecades.length > 0}
    <h3 class="sub-heading">Books by Decade Published</h3>
    <div class="decade-bars">
      {#each sortedDecades as [decade, count]}
        <div class="decade-row">
          <span class="decade-label">{decade}s</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: {(count / maxDecade) * 100}%"></div>
          </div>
          <span class="decade-count">{count}</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .sub-heading {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 1.05rem;
    margin: 2.5rem 0 1rem;
    color: var(--text);
  }

  .decade-bars {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .decade-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .decade-label {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--text-muted);
    width: 3.5rem;
    text-align: right;
    flex-shrink: 0;
  }

  .bar-track {
    flex: 1;
    height: 20px;
    background: var(--bg-card);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-dim), var(--accent));
    border-radius: 4px;
    transition: width 1s ease;
  }

  .decade-count {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--accent);
    width: 2rem;
    flex-shrink: 0;
  }
</style>

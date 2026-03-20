<script>
  let { stats } = $props();

  // Build histogram buckets
  const buckets = [];
  if (stats.pageCounts.length > 0) {
    const min = Math.floor(stats.pageCounts[0] / 100) * 100;
    const max = Math.ceil(stats.pageCounts[stats.pageCounts.length - 1] / 100) * 100;
    for (let i = min; i <= max; i += 100) {
      const count = stats.pageCounts.filter(p => p >= i && p < i + 100).length;
      buckets.push({ label: `${i}-${i + 99}`, count });
    }
  }

  const maxBucket = buckets.length > 0 ? Math.max(...buckets.map(b => b.count)) : 1;
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 5</div>
  <h2>The Long and Short of It</h2>

  <div class="stat-grid">
    <div class="stat-card">
      <span class="stat-value">{stats.medianPages}</span>
      <span class="stat-label">Median Pages</span>
    </div>
    {#if stats.longest}
      <div class="stat-card">
        <span class="stat-value">{stats.longest.pages.toLocaleString()}</span>
        <span class="stat-label">Longest: {stats.longest.title.slice(0, 30)}{stats.longest.title.length > 30 ? '...' : ''}</span>
      </div>
    {/if}
    {#if stats.shortest}
      <div class="stat-card">
        <span class="stat-value">{stats.shortest.pages}</span>
        <span class="stat-label">Shortest: {stats.shortest.title.slice(0, 30)}{stats.shortest.title.length > 30 ? '...' : ''}</span>
      </div>
    {/if}
  </div>

  {#if buckets.length > 0}
    <h3 class="sub-heading">Page Count Distribution</h3>
    <div class="histogram">
      {#each buckets as bucket}
        <div class="hist-col">
          <div class="hist-bar-wrap">
            <div
              class="hist-bar"
              style="height: {(bucket.count / maxBucket) * 100}%"
            ></div>
          </div>
          <span class="hist-label">{bucket.label.split('-')[0]}</span>
        </div>
      {/each}
    </div>
    <p class="hist-note">Pages per book</p>
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

  .histogram {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 200px;
    margin-top: 1rem;
  }

  .hist-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  .hist-bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  .hist-bar {
    width: 100%;
    background: linear-gradient(0deg, var(--accent-dim), var(--accent));
    border-radius: 3px 3px 0 0;
    min-height: 2px;
    transition: height 1s ease;
  }

  .hist-label {
    font-family: var(--mono);
    font-size: 0.65rem;
    color: var(--text-muted);
    margin-top: 0.35rem;
    transform: rotate(-45deg);
    white-space: nowrap;
  }

  .hist-note {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
    text-align: center;
  }
</style>

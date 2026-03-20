<script>
  let { stats } = $props();

  const warAndPeacePages = 1225;
  const warAndPeaces = (stats.totalPages / warAndPeacePages).toFixed(1);

  function fmt(n) {
    return n.toLocaleString();
  }
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 1</div>
  <h2>The Big Picture</h2>

  <p class="intro">
    You've read <strong>{fmt(stats.totalBooks)}</strong> books totaling
    <strong>{fmt(stats.totalPages)}</strong> pages
    {#if stats.minYear}
      since <strong>{stats.minYear}</strong>.
    {:else}
      .
    {/if}
    {#if stats.totalPages > 0}
      That's roughly {warAndPeaces} copies of <em>War and Peace</em>.
    {/if}
  </p>

  <div class="stat-grid">
    <div class="stat-card">
      <span class="stat-value">{fmt(stats.totalBooks)}</span>
      <span class="stat-label">Books Read</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{fmt(stats.totalPages)}</span>
      <span class="stat-label">Pages</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.yearsReading}</span>
      <span class="stat-label">{stats.yearsReading === 1 ? 'Year' : 'Years'} of Reading</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.totalTbr}</span>
      <span class="stat-label">On the TBR</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.avgMyRating.toFixed(1)}</span>
      <span class="stat-label">Avg Rating You Give</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{Math.round(stats.booksPerYear)}</span>
      <span class="stat-label">Books / Year</span>
    </div>
  </div>
</section>

<style>
  .intro {
    font-size: 1.15rem;
    line-height: 1.7;
    margin: 1.5rem 0;
    color: var(--text);
  }

  .intro strong {
    color: var(--accent);
  }

  .intro em {
    font-style: italic;
  }
</style>

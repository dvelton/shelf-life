<script>
  let { stats, tbr } = $props();

  // Build cumulative TBR data
  const allDates = [];
  tbr.forEach(b => {
    if (b.dateAdded) allDates.push({ date: b.dateAdded, type: 'added' });
  });

  // Sort by date
  allDates.sort((a, b) => a.date - b.date);

  let cumulative = 0;
  const tbrTimeline = allDates.map(d => {
    cumulative++;
    return { date: d.date, count: cumulative };
  });

  const oldestTbrTitle = stats.oldestTbr
    ? `${stats.oldestTbr.title} (added ${stats.oldestTbr.dateAdded.toLocaleDateString()})`
    : null;

  const yearsToFinish = stats.tbrYearsToFinish === Infinity
    ? '∞'
    : stats.tbrYearsToFinish.toFixed(1);
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 7</div>
  <h2>Mount TBR</h2>

  {#if stats.totalTbr === 0}
    <div class="empty-tbr">
      <p>No books on your to-read shelf — either you've read everything you want to, or you track your TBR elsewhere.</p>
      <p class="subtle">If you use Goodreads shelves for your TBR, they'll show up here.</p>
    </div>
  {:else}
    <div class="stat-grid">
    <div class="stat-card">
      <span class="stat-value">{stats.totalTbr}</span>
      <span class="stat-label">Books on Your TBR</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{yearsToFinish}</span>
      <span class="stat-label">Years to Clear at Current Pace</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{Math.round(stats.booksPerYear)}</span>
      <span class="stat-label">Books Read / Year</span>
    </div>
  </div>

  {#if oldestTbrTitle}
    <div class="oldest-tbr">
      <p>Your oldest unread book:</p>
      <p class="oldest-title">{oldestTbrTitle}</p>
    </div>
  {/if}

  {#if tbrTimeline.length > 3}
    <h3 class="sub-heading">TBR Growth Over Time</h3>
    <div class="mini-chart">
      {#each tbrTimeline as point, i}
        {#if i % Math.max(1, Math.floor(tbrTimeline.length / 60)) === 0 || i === tbrTimeline.length - 1}
          <div
            class="mini-bar"
            style="height: {(point.count / Math.max(cumulative, 1)) * 100}%"
            title="{point.date.toLocaleDateString()}: {point.count} books"
          ></div>
        {/if}
      {/each}
    </div>
  {/if}
  {/if}
</section>

<style>
  .empty-tbr {
    margin-top: 2rem;
    padding: 2rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    text-align: center;
  }

  .empty-tbr p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .empty-tbr .subtle {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    opacity: 0.7;
  }

  .oldest-tbr {
    margin-top: 2rem;
    padding: 1rem 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .oldest-tbr p {
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .oldest-title {
    color: var(--accent) !important;
    font-weight: 600;
    margin-top: 0.25rem;
  }

  .sub-heading {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 1.05rem;
    margin: 2.5rem 0 1rem;
    color: var(--text);
  }

  .mini-chart {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 150px;
    margin-top: 1rem;
  }

  .mini-bar {
    flex: 1;
    background: linear-gradient(0deg, var(--accent-dim), var(--accent));
    border-radius: 2px 2px 0 0;
    min-height: 2px;
    min-width: 3px;
    transition: height 0.5s ease;
  }
</style>

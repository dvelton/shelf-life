<script>
  let { stats } = $props();

  const maxCount = stats.topAuthors.length > 0
    ? Math.max(...stats.topAuthors.map(a => a.count))
    : 1;
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 4</div>
  <h2>Your Authors</h2>

  <div class="author-meta">
    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-value">{stats.totalAuthors}</span>
        <span class="stat-label">Unique Authors</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{stats.loyalAuthors}</span>
        <span class="stat-label">Read 3+ Times</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{stats.oneTimers}</span>
        <span class="stat-label">One and Done</span>
      </div>
    </div>
  </div>

  {#if stats.topAuthors.length > 0}
    <h3 class="sub-heading">Most Read</h3>
    <div class="author-bars">
      {#each stats.topAuthors as author}
        <div class="author-row">
          <span class="author-name">{author.name}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              style="width: {(author.count / maxCount) * 100}%"
            ></div>
          </div>
          <span class="author-count">
            {author.count} book{author.count !== 1 ? 's' : ''}
            {#if author.avgRating}
              <span class="author-rating">({author.avgRating.toFixed(1)}★)</span>
            {/if}
          </span>
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
    margin: 2rem 0 1rem;
    color: var(--text);
  }

  .author-bars {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .author-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .author-name {
    width: 160px;
    flex-shrink: 0;
    font-size: 0.85rem;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
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

  .author-count {
    font-family: var(--mono);
    font-size: 0.8rem;
    color: var(--text-muted);
    width: 120px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .author-rating {
    color: var(--accent);
  }

  @media (max-width: 640px) {
    .author-name {
      width: 100px;
      font-size: 0.8rem;
    }
    .author-count {
      width: 80px;
      font-size: 0.75rem;
    }
  }
</style>

<script>
  let { stats, read } = $props();

  // Compute personality traits based on actual data
  const traits = [];

  // Rating behavior
  if (stats.ratingBias > 0.3) {
    traits.push({ label: 'The Generous Reader', desc: `You rate ${stats.ratingBias.toFixed(1)} stars above the crowd average.` });
  } else if (stats.ratingBias < -0.3) {
    traits.push({ label: 'The Tough Critic', desc: `You rate ${Math.abs(stats.ratingBias).toFixed(1)} stars below the crowd average.` });
  } else {
    traits.push({ label: 'The Measured Judge', desc: 'Your ratings closely track the Goodreads consensus.' });
  }

  // Page count preference
  if (stats.medianPages > 400) {
    traits.push({ label: 'The Marathoner', desc: `Your median book is ${stats.medianPages} pages. You don't shy away from doorstoppers.` });
  } else if (stats.medianPages < 250) {
    traits.push({ label: 'The Sprinter', desc: `Your median book is ${stats.medianPages} pages. You favor focused, shorter reads.` });
  } else {
    traits.push({ label: 'The Middle Distance', desc: `Your median book is ${stats.medianPages} pages — right in the sweet spot.` });
  }

  // Author loyalty
  if (stats.loyalAuthors >= 5) {
    traits.push({ label: 'The Loyalist', desc: `You've read 3+ books by ${stats.loyalAuthors} different authors. When you find someone you like, you stay.` });
  } else if (stats.oneTimers > stats.totalAuthors * 0.8) {
    traits.push({ label: 'The Explorer', desc: `${Math.round(stats.oneTimers / stats.totalAuthors * 100)}% of your authors are one-and-done. You're always looking for something new.` });
  }

  // Volume
  if (stats.booksPerYear >= 40) {
    traits.push({ label: 'The Devourer', desc: `${Math.round(stats.booksPerYear)} books a year. That's nearly one a week.` });
  } else if (stats.booksPerYear >= 20) {
    traits.push({ label: 'The Dedicated Reader', desc: `${Math.round(stats.booksPerYear)} books a year keeps you well ahead of the average reader.` });
  } else if (stats.booksPerYear >= 8) {
    traits.push({ label: 'The Steady Reader', desc: `${Math.round(stats.booksPerYear)} books a year — a consistent, sustainable pace.` });
  }

  // TBR behavior
  if (stats.totalTbr > stats.totalBooks) {
    traits.push({ label: 'The Collector', desc: `Your TBR (${stats.totalTbr}) outnumbers your books read (${stats.totalBooks}). The ambition is real.` });
  }

  // Taste divergence
  if (stats.hiddenGems.length >= 5) {
    traits.push({ label: 'The Contrarian', desc: `You've rated ${stats.hiddenGems.length} books at least a star above the crowd. Your taste runs independent.` });
  }

  // Publication era
  const oldBooks = stats.pubYears.filter(y => y < 1970).length;
  const ratio = stats.pubYears.length > 0 ? oldBooks / stats.pubYears.length : 0;
  if (ratio > 0.3) {
    traits.push({ label: 'The Classicist', desc: `${Math.round(ratio * 100)}% of your books were published before 1970.` });
  }
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 8</div>
  <h2>Your Reading Personality</h2>

  {#if traits.length > 0}
    <div class="trait-list">
      {#each traits as trait}
        <div class="trait-card">
          <h3 class="trait-label">{trait.label}</h3>
          <p class="trait-desc">{trait.desc}</p>
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty">Need more reading data to build your personality profile.</p>
  {/if}
</section>

<style>
  .trait-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  .trait-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  .trait-card:hover {
    border-color: var(--accent-dim);
    box-shadow: 0 0 20px var(--accent-glow);
  }

  .trait-label {
    font-family: var(--serif);
    color: var(--accent);
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
  }

  .trait-desc {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .empty {
    color: var(--text-muted);
    font-style: italic;
    margin-top: 1rem;
  }
</style>

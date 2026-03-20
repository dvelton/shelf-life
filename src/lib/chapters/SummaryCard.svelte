<script>
  import { onMount } from 'svelte';

  let { data } = $props();
  let cardEl;
  let downloading = $state(false);

  const s = data.stats;

  // Pick a few highlight books for the card
  const topAuthor = s.topAuthors[0] || null;
  const personality = getTopTraits(s);

  function getTopTraits(stats) {
    const traits = [];
    if (stats.ratingBias > 0.3) traits.push('Generous');
    else if (stats.ratingBias < -0.3) traits.push('Tough Critic');
    if (stats.medianPages > 400) traits.push('Marathoner');
    else if (stats.medianPages < 250) traits.push('Sprinter');
    if (stats.loyalAuthors >= 5) traits.push('Loyalist');
    if (stats.booksPerYear >= 40) traits.push('Devourer');
    else if (stats.booksPerYear >= 20) traits.push('Dedicated');
    if (stats.hiddenGems.length >= 5) traits.push('Contrarian');
    return traits.slice(0, 3);
  }

  async function downloadCard() {
    downloading = true;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardEl, {
        backgroundColor: '#0e0e12',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'shelf-life-portrait.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Failed to generate image:', e);
    }
    downloading = false;
  }
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 9</div>
  <h2>Your Summary Card</h2>
  <p class="desc">Download and share your reading portrait.</p>

  <div class="card-wrapper">
    <div class="card" bind:this={cardEl}>
      <div class="card-header">
        <h3 class="card-title">Shelf Life</h3>
      </div>

      <div class="card-stats">
        <div class="card-stat">
          <span class="card-val">{s.totalBooks}</span>
          <span class="card-lbl">books</span>
        </div>
        <div class="card-stat">
          <span class="card-val">{s.totalPages.toLocaleString()}</span>
          <span class="card-lbl">pages</span>
        </div>
        <div class="card-stat">
          <span class="card-val">{s.yearsReading}</span>
          <span class="card-lbl">{s.yearsReading === 1 ? 'year' : 'years'}</span>
        </div>
        <div class="card-stat">
          <span class="card-val">{s.avgMyRating.toFixed(1)}★</span>
          <span class="card-lbl">avg rating</span>
        </div>
      </div>

      <div class="card-details">
        <div class="card-row">
          <span class="card-row-label">Pace</span>
          <span class="card-row-value">{Math.round(s.booksPerYear)} books/year</span>
        </div>
        {#if topAuthor}
          <div class="card-row">
            <span class="card-row-label">Top author</span>
            <span class="card-row-value">{topAuthor.name} ({topAuthor.count})</span>
          </div>
        {/if}
        <div class="card-row">
          <span class="card-row-label">Median book</span>
          <span class="card-row-value">{s.medianPages} pages</span>
        </div>
        {#if s.ratingBias !== 0}
          <div class="card-row">
            <span class="card-row-label">Rating bias</span>
            <span class="card-row-value">{s.ratingBias > 0 ? '+' : ''}{s.ratingBias.toFixed(2)} vs crowd</span>
          </div>
        {/if}
      </div>

      {#if personality.length > 0}
        <div class="card-personality">
          {#each personality as trait}
            <span class="trait-badge">{trait}</span>
          {/each}
        </div>
      {/if}

      <div class="card-footer">
        shelflife — your reading life, visualized
      </div>
    </div>
  </div>

  <button class="btn btn-primary download-btn" onclick={downloadCard} disabled={downloading}>
    {downloading ? 'Generating...' : 'Download as PNG'}
  </button>
</section>

<style>
  .desc {
    color: var(--text-muted);
    margin: 1rem 0 2rem;
  }

  .card-wrapper {
    display: flex;
    justify-content: center;
    margin: 1rem 0 2rem;
  }

  .card {
    width: 440px;
    max-width: 100%;
    background: linear-gradient(145deg, #16161d, #1a1a24);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-dim), var(--accent), var(--accent-dim));
  }

  .card-header {
    margin-bottom: 1.5rem;
  }

  .card-title {
    font-family: var(--serif);
    font-size: 1.6rem;
    color: var(--accent);
  }

  .card-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .card-stat {
    text-align: center;
  }

  .card-val {
    display: block;
    font-family: var(--serif);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }

  .card-lbl {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-details {
    border-top: 1px solid var(--border);
    padding-top: 1rem;
    margin-bottom: 1rem;
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    padding: 0.3rem 0;
    font-size: 0.85rem;
  }

  .card-row-label {
    color: var(--text-muted);
  }

  .card-row-value {
    color: var(--text);
    font-weight: 500;
  }

  .card-personality {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin: 1rem 0;
  }

  .trait-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.3rem 0.7rem;
    border-radius: 20px;
    background: rgba(212, 165, 86, 0.12);
    color: var(--accent);
    border: 1px solid rgba(212, 165, 86, 0.25);
  }

  .card-footer {
    margin-top: 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
    font-size: 0.7rem;
    color: var(--text-muted);
    text-align: center;
    letter-spacing: 0.05em;
  }

  .download-btn {
    margin-top: 1rem;
  }

  @media (max-width: 480px) {
    .card { padding: 1.25rem; }
    .card-stats { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .card-val { font-size: 1.3rem; }
  }
</style>

<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import BookCover from '../BookCover.svelte';

  let { stats } = $props();
  let scatterContainer;

  const biasLabel = stats.ratingBias > 0.2
    ? 'You rate more generously than the crowd.'
    : stats.ratingBias < -0.2
      ? 'You rate more harshly than the crowd.'
      : 'You and the crowd mostly agree.';

  onMount(() => {
    if (stats.tasteData.length === 0) return;
    drawScatter();
  });

  function drawScatter() {
    const data = stats.tasteData;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = 700;
    const height = 500;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(scatterContainer)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .style('max-width', `${width}px`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([1, 5]).range([0, innerW]);
    const y = d3.scaleLinear().domain([1, 5]).range([innerH, 0]);

    // Quadrant labels
    const quadrants = [
      { x: 0.25, y: 0.92, label: 'Hidden Gems', anchor: 'start' },
      { x: 0.75, y: 0.92, label: 'Mutual Favorites', anchor: 'end' },
      { x: 0.25, y: 0.08, label: 'Mutual Disappointments', anchor: 'start' },
      { x: 0.75, y: 0.08, label: 'Against the Grain', anchor: 'end' },
    ];

    quadrants.forEach(q => {
      g.append('text')
        .attr('x', innerW * q.x)
        .attr('y', innerH * (1 - q.y))
        .attr('fill', '#3a3a48')
        .attr('font-size', '11px')
        .attr('font-family', 'var(--sans)')
        .attr('text-anchor', q.anchor)
        .text(q.label);
    });

    // Diagonal line
    g.append('line')
      .attr('x1', x(1)).attr('y1', y(1))
      .attr('x2', x(5)).attr('y2', y(5))
      .attr('stroke', '#2a2a35')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(d => d + '★'))
      .call(g => g.select('.domain').attr('stroke', '#2a2a35'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#2a2a35'))
      .call(g => g.selectAll('.tick text').attr('fill', '#8a8580').attr('font-size', '11px'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => d + '★'))
      .call(g => g.select('.domain').attr('stroke', '#2a2a35'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#2a2a35'))
      .call(g => g.selectAll('.tick text').attr('fill', '#8a8580').attr('font-size', '11px'));

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8a8580')
      .attr('font-size', '12px')
      .attr('font-family', 'var(--sans)')
      .text('Goodreads Average');

    svg.append('text')
      .attr('transform', `translate(14, ${height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8a8580')
      .attr('font-size', '12px')
      .attr('font-family', 'var(--sans)')
      .text('Your Rating');

    // Dots
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.avgRating))
      .attr('cy', d => y(d.myRating))
      .attr('r', 5)
      .attr('fill', d => {
        if (d.diff >= 1) return '#6bab6b';
        if (d.diff <= -1) return '#c45b5b';
        return '#d4a556';
      })
      .attr('fill-opacity', 0.7)
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `${d.title} — You: ${d.myRating}★, Avg: ${d.avgRating.toFixed(1)}★`);
  }
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 3</div>
  <h2>Your Taste vs. The Crowd</h2>

  <p class="bias">{biasLabel}
    Your average: <strong>{stats.avgMyRating.toFixed(2)}★</strong> vs.
    crowd average: <strong>{stats.avgCrowdRating.toFixed(2)}★</strong>
  </p>

  <div class="scatter-wrap" bind:this={scatterContainer}></div>

  {#if stats.hiddenGems.length > 0}
    <div class="divergence-section">
      <h3>Your Hidden Gems</h3>
      <p class="sub">Books you rated much higher than the crowd</p>
      {#each stats.hiddenGems.slice(0, 5) as book}
        <div class="book-item">
          <BookCover isbn={book.isbn} title={book.title} />
          <div>
            <div class="book-title">{book.title}</div>
            <div class="book-author">{book.author} — You: {book.myRating}★, Avg: {book.avgRating.toFixed(1)}★</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if stats.againstGrain.length > 0}
    <div class="divergence-section">
      <h3>Against the Grain</h3>
      <p class="sub">Books you rated much lower than the crowd</p>
      {#each stats.againstGrain.slice(0, 5) as book}
        <div class="book-item">
          <BookCover isbn={book.isbn} title={book.title} />
          <div>
            <div class="book-title">{book.title}</div>
            <div class="book-author">{book.author} — You: {book.myRating}★, Avg: {book.avgRating.toFixed(1)}★</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .bias {
    color: var(--text-muted);
    margin: 1rem 0 2rem;
  }

  .bias strong {
    color: var(--accent);
  }

  .scatter-wrap {
    margin: 1rem 0;
    overflow-x: auto;
  }

  .divergence-section {
    margin-top: 2.5rem;
  }

  .divergence-section h3 {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }

  .sub {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }
</style>

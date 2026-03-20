<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let { stats } = $props();
  let container;

  onMount(() => {
    if (!stats.readByWeek || Object.keys(stats.readByWeek).length === 0) return;
    drawHeatmap();
  });

  function drawHeatmap() {
    const weeks = stats.readByWeek;
    const allDates = Object.keys(weeks).sort();
    if (allDates.length === 0) return;

    const startYear = new Date(allDates[0]).getFullYear();
    const endYear = new Date(allDates[allDates.length - 1]).getFullYear();
    const years = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);

    const cellSize = 14;
    const cellGap = 3;
    const yearGap = 24;
    const labelWidth = 48;
    const weeksInYear = 53;
    const width = labelWidth + weeksInYear * (cellSize + cellGap);
    const height = years.length * (7 * (cellSize + cellGap) + yearGap);

    const maxCount = Math.max(...Object.values(weeks), 1);

    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolate('#1e1e28', '#d4a556'));

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .style('max-width', `${width}px`);

    years.forEach((year, yi) => {
      const yOffset = yi * (7 * (cellSize + cellGap) + yearGap);

      svg.append('text')
        .attr('x', 0)
        .attr('y', yOffset + 3.5 * (cellSize + cellGap) + 4)
        .attr('fill', '#8a8580')
        .attr('font-size', '12px')
        .attr('font-family', 'var(--mono)')
        .text(year);

      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);

      for (let d = new Date(yearStart); d <= yearEnd; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const weekOfYear = d3.timeWeek.count(d3.timeYear(d), d);
        const dateKey = getWeekKey(d);
        const count = weeks[dateKey] || 0;

        svg.append('rect')
          .attr('x', labelWidth + weekOfYear * (cellSize + cellGap))
          .attr('y', yOffset + dayOfWeek * (cellSize + cellGap))
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('rx', 3)
          .attr('fill', count > 0 ? colorScale(count) : '#1a1a22')
          .append('title')
          .text(`${d.toLocaleDateString()}: ${count} book${count !== 1 ? 's' : ''}`);
      }
    });
  }

  function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }
</script>

<section class="chapter">
  <div class="chapter-number">Chapter 2</div>
  <h2>Your Reading Timeline</h2>

  {#if Object.keys(stats.readByYear).length > 0}
    <div class="year-bars">
      {#each Object.entries(stats.readByYear).sort((a, b) => a[0] - b[0]) as [year, count]}
        {@const maxBooks = Math.max(...Object.values(stats.readByYear))}
        <div class="year-row">
          <span class="year-label">{year}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: {(count / maxBooks) * 100}%"></div>
          </div>
          <span class="year-count">{count}</span>
        </div>
      {/each}
    </div>
  {/if}

  <p class="section-note">
    Books finished per week
    {#if stats.dateReadCoverage < 1}
      (based on {stats.booksWithDates} of {stats.totalBooks} books with a read date)
    {/if}
  </p>
  <div class="heatmap-container" bind:this={container}></div>
</section>

<style>
  .year-bars {
    margin: 2rem 0;
  }

  .year-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.4rem;
  }

  .year-label {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--text-muted);
    width: 3rem;
    text-align: right;
    flex-shrink: 0;
  }

  .bar-track {
    flex: 1;
    height: 24px;
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

  .year-count {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--accent);
    width: 2rem;
    text-align: left;
    flex-shrink: 0;
  }

  .section-note {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 2.5rem 0 0.75rem;
  }

  .heatmap-container {
    overflow-x: auto;
    padding-bottom: 1rem;
  }
</style>

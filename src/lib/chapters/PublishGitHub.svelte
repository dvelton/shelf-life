<script>
  let { data } = $props();

  let copied = $state(false);

  const s = data.stats;
  const topAuthor = s.topAuthors[0];

  // Build markdown snippet for GitHub profile README
  const readmeSnippet = buildReadmeSnippet(s);

  function downloadPortrait() {
    const html = buildStaticPortrait(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'index.html';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(readmeSnippet);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = readmeSnippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    }
  }

  function buildReadmeSnippet(stats) {
    const lines = [
      `### 📚 Reading`,
      ``,
      `| | |`,
      `|---|---|`,
      `| **Books read** | ${stats.totalBooks} |`,
      `| **Pages** | ${stats.totalPages.toLocaleString()} |`,
      `| **Books/year** | ${Math.round(stats.booksPerYear)} |`,
      `| **Avg rating** | ${stats.avgMyRating.toFixed(1)}★ |`,
    ];
    if (topAuthor) {
      lines.push(`| **Most-read author** | ${topAuthor.name} (${topAuthor.count}) |`);
    }
    lines.push(``, `*Generated with [Shelf Life](https://github.com/dvelton/shelf-life)*`);
    return lines.join('\n');
  }

  function buildStaticPortrait(data) {
    const s = data.stats;
    const topAuthorsHtml = s.topAuthors.slice(0, 10).map(a =>
      `<div class="row">
        <span class="name">${esc(a.name)}</span>
        <span class="detail">${a.count} book${a.count !== 1 ? 's' : ''}${a.avgRating ? ` (${a.avgRating.toFixed(1)}★)` : ''}</span>
      </div>`
    ).join('');

    const gemsHtml = s.hiddenGems.slice(0, 5).map(b =>
      `<div class="row">
        <span class="name">${esc(b.title)}</span>
        <span class="detail">You: ${b.myRating}★ / Avg: ${b.avgRating.toFixed(1)}★</span>
      </div>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Reading Life</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap');
  :root { --bg:#0e0e12; --card:#16161d; --text:#e8e4df; --muted:#8a8580; --accent:#d4a556; --border:#2a2a35; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; font-size:16px; line-height:1.6; }
  .wrap { max-width:800px; margin:0 auto; padding:3rem 1.5rem; }
  h1,h2 { font-family:'Playfair Display',serif; }
  h1 { font-size:2.5rem; color:var(--accent); margin-bottom:0.3rem; }
  h2 { font-size:1.5rem; color:var(--accent); margin:3rem 0 1rem; }
  .subtitle { color:var(--muted); margin-bottom:2rem; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; margin:1.5rem 0; }
  .stat { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:1.2rem; text-align:center; }
  .stat .val { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:var(--accent); display:block; }
  .stat .lbl { font-size:0.8rem; color:var(--muted); }
  .row { display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid var(--border); font-size:0.9rem; }
  .name { color:var(--text); }
  .detail { color:var(--muted); }
  .footer { margin-top:4rem; padding-top:1.5rem; border-top:1px solid var(--border); font-size:0.8rem; color:var(--muted); text-align:center; }
  .footer a { color:var(--accent); text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Shelf Life</h1>
  <p class="subtitle">My reading portrait</p>
  <div class="stats">
    <div class="stat"><span class="val">${s.totalBooks}</span><span class="lbl">Books Read</span></div>
    <div class="stat"><span class="val">${s.totalPages.toLocaleString()}</span><span class="lbl">Pages</span></div>
    <div class="stat"><span class="val">${s.yearsReading}</span><span class="lbl">Years</span></div>
    <div class="stat"><span class="val">${s.avgMyRating.toFixed(1)}★</span><span class="lbl">Avg Rating</span></div>
    <div class="stat"><span class="val">${Math.round(s.booksPerYear)}</span><span class="lbl">Books/Year</span></div>
    <div class="stat"><span class="val">${s.totalAuthors}</span><span class="lbl">Authors</span></div>
  </div>
  ${s.topAuthors.length ? `<h2>Most Read Authors</h2>${topAuthorsHtml}` : ''}
  ${s.hiddenGems.length ? `<h2>Hidden Gems</h2><p style="color:var(--muted);font-size:0.9rem;margin-bottom:0.75rem;">Books I rated well above the crowd</p>${gemsHtml}` : ''}
  <div class="footer">Generated with <a href="https://github.com/dvelton/shelf-life">Shelf Life</a></div>
</div>
</body>
</html>`;
  }

  function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
</script>

<section class="chapter">
  <div class="chapter-number">Share</div>
  <h2>Publish to GitHub</h2>

  <div class="share-option">
    <h3>Download your portrait</h3>
    <p class="desc">
      Get a standalone HTML file you can drop into any GitHub repo to deploy as a Pages site.
    </p>
    <button class="btn btn-primary" onclick={downloadPortrait}>
      Download index.html
    </button>
    <div class="instructions">
      <p>To publish on GitHub Pages:</p>
      <ol>
        <li>Create a new repo (e.g. <code>shelf-life</code>)</li>
        <li>Upload the <code>index.html</code> file</li>
        <li>Go to Settings &rarr; Pages &rarr; set source to <code>main</code> branch</li>
        <li>Your portrait will be live at <code>yourusername.github.io/shelf-life</code></li>
      </ol>
    </div>
  </div>

  <div class="share-option">
    <h3>Add to your GitHub profile README</h3>
    <p class="desc">
      Copy this markdown snippet into your profile README to show your reading stats.
    </p>
    <div class="snippet-wrap">
      <pre class="snippet">{readmeSnippet}</pre>
      <button class="btn btn-ghost copy-btn" onclick={copySnippet}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  </div>
</section>

<style>
  .share-option {
    margin-top: 2.5rem;
  }

  .share-option h3 {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .instructions {
    margin-top: 1.25rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.25rem 1.25rem 1.25rem 1.5rem;
  }

  .instructions p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }

  .instructions ol {
    padding-left: 1.25rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .instructions li {
    margin-bottom: 0.3rem;
  }

  .instructions code {
    font-family: var(--mono);
    font-size: 0.82rem;
    color: var(--accent);
  }

  .snippet-wrap {
    position: relative;
  }

  .snippet {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.25rem;
    font-family: var(--mono);
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: pre-wrap;
    overflow-x: auto;
    line-height: 1.5;
  }

  .copy-btn {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
  }
</style>

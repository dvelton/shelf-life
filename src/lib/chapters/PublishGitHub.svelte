<script>
  let { data } = $props();

  // GitHub Device Flow OAuth
  // Client ID will need to be a real GitHub OAuth App ID for production.
  // For now, we use a placeholder — the user will need to register an OAuth App
  // at https://github.com/settings/applications/new with device flow enabled.
  const CLIENT_ID = 'Ov23liYourClientIdHere';

  let step = $state('idle'); // idle | polling | authenticated | publishing | done | error
  let userCode = $state('');
  let verificationUri = $state('');
  let errorMsg = $state('');
  let pagesUrl = $state('');
  let token = $state('');

  async function startDeviceFlow() {
    step = 'polling';
    errorMsg = '';

    try {
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          scope: 'repo',
        }),
      });

      const body = await res.json();
      userCode = body.user_code;
      verificationUri = body.verification_uri;
      const deviceCode = body.device_code;
      const interval = (body.interval || 5) * 1000;

      pollForToken(deviceCode, interval);
    } catch (e) {
      step = 'error';
      errorMsg = 'Failed to start GitHub authentication. Check your connection.';
    }
  }

  async function pollForToken(deviceCode, interval) {
    const poll = async () => {
      try {
        const res = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        });

        const body = await res.json();

        if (body.access_token) {
          token = body.access_token;
          step = 'authenticated';
          return;
        }

        if (body.error === 'authorization_pending') {
          setTimeout(poll, interval);
          return;
        }

        if (body.error === 'slow_down') {
          setTimeout(poll, interval + 5000);
          return;
        }

        if (body.error === 'expired_token' || body.error === 'access_denied') {
          step = 'error';
          errorMsg = body.error === 'expired_token'
            ? 'The code expired. Try again.'
            : 'Authorization was denied.';
          return;
        }

        setTimeout(poll, interval);
      } catch {
        step = 'error';
        errorMsg = 'Connection error during authentication.';
      }
    };

    poll();
  }

  async function publishToGitHub() {
    step = 'publishing';
    errorMsg = '';

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      };

      // Get the authenticated user
      const userRes = await fetch('https://api.github.com/user', { headers });
      const user = await userRes.json();
      const username = user.login;

      // Check if repo already exists
      const repoCheck = await fetch(`https://api.github.com/repos/${username}/shelf-life`, { headers });

      if (repoCheck.status === 404) {
        // Create the repo
        await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: 'shelf-life',
            description: 'My reading life, visualized with Shelf Life',
            homepage: `https://${username}.github.io/shelf-life/`,
            private: false,
            auto_init: true,
          }),
        });

        // Small delay for repo creation to propagate
        await new Promise(r => setTimeout(r, 2000));
      }

      // Build the static portrait HTML
      const portraitHtml = buildStaticPortrait(data, username);

      // Push index.html to the repo
      const existingFile = await fetch(
        `https://api.github.com/repos/${username}/shelf-life/contents/index.html`,
        { headers }
      );
      const pushBody = {
        message: 'Update Shelf Life portrait',
        content: btoa(unescape(encodeURIComponent(portraitHtml))),
      };
      if (existingFile.status === 200) {
        const existing = await existingFile.json();
        pushBody.sha = existing.sha;
      }

      await fetch(
        `https://api.github.com/repos/${username}/shelf-life/contents/index.html`,
        { method: 'PUT', headers, body: JSON.stringify(pushBody) }
      );

      // Enable GitHub Pages
      try {
        await fetch(`https://api.github.com/repos/${username}/shelf-life/pages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ build_type: 'legacy', source: { branch: 'main', path: '/' } }),
        });
      } catch {
        // Pages might already be enabled
      }

      pagesUrl = `https://${username}.github.io/shelf-life/`;
      step = 'done';
    } catch (e) {
      step = 'error';
      errorMsg = `Publishing failed: ${e.message}`;
    }
  }

  function buildStaticPortrait(data, username) {
    const s = data.stats;
    const ratedBooks = s.tasteData || [];
    const topAuthorsHtml = s.topAuthors.slice(0, 10).map(a =>
      `<div class="author-row">
        <span class="author-name">${esc(a.name)}</span>
        <span class="author-count">${a.count} book${a.count !== 1 ? 's' : ''}${a.avgRating ? ` (${a.avgRating.toFixed(1)}★)` : ''}</span>
      </div>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(username)}'s Reading Life — Shelf Life</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap');
  :root { --bg:#0e0e12; --card:#16161d; --text:#e8e4df; --muted:#8a8580; --accent:#d4a556; --border:#2a2a35; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased; }
  .wrap { max-width:800px; margin:0 auto; padding:3rem 1.5rem; }
  h1,h2 { font-family:'Playfair Display',serif; }
  h1 { font-size:2.5rem; color:var(--accent); margin-bottom:0.3rem; }
  h2 { font-size:1.5rem; color:var(--accent); margin:3rem 0 1rem; }
  .subtitle { color:var(--muted); margin-bottom:2rem; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin:1.5rem 0; }
  .stat { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:1.2rem; text-align:center; }
  .stat .val { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:var(--accent); }
  .stat .lbl { font-size:0.8rem; color:var(--muted); }
  .author-row { display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid var(--border); font-size:0.9rem; }
  .author-name { color:var(--text); }
  .author-count { color:var(--muted); }
  .footer { margin-top:4rem; padding-top:1.5rem; border-top:1px solid var(--border); font-size:0.8rem; color:var(--muted); text-align:center; }
  .footer a { color:var(--accent); text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Shelf Life</h1>
  <p class="subtitle">${esc(username)}'s reading portrait</p>
  <div class="stats">
    <div class="stat"><div class="val">${s.totalBooks}</div><div class="lbl">Books Read</div></div>
    <div class="stat"><div class="val">${s.totalPages.toLocaleString()}</div><div class="lbl">Pages</div></div>
    <div class="stat"><div class="val">${s.yearsReading}</div><div class="lbl">Years</div></div>
    <div class="stat"><div class="val">${s.avgMyRating.toFixed(1)}★</div><div class="lbl">Avg Rating</div></div>
    <div class="stat"><div class="val">${Math.round(s.booksPerYear)}</div><div class="lbl">Books/Year</div></div>
    <div class="stat"><div class="val">${s.totalAuthors}</div><div class="lbl">Authors</div></div>
  </div>
  ${s.topAuthors.length ? `<h2>Most Read Authors</h2>${topAuthorsHtml}` : ''}
  ${s.hiddenGems.length ? `<h2>Hidden Gems</h2><p style="color:var(--muted);font-size:0.9rem;">Books rated well above the crowd</p>${s.hiddenGems.slice(0,5).map(b => `<div class="author-row"><span class="author-name">${esc(b.title)}</span><span class="author-count">You: ${b.myRating}★ / Avg: ${b.avgRating.toFixed(1)}★</span></div>`).join('')}` : ''}
  <div class="footer">Generated with <a href="https://dvelton.github.io/shelf-life/">Shelf Life</a></div>
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

  {#if step === 'idle'}
    <p class="desc">
      Publish your reading portrait to your own GitHub Pages site.
      You'll get a permanent URL at <strong>yourusername.github.io/shelf-life</strong>.
    </p>
    <p class="privacy">
      This creates a public repo called <code>shelf-life</code> under your GitHub account
      with a static HTML snapshot of your portrait. Your CSV is not uploaded — only the
      rendered stats.
    </p>
    <button class="btn btn-primary" onclick={startDeviceFlow}>
      Connect with GitHub
    </button>

  {:else if step === 'polling'}
    <div class="device-flow">
      <p>Go to <a href={verificationUri} target="_blank" rel="noopener">{verificationUri}</a> and enter this code:</p>
      <div class="user-code">{userCode}</div>
      <p class="waiting">Waiting for authorization...</p>
    </div>

  {:else if step === 'authenticated'}
    <p class="desc">Authenticated. Ready to publish your portrait.</p>
    <button class="btn btn-primary" onclick={publishToGitHub}>
      Publish to GitHub Pages
    </button>

  {:else if step === 'publishing'}
    <div class="publishing">
      <p>Creating repo and deploying your portrait...</p>
    </div>

  {:else if step === 'done'}
    <div class="done">
      <p>Your portrait is live at:</p>
      <a href={pagesUrl} target="_blank" rel="noopener" class="pages-link">{pagesUrl}</a>
      <p class="note">It may take a minute for GitHub Pages to build. Refresh if you see a 404.</p>
    </div>

  {:else if step === 'error'}
    <p class="error">{errorMsg}</p>
    <button class="btn btn-ghost" onclick={() => { step = 'idle'; }}>Try Again</button>
  {/if}
</section>

<style>
  .desc {
    color: var(--text-muted);
    margin: 1rem 0;
    line-height: 1.6;
  }

  .privacy {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .privacy code {
    font-family: var(--mono);
    color: var(--accent);
    font-size: 0.85rem;
  }

  .device-flow {
    text-align: center;
    margin: 2rem 0;
  }

  .device-flow a {
    color: var(--accent);
  }

  .user-code {
    font-family: var(--mono);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 0.15em;
    margin: 1.5rem 0;
    padding: 1rem 2rem;
    background: var(--bg-card);
    border: 2px solid var(--accent);
    border-radius: 12px;
    display: inline-block;
  }

  .waiting {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-top: 1rem;
  }

  .publishing {
    text-align: center;
    color: var(--text-muted);
    margin: 2rem 0;
  }

  .done {
    text-align: center;
    margin: 2rem 0;
  }

  .pages-link {
    display: block;
    font-family: var(--mono);
    font-size: 1.2rem;
    color: var(--accent);
    margin: 1rem 0;
  }

  .note {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
  }

  .error {
    color: var(--red);
    margin: 1rem 0;
  }
</style>

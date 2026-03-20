<script>
  import { parseGoodreadsCsv } from './parser.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let dragging = $state(false);
  let error = $state('');
  let loading = $state(false);

  async function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      error = 'Please upload a CSV file exported from Goodreads.';
      return;
    }
    error = '';
    loading = true;
    try {
      const data = await parseGoodreadsCsv(file);
      if (data.read.length === 0) {
        error = "No books found on your 'read' shelf. Is this a Goodreads export?";
        loading = false;
        return;
      }
      dispatch('parsed', data);
    } catch (e) {
      error = 'Failed to parse CSV. Make sure this is a Goodreads export file.';
      console.error(e);
    }
    loading = false;
  }

  function onDrop(e) {
    e.preventDefault();
    dragging = false;
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }

  function onDragOver(e) {
    e.preventDefault();
    dragging = true;
  }

  function onDragLeave() {
    dragging = false;
  }

  function onFileSelect(e) {
    const file = e.target.files?.[0];
    handleFile(file);
  }
</script>

<div class="landing">
  <div class="landing-content">
    <h1>Shelf Life</h1>
    <p class="tagline">Drop your Goodreads export. Meet your reading self.</p>

    <div
      class="dropzone"
      class:dragging
      class:loading
      role="button"
      tabindex="0"
      ondrop={onDrop}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('file-input').click(); }}
    >
      {#if loading}
        <div class="drop-icon">&#9203;</div>
        <p>Reading your library...</p>
      {:else}
        <div class="drop-icon">&#128218;</div>
        <p>Drag your <strong>goodreads_library_export.csv</strong> here</p>
        <p class="drop-or">or</p>
        <label class="btn btn-primary" for="file-input">Choose File</label>
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onchange={onFileSelect}
          hidden
        />
      {/if}
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="how-to">
      <h3>How to export from Goodreads</h3>
      <ol>
        <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener">goodreads.com/review/import</a></li>
        <li>Click <strong>Export Library</strong></li>
        <li>Wait for the file to generate, then download it</li>
        <li>Drop it here</li>
      </ol>
    </div>

    <div class="privacy-note">
      <span class="lock">&#128274;</span>
      Your data never leaves your browser. Nothing is uploaded. No account needed.
    </div>
  </div>
</div>

<style>
  .landing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .landing-content {
    max-width: 560px;
    width: 100%;
    text-align: center;
  }

  h1 {
    font-size: 3.5rem;
    font-family: var(--serif);
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .tagline {
    font-size: 1.15rem;
    color: var(--text-muted);
    margin-bottom: 2.5rem;
  }

  .dropzone {
    border: 2px dashed var(--border);
    border-radius: 16px;
    padding: 3rem 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--bg-card);
  }

  .dropzone:hover,
  .dropzone.dragging {
    border-color: var(--accent);
    background: var(--accent-glow);
  }

  .dropzone.loading {
    pointer-events: none;
    opacity: 0.7;
  }

  .drop-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .drop-or {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin: 0.75rem 0;
  }

  .error {
    color: var(--red);
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .how-to {
    margin-top: 3rem;
    text-align: left;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .how-to h3 {
    font-family: var(--sans);
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text);
  }

  .how-to ol {
    padding-left: 1.25rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .how-to li {
    margin-bottom: 0.35rem;
  }

  .privacy-note {
    margin-top: 2rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .lock {
    margin-right: 0.3rem;
  }
</style>

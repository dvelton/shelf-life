<script>
  let { isbn = '', title = '', size = 'medium' } = $props();

  // Try Open Library cover by ISBN, show placeholder on failure
  let src = $state(isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-${size === 'small' ? 'S' : 'M'}.jpg` : '');
  let failed = $state(!isbn);

  function onError() {
    failed = true;
  }

  // Generate initials from title for placeholder
  const initials = title
    .split(/\s+/)
    .filter(w => w.length > 2 && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map(w => w[0])
    .join('');
</script>

{#if !failed && src}
  <img
    {src}
    alt={title}
    class="cover cover-{size}"
    loading="lazy"
    onerror={onError}
  />
{:else}
  <div class="cover-placeholder cover-{size}" title={title}>
    <span>{initials || '?'}</span>
  </div>
{/if}

<style>
  .cover {
    border-radius: 4px;
    object-fit: cover;
    background: var(--bg-hover);
    flex-shrink: 0;
  }

  .cover-small { width: 32px; height: 48px; }
  .cover-medium { width: 48px; height: 72px; }
  .cover-large { width: 72px; height: 108px; }

  .cover-placeholder {
    border-radius: 4px;
    background: linear-gradient(135deg, var(--bg-hover), var(--bg-card));
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cover-placeholder span {
    font-family: var(--serif);
    font-weight: 700;
    color: var(--text-muted);
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .cover-placeholder.cover-large span {
    font-size: 1rem;
  }
</style>

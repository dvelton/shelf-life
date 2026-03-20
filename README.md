# Shelf Life

Your reading life, visualized. Drop a Goodreads CSV export, get a beautiful, scrollable portrait of your reading history. Runs entirely in the browser — your data never leaves your machine.

## What it does

Shelf Life parses your Goodreads library export and generates a narrative "reading portrait" — eight chapters that walk you through your reading life:

1. **The Big Picture** — Total books, pages, years active, pace
2. **Your Reading Timeline** — Heatmap and year-by-year bars showing when you read
3. **Your Taste vs. The Crowd** — Scatter plot of your ratings against Goodreads averages, with hidden gems and contrarian picks called out
4. **Your Authors** — Most-read authors, loyalty scores, one-and-done vs. return readers
5. **The Long and Short of It** — Page count distribution, longest and shortest books
6. **Through the Ages** — Publication year spread across decades
7. **Mount TBR** — To-read shelf growth over time with a pace projection
8. **Your Reading Personality** — Synthesized traits based on your data (e.g., "The Contrarian Marathoner")

## How to use it

1. Export your Goodreads library at [goodreads.com/review/import](https://www.goodreads.com/review/import) (click "Export Library")
2. Open the app
3. Drag and drop the CSV file (or click to browse)
4. Scroll through your portrait

## Privacy

Everything runs client-side in your browser. The CSV is parsed with JavaScript locally. No data is uploaded, no accounts needed, no analytics. The site works offline once loaded.

## Sharing your portrait

Each chapter of your portrait has a download button that saves it as a PNG — sized for sharing on social media or dropping into a group chat.

If you have a GitHub account, you can publish your full portrait to your own GitHub Pages site with one click. The app uses GitHub's Device Flow to authenticate (no server, no secrets), creates a `shelf-life` repo under your account, and deploys the static site. You end up with a permanent URL at `yourusername.github.io/shelf-life`.

There's also a profile README widget — a generated SVG card showing your currently reading list, recent books, and key stats. Paste it into your GitHub profile README. An optional GitHub Action template keeps it up to date by polling your Goodreads RSS feed on a schedule.

## Tech stack

- [Svelte](https://svelte.dev/) + [Vite](https://vite.dev/) — fast, minimal framework
- [D3.js](https://d3js.org/) — heatmap and scatter plot visualizations
- [Papa Parse](https://www.papaparse.com/) — CSV parsing
- [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) — book cover images (no auth required)

## Development

```
npm install
npm run dev
```

Build for production:

```
npm run build
```

## License

MIT

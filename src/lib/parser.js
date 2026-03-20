import Papa from 'papaparse';

export function parseGoodreadsCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        resolve(processBooks(results.data));
      },
      error(err) {
        reject(err);
      }
    });
  });
}

function processBooks(rows) {
  const books = rows
    .filter(r => r['Title'] && r['Title'].trim())
    .map(r => {
      const isbn = cleanIsbn(r['ISBN']);
      const isbn13 = cleanIsbn(r['ISBN13']);
      const bookId = r['Book Id']?.trim() || '';
      const bestIsbn = isbn13 || isbn || '';

      return {
        title: r['Title']?.trim() || '',
        author: r['Author']?.trim() || '',
        additionalAuthors: r['Additional Authors']?.trim() || '',
        bookId,
        isbn,
        isbn13,
        bestIsbn,
        // Cover URL: try ISBN via Open Library, fall back to null
        coverUrl: bestIsbn
          ? `https://covers.openlibrary.org/b/isbn/${bestIsbn}-M.jpg`
          : null,
        myRating: parseNum(r['My Rating']),
        avgRating: parseFloat(r['Average Rating']) || 0,
        pages: parseNum(r['Number of Pages']),
        yearPublished: parseNum(r['Year Published']),
        originalYear: parseNum(r['Original Publication Year']),
        dateRead: parseDate(r['Date Read']),
        dateAdded: parseDate(r['Date Added']),
        shelf: r['Exclusive Shelf']?.trim() || '',
        shelves: (r['Bookshelves']?.trim() || '').split(',').map(s => s.trim()).filter(Boolean),
        review: r['My Review']?.trim() || '',
        readCount: parseNum(r['Read Count']),
      };
    });

  const read = books.filter(b => b.shelf === 'read');
  const tbr = books.filter(b => b.shelf === 'to-read');
  const reading = books.filter(b => b.shelf === 'currently-reading');

  const isbnCoverage = books.length > 0
    ? books.filter(b => b.bestIsbn).length / books.length
    : 0;

  return {
    all: books,
    read,
    tbr,
    reading,
    isbnCoverage,
    stats: computeStats(books, read, tbr),
  };
}

function computeStats(all, read, tbr) {
  const rated = read.filter(b => b.myRating > 0);
  const withPages = read.filter(b => b.pages > 0);
  const withDates = read.filter(b => b.dateRead);
  const withAnyDate = read.filter(b => b.dateRead || b.dateAdded);
  const totalPages = withPages.reduce((sum, b) => sum + b.pages, 0);

  // Use dateRead when available, dateAdded as fallback for year range
  const allKnownDates = read
    .map(b => b.dateRead || b.dateAdded)
    .filter(Boolean);
  const allYears = allKnownDates.map(d => d.getFullYear());
  const minYear = allYears.length ? Math.min(...allYears) : null;
  const maxYear = allYears.length ? Math.max(...allYears) : null;

  // Dates coverage stat
  const dateReadCoverage = read.length > 0 ? withDates.length / read.length : 0;

  const avgMyRating = rated.length
    ? rated.reduce((s, b) => s + b.myRating, 0) / rated.length
    : 0;
  const avgCrowdRating = rated.length
    ? rated.reduce((s, b) => s + b.avgRating, 0) / rated.length
    : 0;

  // Author stats
  const authorCounts = {};
  const authorRatings = {};
  read.forEach(b => {
    const a = b.author;
    if (!a) return;
    authorCounts[a] = (authorCounts[a] || 0) + 1;
    if (b.myRating > 0) {
      if (!authorRatings[a]) authorRatings[a] = [];
      authorRatings[a].push(b.myRating);
    }
  });

  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({
      name,
      count,
      avgRating: authorRatings[name]
        ? authorRatings[name].reduce((s, r) => s + r, 0) / authorRatings[name].length
        : null,
    }));

  const loyalAuthors = Object.values(authorCounts).filter(c => c >= 3).length;
  const oneTimers = Object.values(authorCounts).filter(c => c === 1).length;

  // Page count stats
  const pageCounts = withPages.map(b => b.pages).sort((a, b) => a - b);
  const medianPages = pageCounts.length
    ? pageCounts[Math.floor(pageCounts.length / 2)]
    : 0;

  const longest = withPages.reduce((max, b) => (b.pages > (max?.pages || 0) ? b : max), null);
  const shortest = withPages.reduce((min, b) => (b.pages < (min?.pages || Infinity) ? b : min), null);

  // Reading by year/month
  const readByYear = {};
  const readByMonth = {};
  withDates.forEach(b => {
    const y = b.dateRead.getFullYear();
    const m = `${y}-${String(b.dateRead.getMonth() + 1).padStart(2, '0')}`;
    readByYear[y] = (readByYear[y] || 0) + 1;
    readByMonth[m] = (readByMonth[m] || 0) + 1;
  });

  // Reading by week (for heatmap)
  const readByWeek = {};
  withDates.forEach(b => {
    const d = b.dateRead;
    const weekKey = getWeekKey(d);
    readByWeek[weekKey] = (readByWeek[weekKey] || 0) + 1;
  });

  // TBR timeline
  const tbrByDate = {};
  tbr.forEach(b => {
    if (b.dateAdded) {
      const key = b.dateAdded.toISOString().slice(0, 7);
      tbrByDate[key] = (tbrByDate[key] || 0) + 1;
    }
  });

  // Publication year distribution
  const pubYears = read
    .map(b => b.originalYear || b.yearPublished)
    .filter(y => y && y > 0);

  // Taste divergence
  const tasteData = rated
    .filter(b => b.avgRating > 0)
    .map(b => ({
      title: b.title,
      author: b.author,
      isbn: b.isbn13 || b.isbn,
      myRating: b.myRating,
      avgRating: b.avgRating,
      diff: b.myRating - b.avgRating,
    }));

  const hiddenGems = tasteData.filter(b => b.diff >= 1).sort((a, b) => b.diff - a.diff);
  const againstGrain = tasteData.filter(b => b.diff <= -1).sort((a, b) => a.diff - b.diff);

  // TBR pace projection
  const yearsReading = minYear && maxYear ? maxYear - minYear + 1 : 1;
  const booksPerYear = read.length / Math.max(yearsReading, 1);
  const tbrYearsToFinish = booksPerYear > 0 ? tbr.length / booksPerYear : Infinity;

  const oldestTbr = tbr
    .filter(b => b.dateAdded)
    .sort((a, b) => a.dateAdded - b.dateAdded)[0] || null;

  // Rating distribution
  const ratingDist = [0, 0, 0, 0, 0, 0]; // index 0 unused, 1-5
  rated.forEach(b => { ratingDist[b.myRating]++; });

  return {
    totalBooks: read.length,
    totalPages,
    totalTbr: tbr.length,
    currentlyReading: read.filter(b => b.shelf === 'currently-reading').length,
    minYear,
    maxYear,
    yearsReading,
    dateReadCoverage,
    booksWithDates: withDates.length,
    avgMyRating,
    avgCrowdRating,
    ratingBias: avgMyRating - avgCrowdRating,
    ratingDist,
    topAuthors,
    loyalAuthors,
    oneTimers,
    totalAuthors: Object.keys(authorCounts).length,
    medianPages,
    longest,
    shortest,
    pageCounts,
    readByYear,
    readByMonth,
    readByWeek,
    tbrByDate,
    pubYears,
    tasteData,
    hiddenGems,
    againstGrain,
    booksPerYear,
    tbrYearsToFinish,
    oldestTbr,
  };
}

function cleanIsbn(raw) {
  if (!raw) return '';
  return raw.replace(/[="]/g, '').trim();
}

function parseNum(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function parseDate(val) {
  if (!val || !val.trim()) return null;
  const d = new Date(val.trim());
  return isNaN(d.getTime()) ? null : d;
}

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

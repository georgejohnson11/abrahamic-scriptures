import express from 'express';
import cors from 'cors';
import { BibleDB } from './db/bible.js';
import { QuranDB } from './db/quran.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')));

console.log('📚 Initializing databases...');
const bible = new BibleDB('./db/bible.db');
const quran = new QuranDB('./db/quran.db');

// ────── BIBLE ROUTES ──────

app.get('/api/bible/books', async (req, res) => {
  try {
    const books = await bible.getAllBooks();
    if (!books || books.length === 0) {
      console.warn('⚠️  Bible database returned no books');
    } else {
      console.log(`✓ Returned ${books.length} books from Bible database`);
    }
    res.json(books);
  } catch (error) {
    console.error('❌ Error fetching Bible books:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bible/books/:bookId', async (req, res) => {
  try {
    const book = await bible.getBookInfo(parseInt(req.params.bookId));
    res.json(book || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bible/books/:bookId/chapters/:chapterId/verses', async (req, res) => {
  try {
    const verses = await bible.getVerses(
      parseInt(req.params.bookId),
      parseInt(req.params.chapterId)
    );
    res.json(verses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bible/books/:bookId/chapters-count', async (req, res) => {
  try {
    const count = await bible.getChaptersCount(parseInt(req.params.bookId));
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bible/search', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await bible.searchVerses(q || '');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────── QURAN ROUTES ──────

app.get('/api/quran/surahs', async (req, res) => {
  try {
    const surahs = await quran.getAllSurahs();
    if (!surahs || surahs.length === 0) {
      console.warn('⚠️  Quran database returned no surahs');
    } else {
      console.log(`✓ Returned ${surahs.length} surahs from Quran database`);
    }
    res.json(surahs);
  } catch (error) {
    console.error('❌ Error fetching Quran surahs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quran/surahs/:surahId/verses', async (req, res) => {
  try {
    const verses = await quran.getVerses(parseInt(req.params.surahId));
    res.json(verses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quran/tafseer-books', async (req, res) => {
  try {
    const books = await quran.getTafseerBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quran/tafseer/:surahId/:bookId/:verseNum', async (req, res) => {
  try {
    const { surahId, bookId, verseNum } = req.params;
    const tafseer = await quran.getTafseerVerse(
      parseInt(surahId),
      parseInt(bookId),
      parseInt(verseNum)
    );
    res.json({ tafseer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quran/search', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await quran.search(q || '');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
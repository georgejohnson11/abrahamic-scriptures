import sqlite3 from 'sqlite3';

export class QuranDB {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
  }

  getAllSurahs() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM sura', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getVerses(surahId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM ayat WHERE suraid = ? ORDER BY verse_num ASC',
        [surahId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getSurahName(surahId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT name_ar FROM sura WHERE suraid = ?',
        [surahId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result?.name_ar || null);
        }
      );
    });
  }

  getTafseerBooks() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM tafseer_books', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getTafseerVerse(surahId, bookId, verseNum) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT tafseer FROM tafseer_text
        WHERE suraid = ? AND bookid = ? AND verse_num = ?
      `, [surahId, bookId, verseNum], (err, result) => {
        if (err) reject(err);
        else resolve(result?.tafseer || null);
      });
    });
  }

  search(term) {
    return new Promise((resolve, reject) => {
      if (!term || !term.trim()) {
        resolve({ count: 0, results: [] });
        return;
      }

      this.db.all(`
        SELECT a.*, s.name_ar AS suraname
        FROM ayat a
        JOIN sura s ON s.suraid = a.suraid
        WHERE a.verse_txt_raw LIKE ?
        ORDER BY a.suraid ASC, a.verse_num ASC
      `, ['%' + term.trim() + '%'], (err, results) => {
        if (err) reject(err);
        else {
          resolve({
            count: results.length,
            results: results.map(row => ({
              ...row,
              versenum: row.verse_num,
              suranum: row.suraid,
              verse_txt_highlighted: row.verse_txt
            }))
          });
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

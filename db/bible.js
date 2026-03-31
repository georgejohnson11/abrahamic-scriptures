import sqlite3 from 'sqlite3';

export class BibleDB {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
  }

  getAllBooks() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, name FROM books ORDER BY id ASC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getBookInfo(bookId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, name FROM books WHERE id = ? LIMIT 1',
        [bookId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  getChaptersCount(bookId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT MAX(Chapter) AS n FROM bible WHERE Book = ?',
        [bookId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result?.n || 0);
        }
      );
    });
  }

  getVerses(bookId, chapter) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT Book,
               Chapter,
               Versecount AS verse_number,
               verse AS text
        FROM bible
        WHERE Book = ? AND Chapter = ?
        ORDER BY Versecount ASC
      `, [bookId, chapter], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  searchVerses(term, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT b.Book,
               b.Chapter,
               b.Versecount AS verse_number,
               b.verse AS text,
               bo.name AS book_name
        FROM bible b
        JOIN books bo ON b.Book = bo.id
        WHERE b.verse LIKE ?
        ORDER BY b.Book ASC, b.Chapter ASC, b.Versecount ASC
        LIMIT ? OFFSET ?
      `, ['%' + term + '%', limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  countSearchResults(term) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM bible WHERE verse LIKE ?',
        ['%' + term + '%'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result?.count || 0);
        }
      );
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
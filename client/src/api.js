import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const bibleAPI = {
  getBooks: () => axios.get(`${API_BASE}/bible/books`),
  getBook: (bookId) => axios.get(`${API_BASE}/bible/books/${bookId}`),
  getChaptersCount: (bookId) => axios.get(`${API_BASE}/bible/books/${bookId}/chapters-count`),
  getVerses: (bookId, chapterId) => 
    axios.get(`${API_BASE}/bible/books/${bookId}/chapters/${chapterId}/verses`),
  search: (query) => axios.get(`${API_BASE}/bible/search?q=${encodeURIComponent(query)}`)
}

export const quranAPI = {
  getSurahs: () => axios.get(`${API_BASE}/quran/surahs`),
  getVerses: (surahId) => axios.get(`${API_BASE}/quran/surahs/${surahId}/verses`),
  getTafseerBooks: () => axios.get(`${API_BASE}/quran/tafseer-books`),
  getTafseer: (surahId, bookId, verseNum) => 
    axios.get(`${API_BASE}/quran/tafseer/${surahId}/${bookId}/${verseNum}`),
  search: (query) => axios.get(`${API_BASE}/quran/search?q=${encodeURIComponent(query)}`)
}
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Button, Form, ListGroup, Card, Alert, Badge } from 'react-bootstrap'
import { bibleAPI } from '../api'
import '../styles/BibleReader.css'

export default function BibleReader() {
  const { bookId = '0', chapterId = '1' } = useParams()
  const navigate = useNavigate()

  const [books, setBooks] = useState([])
  const [verses, setVerses] = useState([])
  const [chaptersCount, setChaptersCount] = useState(0)
  const [bookInfo, setBookInfo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [fontSize, setFontSize] = useState(20)
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    bibleAPI.getBooks().then(res => setBooks(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('bible-theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-bs-theme', saved)
  }, [])

  useEffect(() => {
    const bid = parseInt(bookId)
    const cid = parseInt(chapterId)
    setLoading(true)
    setSearchResults(null)
    setSearchQuery('')
    Promise.all([
      bibleAPI.getBook(bid),
      bibleAPI.getChaptersCount(bid),
      bibleAPI.getVerses(bid, cid)
    ]).then(([bookRes, countRes, versesRes]) => {
      setBookInfo(bookRes.data)
      setChaptersCount(countRes.data.count)
      setVerses(versesRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [bookId, chapterId])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await bibleAPI.search(searchQuery)
      setSearchResults(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchResults(null)
    setSearchQuery('')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('bible-theme', newTheme)
    document.documentElement.setAttribute('data-bs-theme', newTheme)
  }

  const bid = parseInt(bookId)
  const cid = parseInt(chapterId)
  const prevChapter = cid > 1 ? cid - 1 : null
  const nextChapter = cid < chaptersCount ? cid + 1 : null

  return (
    <Row className="bible-page">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="bible-sidebar-overlay d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Col md={3} className={`mb-4 bible-sidebar ${sidebarOpen ? 'bible-sidebar--open' : ''}`}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Books</span>
            <div className="d-flex align-items-center gap-2">
              <Button variant="link" size="sm" onClick={toggleTheme} className="p-0">
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
              <button
                className="bible-sidebar-close d-md-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close"
              >✕</button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <ListGroup variant="flush" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {books.map(book => (
                <ListGroup.Item
                  key={book.id}
                  active={book.id === bid}
                  action
                  onClick={() => { navigate(`/bible/${book.id}/1`); setSidebarOpen(false) }}
                >
                  {book.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>

      {/* Main content */}
      <Col md={9}>
        {/* Search form */}
        <Form onSubmit={handleSearch} className="mb-4">
          <Form.Group className="d-flex gap-2">
            <button
              className="bible-hamburger d-flex d-md-none"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Books menu"
              type="button"
            >
              <span /><span /><span />
            </button>
            <Form.Control
              type="text"
              placeholder="Search verses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="primary" type="submit" disabled={searching}>
              {searching ? 'Searching…' : 'Search'}
            </Button>
            {searchResults !== null && (
              <Button variant="outline-secondary" onClick={clearSearch}>Clear</Button>
            )}
          </Form.Group>
        </Form>

        {/* Search results */}
        {searchResults !== null ? (
          <div>
            <h5 className="mb-3" style={{ fontFamily: 'Cinzel, serif', color: '#3e1a28' }}>
              Found <Badge style={{ background: '#5c2d40' }}>{searchResults.length}</Badge> results for "{searchQuery}"
            </h5>
            {searchResults.length === 0 ? (
              <Alert variant="warning">No verses found.</Alert>
            ) : (
              <div className="verses-container" style={{ fontSize: `${fontSize}px` }}>
                {searchResults.map((verse, idx) => (
                  <div
                    key={idx}
                    className="bible-search-result mb-3 p-2"
                    onClick={() => navigate(`/bible/${verse.Book}/${verse.Chapter}`)}
                  >
                    <div className="bible-search-ref mb-1">
                      {verse.book_name} — Chapter {verse.Chapter}, Verse {verse.verse_number}
                    </div>
                    <span>{verse.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : loading ? (
          <Alert variant="info">Loading...</Alert>
        ) : (
          <>
            {/* Chapter header */}
            <div className="mb-4 d-flex justify-content-between align-items-end">
              <div>
                <h1 className="bible-book-title">{bookInfo?.name}</h1>
                <p className="bible-chapter-label mb-0">Chapter {cid}</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <label className="text-muted small mb-0" style={{ fontFamily: 'Lora, serif' }}>Font:</label>
                <input
                  type="range"
                  min="14"
                  max="28"
                  value={fontSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value)
                    setFontSize(size)
                    localStorage.setItem('bible-font-size', size)
                  }}
                  className="form-range mb-0"
                  style={{ width: '100px' }}
                />
                <span className="text-muted small">{fontSize}px</span>
              </div>
            </div>

            {/* Chapter navigation */}
            <div className="mb-4 d-flex gap-2 align-items-start">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={!prevChapter}
                onClick={() => navigate(`/bible/${bid}/${prevChapter}`)}
              >
                ← Prev
              </Button>
              <div className="d-flex gap-1 overflow-auto flex-wrap">
                {Array.from({ length: chaptersCount }, (_, i) => i + 1).map(ch => (
                  <Button
                    key={ch}
                    variant={ch === cid ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => navigate(`/bible/${bid}/${ch}`)}
                  >
                    {ch}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={!nextChapter}
                onClick={() => navigate(`/bible/${bid}/${nextChapter}`)}
              >
                Next →
              </Button>
            </div>

            {/* Verses */}
            <div className="verses-container" style={{ fontSize: `${fontSize}px` }}>
              {verses.map((verse, idx) => (
                <div key={idx} className="verse mb-3 p-2">
                  <sup>{verse.verse_number}</sup>
                  {' '}
                  <span>{verse.text}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Col>
    </Row>
  )
}
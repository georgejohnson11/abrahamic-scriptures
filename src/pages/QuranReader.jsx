import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Button, Form, ListGroup, Card, Alert, Modal, Badge, Nav } from 'react-bootstrap'
import { quranAPI } from '../api'
import '../styles/QuranReader.css'

export default function QuranReader() {
  const { surahId = '1' } = useParams()
  const navigate = useNavigate()

  const [surahs, setSurahs] = useState([])
  const [verses, setVerses] = useState([])
  const [tafseerBooks, setTafseerBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [fontSize, setFontSize] = useState(28)
  const [loading, setLoading] = useState(false)

  const [selectedTafseerBook, setSelectedTafseerBook] = useState(1)
  const [tafseerContent, setTafseerContent] = useState('')
  const [showTafseerModal, setShowTafseerModal] = useState(false)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      quranAPI.getSurahs(),
      quranAPI.getTafseerBooks()
    ]).then(([surahsRes, booksRes]) => {
      setSurahs(surahsRes.data)
      setTafseerBooks(booksRes.data)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    const sid = parseInt(surahId)
    setLoading(true)
    setSearchResults(null)
    setSearchQuery('')
    quranAPI.getVerses(sid)
      .then(res => setVerses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [surahId])

  useEffect(() => {
    if (verses.length === 0) return
    const hash = window.location.hash
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    }
  }, [verses])

  const goToVerse = (e, suranum, versenum) => {
    e.stopPropagation()
    const targetSurah = String(suranum)
    if (targetSurah === surahId) {
      const el = document.getElementById(`verse-${versenum}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      navigate(`/quran/${suranum}#verse-${versenum}`)
    }
  }

  useEffect(() => {
    if (!showTafseerModal || !selectedVerse) return
    const sid = selectedVerse.suraid ?? parseInt(surahId)
    setTafseerContent('جاري التحميل…')
    quranAPI.getTafseer(sid, selectedTafseerBook, selectedVerse.verse_num)
      .then(res => setTafseerContent(res.data.tafseer || 'لا يوجد تفسير متاح'))
      .catch(() => setTafseerContent('حدث خطأ في تحميل التفسير'))
  }, [selectedTafseerBook, showTafseerModal])

  const handleVerseClick = async (verse, overrideSurahId) => {
    setSelectedVerse(verse)
    setTafseerContent('جاري التحميل…')
    setShowTafseerModal(true)
    try {
      const sid = overrideSurahId ?? parseInt(surahId)
      const res = await quranAPI.getTafseer(sid, selectedTafseerBook, verse.verse_num)
      setTafseerContent(res.data.tafseer || 'لا يوجد تفسير متاح')
    } catch (error) {
      console.error(error)
      setTafseerContent('حدث خطأ في تحميل التفسير')
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await quranAPI.search(searchQuery)
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

  const sid = parseInt(surahId)
  const currentSurah = surahs.find(s => s.suraid === sid)

  return (
    <div dir="rtl" className="quran-page">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="quran-sidebar-overlay d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      <Row>
        {/* Sidebar — always visible on md+, drawer on mobile */}
        <Col md={3} className={`mb-4 quran-sidebar ${sidebarOpen ? 'quran-sidebar--open' : ''}`}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>السور</span>
              <button
                className="quran-sidebar-close d-md-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="إغلاق"
              >✕</button>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {surahs.map(surah => (
                  <ListGroup.Item
                    key={surah.suraid}
                    active={surah.suraid === sid}
                    action
                    onClick={() => { navigate(`/quran/${surah.suraid}`); setSidebarOpen(false) }}
                  >
                    {surah.name_ar}
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
                className="quran-hamburger d-flex d-md-none"
                onClick={() => setSidebarOpen(o => !o)}
                aria-label="قائمة السور"
                type="button"
              >
                <span /><span /><span />
              </button>
              <Form.Control
                type="text"
                placeholder="ابحث في القرآن…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit" disabled={searching}>
                {searching ? '…' : 'بحث'}
              </Button>
            </Form.Group>
          </Form>

          {/* Search results */}
          {searchResults !== null ? (
            <div>
              <h5 className="mb-3" style={{ fontFamily: 'Amiri, serif', color: '#1e6b45' }}>
                نتائج البحث: <Badge style={{ background: '#1e6b45' }}>{searchResults.count}</Badge>
              </h5>
              {searchResults.count === 0 ? (
                <Alert variant="warning">لا توجد نتائج.</Alert>
              ) : (
                <div style={{ fontSize: `${fontSize}px` }}>
                  {searchResults.results.map((verse, idx) => (
                    <div key={idx} className="quran-search-result mb-3 p-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ fontFamily: 'Amiri, serif', fontSize: '0.65em', color: '#5a3e1b' }}>
                          {verse.suraname}
                        </span>
                        <span
                          className="verse-badge"
                          title="انتقل إلى السورة"
                          onClick={(e) => goToVerse(e, verse.suranum, verse.versenum)}
                          style={{ width: 'auto', padding: '0 0.5em', fontSize: '0.55em' }}
                        >
                          آية {verse.versenum}
                        </span>
                      </div>
                      <span
                        className="hover-highlight"
                        onClick={() => handleVerseClick(verse, verse.suranum)}
                      >
                        {verse.verse_txt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : loading ? (
            <Alert variant="info" style={{ fontFamily: 'Amiri, serif' }}>جاري التحميل…</Alert>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="quran-surah-title mb-0">{currentSurah?.name_ar}</h1>
                <div className="d-flex align-items-center gap-2">
                  <label className="text-muted small mb-0" style={{ fontFamily: 'Amiri, serif' }}>حجم الخط:</label>
                  <input
                    type="range"
                    min="16"
                    max="56"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="form-range mb-0"
                    style={{ width: '120px' }}
                  />
                  <span className="text-muted small">{fontSize}px</span>
                </div>
              </div>

              <p className="quran-verses" style={{ fontSize: `${fontSize}px`, lineHeight: '2.2', textAlign: 'justify' }}>
                {verses.map((verse, idx) => (
                  <span key={idx}>
                    <span
                      id={`verse-${verse.verse_num}`}
                      className="hover-highlight"
                      onClick={() => handleVerseClick(verse)}
                    >
                      {verse.verse_txt}
                    </span>
                    {' '}
                    <span
                      className="verse-badge"
                      title="انتقل إلى الآية"
                      onClick={(e) => goToVerse(e, sid, verse.verse_num)}
                    >
                      {verse.verse_num}
                    </span>
                    {' '}
                  </span>
                ))}
              </p>
            </>
          )}
        </Col>
      </Row>

      {/* Tafseer Modal */}
      <Modal show={showTafseerModal} onHide={() => setShowTafseerModal(false)} size="lg" dir="rtl" className="quran-modal">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: 'Amiri, serif' }}>
            تفسير الآية {selectedVerse?.verse_num}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Nav variant="tabs" className="px-3 pt-2">
            {tafseerBooks.map(book => (
              <Nav.Item key={book.bookid}>
                <Nav.Link
                  active={selectedTafseerBook === book.bookid}
                  onClick={() => setSelectedTafseerBook(book.bookid)}
                  style={{ cursor: 'pointer' }}
                >
                  {book.book_name}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <div className="p-3 quran-tafseer-content" style={{ minHeight: '200px' }}>
            {tafseerContent}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Navbar, Container } from 'react-bootstrap'
import BibleReader from './pages/BibleReader'
import QuranReader from './pages/QuranReader'
import './App.css'

export default function App() {
  return (
    <>
      <Navbar expand="lg" className="app-navbar mb-4">
        <Container>
          <Navbar.Brand href="/">Abrahamic</Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <nav className="ms-auto d-flex">
              <Link to="/bible/0/1" className="nav-link">Bible</Link>
              <Link to="/quran/1" className="nav-link">Quran</Link>
            </nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/bible/:bookId/:chapterId" element={<BibleReader />} />
          <Route path="/bible" element={<Navigate to="/bible/0/1" replace />} />
          <Route path="/quran/:surahId" element={<QuranReader />} />
          <Route path="/quran" element={<Navigate to="/quran/1" replace />} />
          <Route path="/" element={
            <div className="text-center mt-5 welcome-page">
              <h1>Welcome to Abrahamic Scriptures</h1>
              <p>Choose a scripture to explore:</p>
              <div className="welcome-links mt-4">
                <Link to="/bible/0/1">Bible</Link>
                <Link to="/quran/1">Quran</Link>
              </div>
            </div>
          } />
        </Routes>
      </Container>
    </>
  )
}

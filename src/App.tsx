import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import Book from './pages/Book'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Services from './pages/Services'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    // Wait a frame so the target section exists and the browser's own
    // scroll restoration doesn't override us on first load.
    const id = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
    return () => window.clearTimeout(id)
  }, [pathname, hash])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isBooking = pathname.startsWith('/book')

  return (
    <>
      <ScrollManager />
      <Header minimal={isBooking} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book" element={<Book />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isBooking && <Footer />}
    </>
  )
}

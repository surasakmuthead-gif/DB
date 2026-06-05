import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import Navbar from './components/Navbar'
import routes from './routes'

export default function App() {
  const { theme, cycleTheme } = useTheme()

  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--c-bg)' }}>
        <Navbar theme={theme} cycleTheme={cycleTheme} />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

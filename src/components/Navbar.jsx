import { NavLink } from 'react-router-dom'
import ThemeSwitcher from './ThemeSwitcher'
import routes from '../routes'

export default function Navbar({ theme, cycleTheme }) {
  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--c-surface) 85%, transparent)',
        borderColor: 'var(--c-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
            style={{ backgroundColor: '#004D25' }}
          >
            ธกส
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--c-text-1)' }}>
              KPI Dashboard
            </h1>
            <p className="text-xs" style={{ color: 'var(--c-text-2)' }}>
              สนจ.สุโขทัย
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'nav-active' : ''
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'var(--c-accent)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--c-text-2)',
                })}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{route.label}</span>
              </NavLink>
            )
          })}
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher theme={theme} cycleTheme={cycleTheme} />
      </div>
    </nav>
  )
}

import { Moon, Sun, Palette } from 'lucide-react'

const icons = {
  dark: Moon,
  light: Sun,
  colorful: Palette,
}

const labels = {
  dark: 'มืด',
  light: 'สว่าง',
  colorful: 'สี ธกส.',
}

export default function ThemeSwitcher({ theme, cycleTheme }) {
  const Icon = icons[theme]

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
      style={{
        backgroundColor: 'var(--c-surface-alt)',
        border: '1px solid var(--c-border)',
        color: 'var(--c-text-2)',
      }}
      title={`ธีม: ${labels[theme]}`}
    >
      <Icon size={16} />
      <span className="text-xs font-medium hidden sm:inline">{labels[theme]}</span>
    </button>
  )
}

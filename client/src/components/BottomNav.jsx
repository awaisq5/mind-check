import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    label: 'Home',
    path: '/home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-primary)' : 'none'} stroke={active ? 'var(--color-primary)' : 'var(--color-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: 'Check-In',
    path: '/checkin',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-primary)' : 'none'} stroke={active ? 'var(--color-primary)' : 'var(--color-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    label: 'Articles',
    path: '/articles',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-primary)' : 'none'} stroke={active ? 'var(--color-primary)' : 'var(--color-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Progress',
    path: '/progress',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-primary)' : 'none'} stroke={active ? 'var(--color-primary)' : 'var(--color-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ label, path, icon }) => {
        const active = pathname === path
        return (
          <button key={path} onClick={() => navigate(path)} className="nav-btn">
            {icon(active)}
            <span className={active ? 'nav-active' : 'nav-inactive'}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

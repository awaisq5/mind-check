import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const NAV = [
  { to: '/today', label: 'Today', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/check-in', label: 'Check in', icon: 'M12 5v14M5 12h14' },
  { to: '/trends', label: 'Trends', icon: 'M4 18l5-6 4 3 7-9' },
  { to: '/care', label: 'Care', icon: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' },
]
const MORE = [
  { to: '/questionnaires', label: 'Questionnaires' },
  { to: '/safety-plan', label: 'Safety plan' },
  { to: '/companion', label: 'Companion' },
  { to: '/report', label: 'Appointment report' },
  { to: '/settings', label: 'Settings and data' },
]

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="nav-icon">
      <path d={d} />
    </svg>
  )
}

export function Brand() {
  return (
    <span className="brand">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="brand-bg" />
        <path d="M8 18c3-6 6 6 9 0s4-5 7-1" className="brand-wave" />
      </svg>
      Mind Check
    </span>
  )
}

export function HelpNowLink() {
  return (
    <Link to="/help" className="help-now">
      Help now
    </Link>
  )
}

/** Accounts created before consent was recorded must accept the notice before continuing. */
function ConsentGate() {
  const { updateSettings } = useAuth()
  const [busy, setBusy] = useState(false)
  return (
    <div className="page page-narrow">
      <section className="card">
        <h1>Mind Check has changed</h1>
        <p>
          Mind Check now helps you prepare for appointments: daily check-ins, PHQ-9 and GAD-7, a care tracker, a safety plan and a report. Because this involves health data, we need your explicit agreement to store it, as described in the <Link to="/privacy">privacy notice</Link>.
        </p>
        <p className="muted small">If you don't agree, you can delete your account and all data in Settings.</p>
        <div className="row">
          <button className="btn btn-primary" disabled={busy} onClick={async () => (setBusy(true), await updateSettings({ acceptConsent: true }).finally(() => setBusy(false)))}>
            I agree, continue
          </button>
          <Link className="btn btn-ghost" to="/privacy">
            Read the notice
          </Link>
        </div>
      </section>
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const moreActive = MORE.some((m) => location.pathname.startsWith(m.to))

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/today" className="brand-link" aria-label="Mind Check home">
          <Brand />
        </Link>
        <div className="topbar-right">
          <HelpNowLink />
          <span className="who" title={user?.email}>
            {user?.name}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="sidenav" aria-label="Main">
        {[...NAV, ...MORE.map((m) => ({ ...m, icon: null }))].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidenav-link ${isActive ? 'on' : ''} ${item.icon ? '' : 'minor'}`}>
            {item.icon && <Icon d={item.icon} />}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="content" id="main" onClick={() => setMoreOpen(false)}>
        {user?.needsConsent ? <ConsentGate /> : <Outlet />}
      </main>

      <nav className="bottomnav" aria-label="Main">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottomnav-link ${isActive ? 'on' : ''}`} onClick={() => setMoreOpen(false)}>
            <Icon d={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button className={`bottomnav-link ${moreActive || moreOpen ? 'on' : ''}`} aria-expanded={moreOpen} onClick={() => setMoreOpen((o) => !o)}>
          <Icon d="M5 12h.01M12 12h.01M19 12h.01" />
          <span>More</span>
        </button>
        {moreOpen && (
          <div className="more-menu" role="menu">
            {MORE.map((m) => (
              <NavLink key={m.to} to={m.to} role="menuitem" onClick={() => setMoreOpen(false)}>
                {m.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  )
}

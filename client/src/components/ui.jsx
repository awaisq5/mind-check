import { Link } from 'react-router-dom'

export function Page({ title, intro, actions, children, narrow = false }) {
  return (
    <div className={`page ${narrow ? 'page-narrow' : ''}`}>
      {(title || actions) && (
        <header className="page-head">
          <div>
            {title && <h1>{title}</h1>}
            {intro && <p className="lede">{intro}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  )
}

export function Card({ title, action, children, tone, className = '' }) {
  return (
    <section className={`card ${tone ? `card-${tone}` : ''} ${className}`}>
      {(title || action) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Banner({ tone = 'info', children, action }) {
  return (
    <div className={`banner banner-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <div>{children}</div>
      {action}
    </div>
  )
}

export function ErrorText({ error }) {
  if (!error) return null
  return (
    <p className="error-text" role="alert">
      {error.message ?? String(error)}
    </p>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" /> {label}
    </div>
  )
}

export function Empty({ title, children, to, cta }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children && <p className="muted">{children}</p>}
      {to && (
        <Link className="btn btn-primary" to={to}>
          {cta}
        </Link>
      )}
    </div>
  )
}

export function Field({ label, hint, children, error }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

/** A 1 to 5 choice shown as five buttons with words, not just numbers. */
export function Scale({ name, value, onChange, options, required }) {
  return (
    <div className="scale" role="radiogroup" aria-label={name} aria-required={required}>
      {options.map((label, i) => {
        const v = i + 1
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            className={`scale-option scale-${v} ${value === v ? 'on' : ''}`}
            onClick={() => onChange(v)}
          >
            <span className="scale-dot" aria-hidden="true">
              {v}
            </span>
            <span className="scale-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Stat({ label, value, sub, delta, betterWhen = 'higher' }) {
  let deltaText = null
  if (delta !== null && delta !== undefined && delta !== 0) {
    const good = betterWhen === 'higher' ? delta > 0 : delta < 0
    deltaText = <span className={`delta ${good ? 'good' : 'bad'}`}>{`${delta > 0 ? '+' : ''}${delta.toFixed(1)} vs last week`}</span>
  }
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? '–'}</span>
      {sub && <span className="stat-sub">{sub}</span>}
      {deltaText}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { resourcesFor } from '../lib/resources'
import { REGIONS, telHref } from '../lib/format'

const GROUNDING = ['5 things you can see', '4 things you can touch', '3 things you can hear', '2 things you can smell', '1 thing you can taste']

function Breathing() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const phases = ['Breathe in', 'Hold', 'Breathe out', 'Hold']
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setStep((s) => s + 1), 4000)
    return () => clearInterval(t)
  }, [running])
  return (
    <div className="breathing">
      <div className={`breath-circle ${running ? `phase-${step % 4}` : ''}`} aria-live="polite">
        {running ? phases[step % 4] : 'Box breathing'}
      </div>
      <p className="muted small">Four seconds each: in, hold, out, hold. A few rounds slow the body down.</p>
      <button className="btn btn-ghost" onClick={() => (setRunning((r) => !r), setStep(0))}>
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}

export default function HelpNow() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [region, setRegion] = useState(user?.settings?.region ?? 'DE')
  const resources = resourcesFor(region)
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    if (!user) return
    api('/care/safety-plan').then((d) => setPlan(d.plan)).catch(() => {})
  }, [user])

  const people = [...(plan?.supportPeople ?? []), ...(plan?.professionals ?? [])].filter((p) => p.phone)

  return (
    <div className="help-page">
      <header className="landing-top">
        <Link to={user ? '/today' : '/'} className="brand-link">
          <Brand />
        </Link>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      <main className="help-main">
        <h1>You don't have to get through this alone</h1>

        <section className="help-urgent">
          <h2>If you might act on thoughts of ending your life, or you are in danger</h2>
          {resources?.emergency ? (
            <a className="btn btn-danger btn-lg" href={telHref(resources.emergency)}>
              Call {resources.emergency}
            </a>
          ) : (
            <p>Call your local emergency number now.</p>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Talk to someone now</h2>
            <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Country">
              {Object.entries(REGIONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="call-list">
            {resources?.crisisLines.map((l) => (
              <a key={l.phone} className="call" href={telHref(l.phone)}>
                <strong>{l.phone}</strong>
                <span>
                  {l.name} · {l.note}
                </span>
              </a>
            ))}
            {resources?.care.map((c) =>
              c.phone ? (
                <a key={c.name} className="call call-soft" href={telHref(c.phone)}>
                  <strong>{c.phone}</strong>
                  <span>
                    {c.name}: {c.note}
                  </span>
                </a>
              ) : (
                <a key={c.name} className="call call-soft" href={c.url} target="_blank" rel="noreferrer">
                  <strong>{c.name}</strong>
                  <span>{c.note}</span>
                </a>
              ),
            )}
          </div>
        </section>

        {user && (
          <section className="card">
            <div className="card-head">
              <h2>Your safety plan</h2>
              <Link to="/safety-plan">Edit</Link>
            </div>
            {plan && (plan.copingStrategies.length || people.length || plan.reasonsToLive.length) ? (
              <div className="plan-quick">
                {plan.copingStrategies.length > 0 && (
                  <div>
                    <h3>Things that help me</h3>
                    <ul>{plan.copingStrategies.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {people.length > 0 && (
                  <div>
                    <h3>People I can call</h3>
                    <div className="call-list">
                      {people.map((p, i) => (
                        <a key={i} className="call call-soft" href={telHref(p.phone)}>
                          <strong>{p.name}</strong>
                          <span>{p.phone}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {plan.reasonsToLive.length > 0 && (
                  <div>
                    <h3>What matters to me</h3>
                    <ul>{plan.reasonsToLive.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="muted">
                You haven't written a safety plan yet. <Link to="/safety-plan">It takes ten minutes</Link> and is best done on a calmer day.
              </p>
            )}
          </section>
        )}

        <div className="help-grid">
          <section className="card">
            <h2>Slow your breathing</h2>
            <Breathing />
          </section>
          <section className="card">
            <h2>Ground yourself</h2>
            <p className="muted small">Look around and name, out loud or in your head:</p>
            <ol className="grounding">
              {GROUNDING.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  )
}

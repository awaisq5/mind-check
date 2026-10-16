import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Card, ErrorText, Loading, Page } from '../components/ui'
import { api } from '../lib/api'
import { telHref } from '../lib/format'

const BAND_TEXT = {
  Minimal: 'Few or no symptoms over the last two weeks.',
  Mild: 'Some symptoms. Worth keeping an eye on and mentioning at your next appointment.',
  Moderate: 'A level at which many professionals would discuss support or treatment with you.',
  'Moderately severe': 'A high level. Please share this result with your doctor or therapist soon.',
  Severe: 'A very high level. Please contact your doctor or therapist soon, and use Help now if you feel unsafe.',
}

function Result({ q, result }) {
  const { assessment: a, change, resources } = result
  const bandIndex = q.bands.findIndex((b) => b.label === a.severity)
  return (
    <Page title={`${q.name} result`} narrow>
      {a.safetyFlag && (
        <section className="help-urgent" role="alert">
          <h2>You said you've had thoughts of being better off dead or of hurting yourself</h2>
          <p>Thank you for answering honestly. Please don't keep this to yourself: talk to someone today.</p>
          <div className="call-list">
            {resources?.emergency && (
              <a className="call call-danger" href={telHref(resources.emergency)}>
                <strong>{resources.emergency}</strong>
                <span>If you might act on these thoughts or are in danger</span>
              </a>
            )}
            {resources?.crisisLines.map((l) => (
              <a key={l.phone} className="call" href={telHref(l.phone)}>
                <strong>{l.phone}</strong>
                <span>
                  {l.name} · {l.note}
                </span>
              </a>
            ))}
          </div>
          <div className="row">
            <Link to="/safety-plan" className="btn btn-primary">
              Open my safety plan
            </Link>
            <Link to="/help" className="btn btn-ghost">
              Help now
            </Link>
          </div>
        </section>
      )}

      <Card>
        <p className="score">
          <strong>{a.score}</strong> <span className="muted">of {q.max}</span>
        </p>
        <div className="bands" aria-label="Severity bands">
          {q.bands.map((b, i) => (
            <div key={b.label} className={`band ${i === bandIndex ? 'on' : ''} sev-${b.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <span>{b.label}</span>
              <span className="muted small">
                {b.min}–{b.max}
              </span>
            </div>
          ))}
        </div>
        <p>{BAND_TEXT[a.severity]}</p>
        {change && change.direction !== 'same' && (
          <p>
            Since last time: {change.from} → {change.to} ({change.delta > 0 ? '+' : ''}
            {change.delta}).{' '}
            {change.meaningful
              ? change.direction === 'worse'
                ? 'A change this size is generally considered meaningful: please mention it to your doctor or therapist.'
                : 'A change this size is generally considered meaningful.'
              : 'A small change; the trend over several results tells you more.'}
          </p>
        )}
        <p className="muted small">This is a self-report questionnaire, not a diagnosis. Only a professional can interpret it for you.</p>
        <div className="row">
          <Link to="/today" className="btn btn-primary">
            Done
          </Link>
          <Link to="/report" className="btn btn-ghost">
            Add to appointment report
          </Link>
        </div>
      </Card>
    </Page>
  )
}

export default function Questionnaire() {
  const { type } = useParams()
  const [meta, setMeta] = useState(null)
  const [answers, setAnswers] = useState([])
  const [step, setStep] = useState(0)
  const [difficulty, setDifficulty] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/assessments/questionnaires').then(setMeta).catch(setError)
  }, [])

  if (error && !meta) return <Page><ErrorText error={error} /></Page>
  if (!meta) return <Loading />
  const q = meta.questionnaires.find((x) => x.type === type)
  if (!q) return <Navigate to="/questionnaires" replace />
  if (result) return <Result q={q} result={result} />

  const n = q.items.length
  const onDifficulty = step === n

  const answer = (v) => {
    const next = [...answers]
    next[step] = v
    setAnswers(next)
    setTimeout(() => setStep((s) => Math.min(s + 1, n)), 150)
  }

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      setResult(await api('/assessments', { method: 'POST', body: { type, answers, difficulty } }))
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${q.name} · ${q.topic}`} narrow>
      <div className="progress" aria-label={`Question ${Math.min(step + 1, n)} of ${n}`}>
        <span style={{ width: `${(Math.min(step, n) / n) * 100}%` }} />
      </div>
      <Card>
        <p className="muted">{q.intro}</p>
        {!onDifficulty ? (
          <>
            <p className="q-count">
              Question {step + 1} of {n}
            </p>
            <h2 className="q-text">{q.items[step]}</h2>
            <div className="answers">
              {meta.answerOptions.map((o) => (
                <button key={o.value} type="button" className={`answer ${answers[step] === o.value ? 'on' : ''}`} onClick={() => answer(o.value)}>
                  {o.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="q-text">If you had any of these problems, how difficult have they made it to do your work, take care of things at home, or get along with other people?</h2>
            <div className="answers">
              {meta.difficultyOptions.map((label, i) => (
                <button key={label} type="button" className={`answer ${difficulty === i ? 'on' : ''}`} onClick={() => setDifficulty(i)}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        <ErrorText error={error} />
        <div className="row spread">
          <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {onDifficulty ? (
            <button className="btn btn-primary" disabled={busy || answers.length !== n} onClick={submit}>
              {busy ? 'Scoring…' : 'See my result'}
            </button>
          ) : (
            answers[step] !== undefined && (
              <button className="btn btn-ghost" onClick={() => setStep((s) => s + 1)}>
                Next
              </button>
            )
          )}
        </div>
      </Card>
    </Page>
  )
}

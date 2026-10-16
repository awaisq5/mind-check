import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart } from '../components/LineChart'
import { ErrorText, Loading } from '../components/ui'
import { addDays, CONTACT_KINDS, CONTACT_STATUSES, formatDate, formatDateTime, localToday, SCALES } from '../lib/format'
import { useApi } from '../lib/useApi'

const avg = (xs) => {
  const v = xs.filter((x) => x !== null && x !== undefined)
  return v.length ? (v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) : '–'
}

export default function Report() {
  const today = localToday()
  const [days, setDays] = useState(90)
  const { data, loading, error } = useApi(`/report?days=${days}&today=${today}`)

  return (
    <div className="report-wrap">
      <div className="report-controls no-print">
        <Link to="/today" className="btn btn-ghost btn-sm">
          ← Back
        </Link>
        <div className="seg">
          {[30, 90].map((d) => (
            <button key={d} className={days === d ? 'on' : ''} onClick={() => setDays(d)}>
              Last {d} days
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>

      {loading && <Loading />}
      <ErrorText error={error} />
      {data && <ReportBody r={data.report} today={today} />}
    </div>
  )
}

function ReportBody({ r, today }) {
  const byDate = new Map(r.checkIns.map((c) => [c.date, c]))
  const n = Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000) + 1
  const points = Array.from({ length: n }, (_, i) => {
    const date = addDays(r.from, i)
    const c = byDate.get(date)
    return { date, mood: c?.mood ?? null, anxiety: c?.anxiety ?? null }
  })
  const c = r.checkIns

  return (
    <article className="report">
      <header className="report-head">
        <div>
          <h1>Self-monitoring summary</h1>
          <p>
            {r.name} · {formatDate(r.from, { day: 'numeric', month: 'short', year: 'numeric' })} to {formatDate(r.to, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <p className="muted small">Created {formatDate(today, { day: 'numeric', month: 'long', year: 'numeric' })} with Mind Check</p>
      </header>
      <p className="report-note">
        Self-reported by the patient between appointments. Daily ratings use a 1–5 scale (mood and energy: 5 = best; anxiety: 5 = most). Questionnaire scores are PHQ-9 (0–27) and GAD-7 (0–21). This is not a clinical assessment.
      </p>

      <section className="report-stats">
        <div>
          <span>Days logged</span>
          <strong>
            {r.daysLogged} / {n}
          </strong>
        </div>
        <div>
          <span>Mood</span>
          <strong>{avg(c.map((x) => x.mood))}</strong>
        </div>
        <div>
          <span>Energy</span>
          <strong>{avg(c.map((x) => x.energy))}</strong>
        </div>
        <div>
          <span>Anxiety</span>
          <strong>{avg(c.map((x) => x.anxiety))}</strong>
        </div>
        <div>
          <span>Sleep</span>
          <strong>{avg(c.map((x) => x.sleepHours))} h</strong>
        </div>
      </section>

      <section>
        <h2>Daily mood and anxiety</h2>
        <LineChart
          points={points}
          label="Daily mood and anxiety"
          series={[
            { key: 'mood', label: 'Mood', color: 'var(--c-mood)' },
            { key: 'anxiety', label: 'Anxiety', color: 'var(--c-anxiety)' },
          ]}
          height={170}
        />
      </section>

      <section>
        <h2>Weekly averages</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Week</th>
              <th className="num">Days</th>
              <th className="num">Mood</th>
              <th className="num">Energy</th>
              <th className="num">Anxiety</th>
              <th className="num">Sleep (h)</th>
            </tr>
          </thead>
          <tbody>
            {r.weeks.map((w) => (
              <tr key={w.start}>
                <td>
                  {formatDate(w.start)} – {formatDate(w.end)}
                </td>
                <td className="num">{w.days}</td>
                <td className="num">{w.mood ?? '–'}</td>
                <td className="num">{w.energy ?? '–'}</td>
                <td className="num">{w.anxiety ?? '–'}</td>
                <td className="num">{w.sleepHours ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Questionnaires</h2>
        {r.assessments.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Questionnaire</th>
                <th className="num">Score</th>
                <th>Band</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {r.assessments.map((a, i) => (
                <tr key={i}>
                  <td>{formatDate(a.takenAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{a.name}</td>
                  <td className="num">
                    {a.score} / {a.max}
                  </td>
                  <td>{a.severity}</td>
                  <td>{a.safetyFlag ? 'Item 9 answered above "not at all"' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No questionnaires in this period.</p>
        )}
      </section>

      {r.sharedNotes.length > 0 && (
        <section>
          <h2>Notes the patient chose to share</h2>
          <ul className="report-notes">
            {r.sharedNotes.map((s) => (
              <li key={s.date}>
                <strong>{formatDate(s.date, { day: 'numeric', month: 'short' })}</strong> (mood: {SCALES.mood.options[s.mood - 1].toLowerCase()}): {s.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.questions.length > 0 && (
        <section>
          <h2>Questions for this appointment</h2>
          <ol>
            {r.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </section>
      )}

      {r.care.length > 0 && (
        <section>
          <h2>Search for care</h2>
          <table className="table">
            <tbody>
              {r.care.map((x, i) => (
                <tr key={i}>
                  <td>{x.name}</td>
                  <td>{CONTACT_KINDS[x.kind]}</td>
                  <td>{CONTACT_STATUSES[x.status]}</td>
                  <td>{x.appointmentAt ? formatDateTime(x.appointmentAt) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </article>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, ErrorText, Field, Loading, Page, Scale } from '../components/ui'
import { api } from '../lib/api'
import { ACTIVITIES, addDays, formatDate, localToday, SCALES } from '../lib/format'

const EMPTY = { mood: null, energy: null, anxiety: null, sleepHours: '', sleepQuality: null, activities: [], note: '', includeInReport: false }

export default function CheckIn() {
  const navigate = useNavigate()
  const today = localToday()
  const { date: paramDate } = useParams()
  const date = paramDate ?? today
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [existing, setExisting] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [lowSaved, setLowSaved] = useState(false)

  useEffect(() => {
    setLoading(true)
    api(`/checkins?from=${date}&to=${date}`)
      .then((d) => {
        const c = d.checkIns[0]
        setExisting(Boolean(c))
        setForm(c ? { ...EMPTY, ...c, sleepHours: c.sleepHours ?? '' } : EMPTY)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [date])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (key) => set('activities', form.activities.includes(key) ? form.activities.filter((a) => a !== key) : [...form.activities, key])
  const complete = form.mood && form.energy && form.anxiety

  const submit = async (e) => {
    e.preventDefault()
    if (!complete) return setError(new Error('Please answer mood, energy and anxiety.'))
    setBusy(true)
    setError(null)
    try {
      await api(`/checkins/${date}`, {
        method: 'PUT',
        body: {
          mood: form.mood,
          energy: form.energy,
          anxiety: form.anxiety,
          sleepHours: form.sleepHours === '' ? null : Number(form.sleepHours),
          sleepQuality: form.sleepQuality,
          activities: form.activities,
          note: form.note,
          includeInReport: form.includeInReport,
        },
      })
      if (form.mood <= 2) setLowSaved(true)
      else navigate('/today', { state: { saved: true } })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />

  if (lowSaved) {
    return (
      <Page title="Saved. It sounds like a hard day." narrow>
        <Card>
          <p>Thank you for checking in anyway; noticing a hard day is a step in itself. Would one of these help right now?</p>
          <div className="choice-list">
            <Link to="/companion" className="choice">
              <strong>Talk it through</strong>
              <span>A few minutes with the companion</span>
            </Link>
            <Link to="/safety-plan" className="choice">
              <strong>Open my safety plan</strong>
              <span>What helps me, and who I can call</span>
            </Link>
            <Link to="/help" className="choice">
              <strong>Help now</strong>
              <span>Crisis lines, breathing and grounding</span>
            </Link>
          </div>
          <Link to="/today" className="btn btn-ghost">
            Back to today
          </Link>
        </Card>
      </Page>
    )
  }

  const earliest = addDays(today, -7)

  return (
    <Page title={existing ? 'Edit check-in' : 'Daily check-in'} intro={date === today ? 'How are you today?' : `For ${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}`} narrow>
      <form onSubmit={submit} className="stack-lg">
        <Card>
          <div className="stack">
            <fieldset className="q">
              <legend>Mood</legend>
              <Scale name="Mood" value={form.mood} onChange={(v) => set('mood', v)} options={SCALES.mood.options} required />
            </fieldset>
            <fieldset className="q">
              <legend>Energy</legend>
              <Scale name="Energy" value={form.energy} onChange={(v) => set('energy', v)} options={SCALES.energy.options} required />
            </fieldset>
            <fieldset className="q">
              <legend>Anxiety</legend>
              <Scale name="Anxiety" value={form.anxiety} onChange={(v) => set('anxiety', v)} options={SCALES.anxiety.options} required />
            </fieldset>
          </div>
        </Card>

        <Card title="Last night's sleep">
          <div className="row-fields">
            <Field label="Hours slept">
              <input type="number" inputMode="decimal" min="0" max="16" step="0.5" placeholder="e.g. 7" value={form.sleepHours} onChange={(e) => set('sleepHours', e.target.value)} />
            </Field>
          </div>
          <fieldset className="q">
            <legend>Sleep quality (optional)</legend>
            <Scale name="Sleep quality" value={form.sleepQuality} onChange={(v) => set('sleepQuality', form.sleepQuality === v ? null : v)} options={SCALES.sleepQuality.options} />
          </fieldset>
        </Card>

        <Card title="Today I…">
          <div className="chips">
            {ACTIVITIES.map((a) => (
              <button key={a.key} type="button" className={`chip ${form.activities.includes(a.key) ? 'on' : ''}`} aria-pressed={form.activities.includes(a.key)} onClick={() => toggle(a.key)}>
                {a.label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Anything on your mind?">
          <Field label="Note (private)" hint="Only you can see this unless you tick the box below.">
            <textarea rows={4} maxLength={1000} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="What happened, what helped, what you want to remember…" />
          </Field>
          <label className="check">
            <input type="checkbox" checked={form.includeInReport} onChange={(e) => set('includeInReport', e.target.checked)} />
            Include this note in my appointment report
          </label>
        </Card>

        <ErrorText error={error} />
        <div className="row">
          <button className="btn btn-primary btn-lg" disabled={busy || !complete}>
            {busy ? 'Saving…' : 'Save check-in'}
          </button>
          {date === today && (
            <label className="date-switch">
              Check in for another day
              <input type="date" min={earliest} max={today} value={date} onChange={(e) => e.target.value && navigate(`/check-in/${e.target.value}`)} />
            </label>
          )}
        </div>
      </form>
    </Page>
  )
}

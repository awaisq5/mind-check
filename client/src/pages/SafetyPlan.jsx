import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner, Card, ErrorText, Loading, Page } from '../components/ui'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'

const LIST_SECTIONS = [
  { key: 'warningSigns', title: '1. My warning signs', hint: 'Thoughts, feelings or situations that tell me a crisis may be coming.', placeholder: 'e.g. I stop answering messages' },
  { key: 'copingStrategies', title: '2. Things I can do on my own', hint: 'What helps me feel a little better, without anyone else.', placeholder: 'e.g. A walk around the block' },
  { key: 'distractions', title: '3. People and places that take my mind off things', hint: 'Not to talk about the crisis, just to be around others.', placeholder: 'e.g. The café on the corner' },
]
const PEOPLE_SECTIONS = [
  { key: 'supportPeople', title: '4. People I can ask for help', hint: 'Friends or family I can tell how I feel.' },
  { key: 'professionals', title: '5. Professionals I can contact', hint: 'My therapist, doctor, or a service I trust.' },
]
const LATER_SECTIONS = [
  { key: 'safeEnvironment', title: '6. Making my surroundings safer', hint: 'Steps that put distance between me and anything I could use to hurt myself.', placeholder: 'e.g. Ask someone to keep my medication' },
  { key: 'reasonsToLive', title: '7. What matters most to me', hint: 'People, plans and things worth staying for.', placeholder: 'e.g. My sister, my cat, the trip next summer' },
]

function ListEditor({ items, onChange, placeholder }) {
  return (
    <div className="list-editor">
      {items.map((v, i) => (
        <div key={i} className="list-row">
          <input value={v} maxLength={300} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} />
          <button type="button" className="icon-btn" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...items, ''])}>
        + Add
      </button>
    </div>
  )
}

function PeopleEditor({ people, onChange }) {
  return (
    <div className="list-editor">
      {people.map((p, i) => (
        <div key={i} className="list-row two">
          <input value={p.name} maxLength={80} placeholder="Name" onChange={(e) => onChange(people.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
          <input value={p.phone} maxLength={40} placeholder="Phone" type="tel" onChange={(e) => onChange(people.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
          <button type="button" className="icon-btn" aria-label="Remove" onClick={() => onChange(people.filter((_, j) => j !== i))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...people, { name: '', phone: '' }])}>
        + Add person
      </button>
    </div>
  )
}

export default function SafetyPlan() {
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/care/safety-plan').then((d) => setPlan(d.plan)).catch(setError)
  }, [])

  if (!plan) return error ? <Page><ErrorText error={error} /></Page> : <Loading />

  const set = (k, v) => {
    setSaved(false)
    setPlan((p) => ({ ...p, [k]: v }))
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const { updatedAt, ...body } = plan
      const d = await api('/care/safety-plan', { method: 'PUT', body })
      setPlan(d.plan)
      setSaved(true)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      title="My safety plan"
      intro="Write this on a calmer day, ideally with someone you trust or your therapist. When things get hard, you won't need to think: the steps are already here."
      actions={
        <Link className="btn btn-ghost" to="/help">
          View in Help now
        </Link>
      }
      narrow
    >
      {plan.updatedAt && <p className="muted small">Last updated {formatDate(plan.updatedAt, { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
      {LIST_SECTIONS.map((s) => (
        <Card key={s.key} title={s.title}>
          <p className="muted small">{s.hint}</p>
          <ListEditor items={plan[s.key]} onChange={(v) => set(s.key, v)} placeholder={s.placeholder} />
        </Card>
      ))}
      {PEOPLE_SECTIONS.map((s) => (
        <Card key={s.key} title={s.title}>
          <p className="muted small">{s.hint}</p>
          <PeopleEditor people={plan[s.key]} onChange={(v) => set(s.key, v)} />
        </Card>
      ))}
      {LATER_SECTIONS.map((s) => (
        <Card key={s.key} title={s.title}>
          <p className="muted small">{s.hint}</p>
          <ListEditor items={plan[s.key]} onChange={(v) => set(s.key, v)} placeholder={s.placeholder} />
        </Card>
      ))}
      <ErrorText error={error} />
      {saved && <Banner tone="ok">Safety plan saved.</Banner>}
      <div className="sticky-save">
        <button className="btn btn-primary btn-lg" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save safety plan'}
        </button>
      </div>
      <p className="muted small">The structure follows the Stanley-Brown safety planning intervention. If you are in danger now, call 112 or use Help now.</p>
    </Page>
  )
}

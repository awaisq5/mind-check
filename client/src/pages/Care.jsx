import { useState } from 'react'
import { Card, Empty, ErrorText, Field, Loading, Page } from '../components/ui'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { addDays, CONTACT_KINDS, CONTACT_STATUSES, formatDate, formatDateTime, localToday, telHref } from '../lib/format'
import { useApi } from '../lib/useApi'

const BLANK = { name: '', kind: 'psychotherapist', phone: '', email: '', status: 'to-contact', lastContactOn: '', followUpOn: '', appointmentAt: '', notes: '' }

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

function ContactForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...BLANK, ...initial, appointmentAt: toLocalInput(initial?.appointmentAt) })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSave({
        name: form.name,
        kind: form.kind,
        phone: form.phone,
        email: form.email,
        status: form.status,
        notes: form.notes,
        lastContactOn: form.lastContactOn || null,
        followUpOn: form.followUpOn || null,
        appointmentAt: form.appointmentAt ? new Date(form.appointmentAt).toISOString() : null,
      })
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Practice or person">
          <input required maxLength={120} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Praxis Dr. Weber" />
        </Field>
        <Field label="Type">
          <select value={form.kind} onChange={(e) => set('kind', e.target.value)}>
            {Object.entries(CONTACT_KINDS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Phone">
          <input type="tel" maxLength={40} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" maxLength={120} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(CONTACT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Last contact">
          <input type="date" value={form.lastContactOn ?? ''} onChange={(e) => set('lastContactOn', e.target.value)} />
        </Field>
        <Field label="Follow up on" hint="Mind Check reminds you on this day.">
          <input type="date" value={form.followUpOn ?? ''} onChange={(e) => set('followUpOn', e.target.value)} />
        </Field>
        <Field label="Appointment">
          <input type="datetime-local" value={form.appointmentAt} onChange={(e) => set('appointmentAt', e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea rows={2} maxLength={1000} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Phone hours, who you spoke to, what they said…" />
      </Field>
      <ErrorText error={error} />
      <div className="row">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function Questions() {
  const { data, loading, error, reload } = useApi('/care/questions')
  const [text, setText] = useState('')
  const [err, setErr] = useState(null)

  const add = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await api('/care/questions', { method: 'POST', body: { text } })
      setText('')
      reload()
    } catch (x) {
      setErr(x)
    }
  }
  const toggle = async (q) => {
    await api(`/care/questions/${q.id}`, { method: 'PATCH', body: { done: !q.done } })
    reload()
  }
  const remove = async (q) => {
    await api(`/care/questions/${q.id}`, { method: 'DELETE' })
    reload()
  }

  return (
    <Card title="Questions for my next appointment">
      <p className="muted small">Write them down when they come to you; appointments go fast. Open questions appear in your appointment report.</p>
      {loading ? (
        <Loading />
      ) : (
        <ul className="questions">
          {data?.questions.map((q) => (
            <li key={q.id} className={q.done ? 'done' : ''}>
              <label className="check">
                <input type="checkbox" checked={q.done} onChange={() => toggle(q)} />
                {q.text}
              </label>
              <button className="icon-btn" aria-label="Delete question" onClick={() => remove(q)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorText error={error || err} />
      <form className="inline-add" onSubmit={add}>
        <input value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="e.g. Could my sleep problems be part of this?" aria-label="New question" />
        <button className="btn btn-primary" disabled={!text.trim()}>
          Add
        </button>
      </form>
    </Card>
  )
}

export default function Care() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useApi('/care/contacts')
  const [editing, setEditing] = useState(null) // 'new' | contact id
  const today = localToday()

  const save = async (body) => {
    if (editing === 'new') await api('/care/contacts', { method: 'POST', body })
    else await api(`/care/contacts/${editing}`, { method: 'PATCH', body })
    setEditing(null)
    reload()
  }

  const logCall = async (c) => {
    await api(`/care/contacts/${c.id}`, {
      method: 'PATCH',
      body: { lastContactOn: today, followUpOn: addDays(today, 7), status: c.status === 'to-contact' ? 'contacted' : c.status },
    })
    reload()
  }

  const remove = async (c) => {
    await api(`/care/contacts/${c.id}`, { method: 'DELETE' })
    reload()
  }

  const contacts = data?.contacts ?? []
  const counts = Object.keys(CONTACT_STATUSES).map((s) => [s, contacts.filter((c) => c.status === s).length])

  return (
    <Page
      title="Care"
      intro="Keep your search for care moving: every practice you contact, what they said, and when to follow up."
      actions={
        editing !== 'new' && (
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            Add practice or contact
          </button>
        )
      }
    >
      {user.settings.region === 'DE' && (
        <Card tone="soft">
          <p>
            <strong>In Germany:</strong> the appointment service on <a href={telHref('116117')}>116 117</a> or <a href="https://www.116117.de" target="_blank" rel="noreferrer">116117.de</a> can help you get a first psychotherapy consultation (psychotherapeutische Sprechstunde). Many practices have fixed phone hours: note them here.
          </p>
        </Card>
      )}

      {editing === 'new' && (
        <Card title="New contact">
          <ContactForm onSave={save} onCancel={() => setEditing(null)} />
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorText error={error} />
      ) : contacts.length === 0 && editing !== 'new' ? (
        <Empty title="No contacts yet">Add the practices you've called or plan to call. Mind Check will remind you when to follow up.</Empty>
      ) : (
        <>
          {contacts.length > 0 && (
            <div className="status-strip">
              {counts
                .filter(([, n]) => n)
                .map(([s, n]) => (
                  <span key={s} className={`pill st-${s}`}>
                    {CONTACT_STATUSES[s]}: {n}
                  </span>
                ))}
            </div>
          )}
          <div className="contacts">
            {contacts.map((c) =>
              editing === c.id ? (
                <Card key={c.id} title={`Edit ${c.name}`}>
                  <ContactForm initial={c} onSave={save} onCancel={() => setEditing(null)} />
                </Card>
              ) : (
                <article key={c.id} className={`contact ${c.followUpOn && c.followUpOn <= today ? 'due' : ''}`}>
                  <header>
                    <div>
                      <h3>{c.name}</h3>
                      <p className="muted small">{CONTACT_KINDS[c.kind]}</p>
                    </div>
                    <span className={`pill st-${c.status}`}>{CONTACT_STATUSES[c.status]}</span>
                  </header>
                  <dl className="facts">
                    {c.appointmentAt && (
                      <>
                        <dt>Appointment</dt>
                        <dd>{formatDateTime(c.appointmentAt)}</dd>
                      </>
                    )}
                    {c.lastContactOn && (
                      <>
                        <dt>Last contact</dt>
                        <dd>{formatDate(c.lastContactOn)}</dd>
                      </>
                    )}
                    {c.followUpOn && (
                      <>
                        <dt>Follow up</dt>
                        <dd className={c.followUpOn <= today ? 'due-text' : ''}>{c.followUpOn <= today ? `Due (${formatDate(c.followUpOn)})` : formatDate(c.followUpOn)}</dd>
                      </>
                    )}
                  </dl>
                  {c.notes && <p className="small">{c.notes}</p>}
                  <div className="row">
                    {c.phone && (
                      <a className="btn btn-ghost btn-sm" href={telHref(c.phone)}>
                        Call {c.phone}
                      </a>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => logCall(c)} title="Sets last contact to today and a follow-up in 7 days">
                      Log contact today
                    </button>
                  </div>
                  <footer className="contact-foot">
                    <button className="link-btn" onClick={() => setEditing(c.id)}>
                      Edit
                    </button>
                    <button className="link-btn subtle" onClick={() => remove(c)}>
                      Remove
                    </button>
                  </footer>
                </article>
              ),
            )}
          </div>
        </>
      )}

      <Questions />
    </Page>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, ErrorText, Page } from '../components/ui'
import { api } from '../lib/api'
import { telHref } from '../lib/format'
import { useApi } from '../lib/useApi'

const STARTERS = ["I'm finding today hard", 'I keep worrying about something', "I can't sleep", 'Help me prepare for my appointment']

export default function Companion() {
  const status = useApi('/chat/status')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  const send = async (content) => {
    const value = content.trim()
    if (!value || busy) return
    const next = [...messages, { role: 'user', content: value }]
    setMessages(next)
    setText('')
    setBusy(true)
    setError(null)
    try {
      const d = await api('/chat', { method: 'POST', body: { messages: next.map(({ role, content }) => ({ role, content })) } })
      setMessages([...next, { role: 'assistant', content: d.reply, crisis: d.crisis, resources: d.resources }])
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const available = status.data?.available

  return (
    <Page title="Companion" intro="Talk things through, any time. Conversations are not saved: they disappear when you leave this page." narrow>
      <Card tone="soft">
        <p className="small">
          The companion is an AI. It can listen and suggest small steps, but it can't diagnose or treat, and it is not a person. If you mention risk to your life it will point you to people straight away.{' '}
          {status.data && (status.data.sharesContext ? 'It can see a short summary of your recent check-ins.' : 'It cannot see your check-ins.')} <Link to="/settings">Change in settings</Link>
        </p>
      </Card>

      {status.data && !available && <p className="muted">The companion is switched off on this server. Your safety plan and Help now are always available.</p>}

      <div className="chat" aria-live="polite">
        {messages.length === 0 && (
          <div className="starters">
            {STARTERS.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)} disabled={!available}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.crisis ? (
            <div key={i} className="bubble bubble-crisis" role="alert">
              {m.content.split('\n\n').map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              <div className="call-list">
                {m.resources?.emergency && (
                  <a className="call call-danger" href={telHref(m.resources.emergency)}>
                    <strong>{m.resources.emergency}</strong>
                    <span>Emergency</span>
                  </a>
                )}
                {m.resources?.crisisLines.map((l) => (
                  <a key={l.phone} className="call" href={telHref(l.phone)}>
                    <strong>{l.phone}</strong>
                    <span>{l.name}</span>
                  </a>
                ))}
              </div>
              <Link to="/safety-plan" className="btn btn-primary btn-sm">
                Open my safety plan
              </Link>
            </div>
          ) : (
            <div key={i} className={`bubble ${m.role === 'user' ? 'bubble-me' : 'bubble-ai'}`}>
              {m.content.split('\n').map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          ),
        )}
        {busy && <div className="bubble bubble-ai typing">…</div>}
        <div ref={endRef} />
      </div>

      <ErrorText error={error} />
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <textarea
          rows={2}
          maxLength={2000}
          value={text}
          disabled={!available}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(text)
            }
          }}
          placeholder="Write a message…"
          aria-label="Message"
        />
        <button className="btn btn-primary" disabled={!available || busy || !text.trim()}>
          Send
        </button>
      </form>
    </Page>
  )
}

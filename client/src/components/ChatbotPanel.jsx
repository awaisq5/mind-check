import { useState } from 'react'
import { apiFetch } from '../lib/api'

export default function ChatbotPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I noticed you've been having a difficult time lately. I'm here to listen. How are you feeling right now?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: nextMessages }),
      })

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'I am here with you.' },
      ])
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          height: '75%',
          background: 'var(--color-surface)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>Mind Check Support</p>
            <p style={{ fontSize: 12 }}>Supportive AI chat</p>
          </div>
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                padding: '12px 14px',
                borderRadius: 16,
                background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-primary-light)',
                color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
              }}
            >
              <p style={{ color: 'inherit' }}>{msg.content}</p>
            </div>
          ))}

          {loading && <p>Typing…</p>}
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Write how you feel..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
            />
            <button className="btn btn-primary" style={{ width: 'auto', padding: '0 18px' }} onClick={handleSend}>
              Send
            </button>
          </div>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            This chat is supportive only and not a substitute for professional care.
          </p>
        </div>
      </div>
    </div>
  )
}
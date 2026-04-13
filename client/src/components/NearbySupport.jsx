import { useState } from 'react'

export default function NearbySupport() {
  const [zipCode, setZipCode] = useState('')

  const handleSearch = () => {
    const trimmed = zipCode.trim()

    if (!trimmed) return

    const url = `https://www.google.com/maps/search/therapist+near+${encodeURIComponent(trimmed)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-text)' }}>
        Find nearby support
      </p>
      <p style={{ marginBottom: 12 }}>
        Enter your ZIP code to search for therapists or mental health specialists near you.
      </p>

      <div className="input-group" style={{ marginBottom: 12 }}>
        <label className="input-label">ZIP Code</label>
        <input
          type="text"
          placeholder="e.g. 29225"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
      </div>

      <button className="btn btn-secondary" onClick={handleSearch}>
        Search nearby specialists
      </button>
    </div>
  )
}
import { useState } from 'react'

export default function FindSupport() {
  const [form, setForm] = useState({
    street: '',
    city: '',
    zip: '',
    country: '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSearch = () => {
    if (!form.city.trim() || !form.zip.trim()) {
      alert('City and ZIP are required.')
      return
    }

    const query = [
      form.street.trim(),
      form.zip.trim(),
      form.city.trim(),
      form.country.trim(),
      'therapist or psychotherapist',
    ]
      .filter(Boolean)
      .join(' ')

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 8,
        }}
      >
        Find nearby support
      </p>

      <p style={{ marginBottom: 16, lineHeight: 1.7 }}>
        Enter your location to search for therapists or mental health specialists near you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="input-group">
          <label className="input-label">Street <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span></label>
          <input
            type="text"
            name="street"
            placeholder="Your Address"
            value={form.street}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label className="input-label">City</label>
          <input
            type="text"
            name="city"
            placeholder="Your City"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label className="input-label">ZIP Code</label>
          <input
            type="text"
            name="zip"
            placeholder="Your ZIP Code"
            value={form.zip}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Country</label>
          <input
            type="text"
            name="country"
            placeholder="Your Country"
            value={form.country}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-secondary" onClick={handleSearch}>
          Search nearby specialists
        </button>
      </div>
    </div>
  )
}
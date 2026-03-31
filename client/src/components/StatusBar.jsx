export default function StatusBar() {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <div className="status-bar">
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="4" width="3" height="8" rx="1" fill="currentColor" opacity="0.4" />
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="9" y="0" width="3" height="12" rx="1" fill="currentColor" />
          <rect x="13.5" y="1" width="2" height="10" rx="1" fill="currentColor" opacity="0.3" />
        </svg>
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
          <path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.7C12.7 1.9 10.2 0.8 7.5 0.8C4.8 0.8 2.3 1.9 0.5 3.7L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5Z" fill="currentColor" opacity="0.4" />
          <path d="M7.5 5.5C9 5.5 10.4 6.1 11.4 7.1L12.7 5.8C11.3 4.5 9.5 3.7 7.5 3.7C5.5 3.7 3.7 4.5 2.3 5.8L3.6 7.1C4.6 6.1 6 5.5 7.5 5.5Z" fill="currentColor" opacity="0.7" />
          <circle cx="7.5" cy="10" r="1.5" fill="currentColor" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600 }}>■■■</span>
      </div>
    </div>
  )
}

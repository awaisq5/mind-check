// Builds a calendar file with recurring reminders, so reminders work in any
// calendar app without push notifications or a background service.

const pad = (n) => String(n).padStart(2, '0')

function stamp(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}

function localStart(time, offsetDays = 0) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`
}

function event({ uid, summary, description, start, rrule, url }) {
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${start}`,
    'DURATION:PT5M',
    `RRULE:${rrule}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    url ? `URL:${url}` : null,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
  ]
    .filter(Boolean)
    .join('\r\n')
}

export function remindersIcs({ time = '20:00', appUrl }) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mind Check//Reminders//EN',
    'CALSCALE:GREGORIAN',
    event({
      uid: 'mindcheck-daily@mindcheck',
      summary: 'Mind Check: daily check-in',
      description: 'One minute: mood, energy, anxiety and sleep.',
      start: localStart(time),
      rrule: 'FREQ=DAILY',
      url: appUrl,
    }),
    event({
      uid: 'mindcheck-biweekly@mindcheck',
      summary: 'Mind Check: PHQ-9 and GAD-7',
      description: 'Your two-weekly questionnaires are due.',
      start: localStart(time, 14),
      rrule: 'FREQ=DAILY;INTERVAL=14',
      url: appUrl,
    }),
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadText(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

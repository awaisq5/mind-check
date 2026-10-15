import { Link, useLocation } from 'react-router-dom'
import { LineChart } from '../components/LineChart'
import { Banner, Card, ErrorText, Loading, Page, Stat } from '../components/ui'
import { useAuth } from '../lib/auth'
import { addDays, formatDate, formatDateTime, greeting, localToday, SCALES } from '../lib/format'
import { useApi } from '../lib/useApi'

const PROMPT_ACTIONS = {
  safety: [
    { to: '/help', label: 'Open Help now' },
    { to: '/safety-plan', label: 'My safety plan' },
  ],
  worse: [
    { to: '/care', label: 'Contact my care team' },
    { to: '/report', label: 'Prepare a report' },
  ],
  'low-run': [
    { to: '/companion', label: 'Talk it through' },
    { to: '/safety-plan', label: 'My safety plan' },
  ],
  'follow-up': [{ to: '/care', label: 'Open care tracker' }],
}

const TONE = { safety: 'danger', worse: 'warn', 'low-run': 'warn', 'assessment-due': 'info', 'follow-up': 'info' }

export default function Today() {
  const { user } = useAuth()
  const today = localToday()
  const location = useLocation()
  const insights = useApi(`/insights?today=${today}`)
  const recent = useApi(`/checkins?from=${addDays(today, -13)}&to=${today}`)

  if (insights.loading) return <Loading />
  if (insights.error) return <Page><ErrorText error={insights.error} /></Page>

  const ins = insights.data.insights
  const w = ins.week.current
  const p = ins.week.previous
  const d = (a, b) => (a !== null && b !== null ? a - b : null)
  const byDate = new Map((recent.data?.checkIns ?? []).map((c) => [c.date, c]))
  const points = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i - 13)
    const c = byDate.get(date)
    return { date, mood: c?.mood ?? null, energy: c?.energy ?? null }
  })
  const todayEntry = byDate.get(today)

  return (
    <Page title={`${greeting()}, ${user.name}`} intro={formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}>
      {location.state?.saved && <Banner tone="ok">Check-in saved. Thank you for taking a minute for yourself.</Banner>}

      {ins.prompts.length > 0 && (
        <div className="prompts">
          {ins.prompts.map((pr, i) => (
            <Banner
              key={i}
              tone={TONE[pr.kind]}
              action={
                <div className="banner-actions">
                  {pr.kind === 'assessment-due' ? (
                    <Link className="btn btn-sm btn-primary" to={`/questionnaires/${pr.type}`}>
                      Start
                    </Link>
                  ) : (
                    (PROMPT_ACTIONS[pr.kind] ?? []).map((a) => (
                      <Link key={a.to} className="btn btn-sm btn-ghost" to={a.to}>
                        {a.label}
                      </Link>
                    ))
                  )}
                </div>
              }
            >
              {pr.text}
            </Banner>
          ))}
        </div>
      )}

      <div className="grid-2">
        <Card title="Today's check-in" tone={todayEntry ? undefined : 'accent'}>
          {todayEntry ? (
            <div className="today-done">
              <p>
                You felt <strong>{SCALES.mood.options[todayEntry.mood - 1].toLowerCase()}</strong>, energy{' '}
                <strong>{SCALES.energy.options[todayEntry.energy - 1].toLowerCase()}</strong>, anxiety <strong>{SCALES.anxiety.options[todayEntry.anxiety - 1].toLowerCase()}</strong>
                {todayEntry.sleepHours !== null ? `, after ${todayEntry.sleepHours} hours of sleep` : ''}.
              </p>
              <Link to={`/check-in/${today}`} className="btn btn-ghost btn-sm">
                Edit today's check-in
              </Link>
            </div>
          ) : (
            <div className="today-todo">
              <p>One minute: how are you today?</p>
              <Link to="/check-in" className="btn btn-primary btn-lg">
                Check in now
              </Link>
            </div>
          )}
        </Card>

        <Card title="Next appointment">
          {ins.nextAppointment ? (
            <div>
              <p className="big">{formatDateTime(ins.nextAppointment.appointmentAt)}</p>
              <p className="muted">{ins.nextAppointment.name}</p>
              <div className="row">
                <Link to="/report" className="btn btn-ghost btn-sm">
                  Prepare a report
                </Link>
                <Link to="/care" className="btn btn-ghost btn-sm">
                  My questions
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="muted">No appointment booked yet. Keep track of the practices you contact and when to follow up.</p>
              <Link to="/care" className="btn btn-ghost btn-sm">
                Open care tracker
              </Link>
            </div>
          )}
        </Card>
      </div>

      <Card title="This week" action={<Link to="/trends">See trends</Link>}>
        {w.days === 0 ? (
          <p className="muted">No check-ins in the last 7 days yet. Your weekly averages appear here after your first check-in.</p>
        ) : (
          <>
            <div className="stats">
              <Stat label="Mood" value={w.mood} sub="average of 5" delta={d(w.mood, p.mood)} />
              <Stat label="Energy" value={w.energy} sub="average of 5" delta={d(w.energy, p.energy)} />
              <Stat label="Anxiety" value={w.anxiety} sub="average of 5" delta={d(w.anxiety, p.anxiety)} betterWhen="lower" />
              <Stat label="Sleep" value={w.sleepHours !== null ? `${w.sleepHours} h` : null} sub="average per night" delta={d(w.sleepHours, p.sleepHours)} />
            </div>
            <LineChart
              points={points}
              label="Mood and energy over the last 14 days"
              series={[
                { key: 'mood', label: 'Mood', color: 'var(--c-mood)' },
                { key: 'energy', label: 'Energy', color: 'var(--c-energy)' },
              ]}
              height={160}
            />
            <p className="muted small">Checked in on {w.days} of the last 7 days and {ins.loggedLast30} of the last 30.</p>
          </>
        )}
      </Card>
    </Page>
  )
}

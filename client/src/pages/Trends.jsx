import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, ScoreBars } from '../components/LineChart'
import { Card, Empty, ErrorText, Loading, Page } from '../components/ui'
import { addDays, localToday } from '../lib/format'
import { useApi } from '../lib/useApi'

const RANGES = [14, 30, 90]

export default function Trends() {
  const today = localToday()
  const [days, setDays] = useState(30)
  const checkins = useApi(`/checkins?from=${addDays(today, -(days - 1))}&to=${today}`)
  const insights = useApi(`/insights?today=${today}`)
  const assessments = useApi('/assessments')

  if (checkins.loading || insights.loading) return <Loading />
  const error = checkins.error || insights.error
  if (error) return <Page><ErrorText error={error} /></Page>

  const list = checkins.data.checkIns
  const byDate = new Map(list.map((c) => [c.date, c]))
  const points = Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - (days - 1))
    const c = byDate.get(date)
    return { date, mood: c?.mood ?? null, energy: c?.energy ?? null, anxiety: c?.anxiety ?? null, sleepHours: c?.sleepHours ?? null }
  })
  const ins = insights.data.insights
  const results = assessments.data?.assessments ?? []

  return (
    <Page
      title="Trends"
      intro="Patterns in your check-ins. These show what tends to go together, not what causes what."
      actions={
        <div className="seg" role="tablist" aria-label="Period">
          {RANGES.map((r) => (
            <button key={r} role="tab" aria-selected={days === r} className={days === r ? 'on' : ''} onClick={() => setDays(r)}>
              {r} days
            </button>
          ))}
        </div>
      }
    >
      {list.length === 0 ? (
        <Empty title="No check-ins in this period yet" to="/check-in" cta="Check in now">
          After a week of check-ins you'll start to see your pattern here.
        </Empty>
      ) : (
        <>
          <Card title="Mood, energy and anxiety">
            <LineChart
              points={points}
              label={`Mood, energy and anxiety over ${days} days`}
              series={[
                { key: 'mood', label: 'Mood', color: 'var(--c-mood)' },
                { key: 'energy', label: 'Energy', color: 'var(--c-energy)' },
                { key: 'anxiety', label: 'Anxiety', color: 'var(--c-anxiety)' },
              ]}
            />
            <p className="muted small">
              {list.length} of {days} days logged. Gaps in the lines are days without a check-in.
            </p>
          </Card>

          <Card title="Sleep">
            <LineChart points={points} min={0} max={12} yTicks={[0, 4, 8, 12]} yLabel={(v) => `${v}h`} label="Hours of sleep" series={[{ key: 'sleepHours', label: 'Hours slept', color: 'var(--c-sleep)' }]} height={150} />
          </Card>
        </>
      )}

      <Card title="What tends to go with better days" action={<span className="muted small">last 30 days</span>}>
        {ins.activityEffects.length === 0 && !ins.sleepEffect ? (
          <p className="muted">Not enough data yet. Once you have at least three days with and three without an activity, differences of 0.3 points or more show up here.</p>
        ) : (
          <ul className="effects">
            {ins.sleepEffect && (
              <li>
                <span className={`effect-badge ${ins.sleepEffect.difference >= 0 ? 'up' : 'down'}`}>{`${ins.sleepEffect.difference > 0 ? '+' : ''}${ins.sleepEffect.difference}`}</span>
                <span>
                  After {ins.sleepEffect.threshold}+ hours of sleep your mood averaged {ins.sleepEffect.moodEnough}, after shorter nights {ins.sleepEffect.moodShort}{' '}
                  <span className="muted">
                    ({ins.sleepEffect.enoughDays} and {ins.sleepEffect.shortDays} days)
                  </span>
                </span>
              </li>
            )}
            {ins.activityEffects.map((e) => (
              <li key={e.activity}>
                <span className={`effect-badge ${e.difference >= 0 ? 'up' : 'down'}`}>{`${e.difference > 0 ? '+' : ''}${e.difference}`}</span>
                <span>
                  On days you {e.phrase}, your mood averaged {e.moodWith}, otherwise {e.moodWithout}{' '}
                  <span className="muted">
                    ({e.withDays} and {e.withoutDays} days)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid-2">
        {[
          { type: 'phq9', name: 'PHQ-9 · mood', max: 27 },
          { type: 'gad7', name: 'GAD-7 · anxiety', max: 21 },
        ].map((q) => {
          const r = results.filter((a) => a.type === q.type).slice(-8)
          return (
            <Card key={q.type} title={q.name} action={<Link to={`/questionnaires/${q.type}`}>Take it</Link>}>
              {r.length ? <ScoreBars results={r} max={q.max} label={`${q.name} scores`} /> : <p className="muted">No results yet. Taking it every two weeks shows how things change.</p>}
            </Card>
          )
        })}
      </div>
    </Page>
  )
}

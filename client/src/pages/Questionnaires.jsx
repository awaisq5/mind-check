import { Link } from 'react-router-dom'
import { Card, ErrorText, Loading, Page } from '../components/ui'
import { formatDate } from '../lib/format'
import { useApi } from '../lib/useApi'

const INFO = {
  phq9: { title: 'PHQ-9', topic: 'Mood', text: 'Nine questions about the last two weeks, widely used in primary care to measure low mood.', max: 27 },
  gad7: { title: 'GAD-7', topic: 'Anxiety', text: 'Seven questions about the last two weeks, widely used to measure anxiety.', max: 21 },
}

export default function Questionnaires() {
  const results = useApi('/assessments')
  if (results.loading) return <Loading />
  if (results.error) return <Page><ErrorText error={results.error} /></Page>
  const all = results.data.assessments

  return (
    <Page title="Questionnaires" intro="Take each one every two weeks. A single score means little; the change over time is what your doctor or therapist will find useful.">
      <div className="grid-2">
        {Object.entries(INFO).map(([type, q]) => {
          const mine = all.filter((a) => a.type === type)
          const last = mine[mine.length - 1]
          const days = last ? Math.floor((Date.now() - new Date(last.takenAt)) / 86_400_000) : null
          const due = !last || days >= 14
          return (
            <Card key={type} title={`${q.title} · ${q.topic}`} tone={due ? 'accent' : undefined}>
              <p className="muted">{q.text}</p>
              {last && (
                <p>
                  Last result: <strong>{last.score}</strong> of {q.max}, {last.severity.toLowerCase()} ({formatDate(last.takenAt)})
                </p>
              )}
              <Link to={`/questionnaires/${type}`} className={`btn ${due ? 'btn-primary' : 'btn-ghost'}`}>
                {due ? (last ? 'Due now: start' : 'Start') : `Next due in ${14 - days} days · take now`}
              </Link>
              {mine.length > 0 && (
                <table className="table small-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="num">Score</th>
                      <th>Band</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...mine].reverse().slice(0, 6).map((a) => (
                      <tr key={a.id}>
                        <td>{formatDate(a.takenAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="num">{a.score}</td>
                        <td>{a.severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )
        })}
      </div>
      <p className="muted small">
        PHQ-9 and GAD-7 were developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission is required to reproduce, translate, display or distribute them. Scores are shown with their published bands for information and are not a diagnosis.
      </p>
    </Page>
  )
}

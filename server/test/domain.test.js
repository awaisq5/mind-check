import { describe, expect, it } from 'vitest'
import { changeSincePrevious, dueAssessments, scoreAssessment } from '../src/domain/assessments.js'
import { crisisReply, detectCrisis } from '../src/domain/crisis.js'
import { activityEffects, addDays, buildInsights, lowMoodRun, periodSummary, sleepEffect } from '../src/domain/insights.js'
import { resourcesFor } from '../src/domain/resources.js'

describe('questionnaire scoring', () => {
  it('sums PHQ-9 answers and applies the published bands', () => {
    expect(scoreAssessment('phq9', [0, 0, 0, 0, 0, 0, 0, 0, 0])).toEqual({ score: 0, severity: 'Minimal', safetyFlag: false })
    expect(scoreAssessment('phq9', [1, 1, 1, 1, 1, 0, 0, 0, 0]).severity).toBe('Mild')
    expect(scoreAssessment('phq9', [2, 2, 2, 2, 2, 0, 0, 0, 0]).severity).toBe('Moderate')
    expect(scoreAssessment('phq9', [3, 3, 3, 3, 3, 0, 0, 0, 0]).severity).toBe('Moderately severe')
    expect(scoreAssessment('phq9', [3, 3, 3, 3, 3, 3, 2, 0, 0]).severity).toBe('Severe')
  })

  it('applies the GAD-7 bands', () => {
    expect(scoreAssessment('gad7', [1, 1, 1, 1, 0, 0, 0]).severity).toBe('Minimal')
    expect(scoreAssessment('gad7', [3, 3, 3, 3, 3, 0, 0]).severity).toBe('Severe')
  })

  it('raises the safety flag for any answer above zero on PHQ-9 item 9, whatever the total', () => {
    const r = scoreAssessment('phq9', [0, 0, 0, 0, 0, 0, 0, 0, 1])
    expect(r.score).toBe(1)
    expect(r.severity).toBe('Minimal')
    expect(r.safetyFlag).toBe(true)
  })

  it('rejects malformed answers', () => {
    expect(() => scoreAssessment('phq9', [0, 1])).toThrow('PHQ-9 needs 9 answers.')
    expect(() => scoreAssessment('gad7', [0, 1, 2, 3, 4, 0, 0])).toThrow('Each answer must be 0, 1, 2 or 3.')
    expect(() => scoreAssessment('x', [])).toThrow('Unknown questionnaire')
  })

  it('treats a 5-point PHQ-9 change as meaningful', () => {
    const results = [
      { type: 'phq9', score: 8, takenAt: '2026-09-01' },
      { type: 'phq9', score: 13, takenAt: '2026-09-15' },
    ]
    expect(changeSincePrevious('phq9', results)).toEqual({ delta: 5, from: 8, to: 13, meaningful: true, direction: 'worse' })
    expect(changeSincePrevious('phq9', results.slice(0, 1))).toBeNull()
  })

  it('makes each questionnaire due every 14 days', () => {
    const now = new Date('2026-10-15T12:00:00Z')
    const due = dueAssessments([{ type: 'phq9', takenAt: '2026-10-05T12:00:00Z' }], now)
    expect(due).toEqual([
      { type: 'phq9', due: false, lastTakenAt: '2026-10-05T12:00:00Z', daysSince: 10 },
      { type: 'gad7', due: true, lastTakenAt: null, daysSince: null },
    ])
  })
})

describe('crisis detection', () => {
  it.each([
    'I want to kill myself',
    'sometimes I think about suicide',
    "I don't want to live anymore",
    'everyone would be better off dead without me',
    'I have been cutting myself',
    'Ich will nicht mehr leben',
    'Ich denke an Suizid',
    'ich will mir etwas antun',
  ])('flags "%s"', (text) => {
    expect(detectCrisis(text)).toBe(true)
  })

  it.each(['I had a hard day at work', 'This deadline is killing me', 'I feel tired and flat', 'Ich bin müde'])('does not flag "%s"', (text) => {
    expect(detectCrisis(text)).toBe(false)
  })

  it('answers with the region’s emergency number and crisis lines', () => {
    const reply = crisisReply(resourcesFor('DE'))
    expect(reply).toContain('call 112')
    expect(reply).toContain('0800 111 0 111')
    expect(crisisReply(resourcesFor('OTHER'))).toContain('findahelpline.com')
  })
})

const day = (date, values) => ({ date, mood: 3, energy: 3, anxiety: 3, sleepHours: 7, activities: [], ...values })

describe('insights', () => {
  const today = '2026-10-15'

  it('compares this week with last week', () => {
    const checkins = [day('2026-10-14', { mood: 4 }), day('2026-10-15', { mood: 5 }), day('2026-10-05', { mood: 2 })]
    const s = periodSummary(checkins, today, 7)
    expect(s.current).toMatchObject({ days: 2, mood: 4.5 })
    expect(s.previous).toMatchObject({ days: 1, mood: 2 })
  })

  it('reports activity differences only with enough days on both sides', () => {
    const checkins = [
      ...[1, 2, 3].map((i) => day(addDays(today, -i), { mood: 4, activities: ['exercise'] })),
      ...[4, 5, 6].map((i) => day(addDays(today, -i), { mood: 2 })),
    ]
    const effects = activityEffects(checkins)
    expect(effects).toHaveLength(1)
    expect(effects[0]).toMatchObject({ activity: 'exercise', moodWith: 4, moodWithout: 2, difference: 2, withDays: 3, withoutDays: 3 })
    expect(activityEffects(checkins.slice(0, 5))).toEqual([])
  })

  it('compares mood after short and long nights', () => {
    const checkins = [
      ...[1, 2, 3].map((i) => day(addDays(today, -i), { mood: 4, sleepHours: 8 })),
      ...[4, 5, 6].map((i) => day(addDays(today, -i), { mood: 2, sleepHours: 5 })),
    ]
    expect(sleepEffect(checkins)).toMatchObject({ moodEnough: 4, moodShort: 2, difference: 2 })
  })

  it('notices a run of low days', () => {
    const checkins = [1, 2, 3, 4, 5].map((i) => day(addDays(today, -i), { mood: i <= 3 ? 1 : 4 }))
    expect(lowMoodRun(checkins)).toEqual({ triggered: true, lowDays: 3, of: 5 })
    expect(lowMoodRun(checkins.slice(3)).triggered).toBe(false)
  })

  it('orders prompts with safety first and lists due follow-ups', () => {
    const now = new Date('2026-10-15T12:00:00Z')
    const insights = buildInsights({
      checkins: [],
      assessments: [{ type: 'phq9', score: 6, safetyFlag: true, takenAt: '2026-10-10T12:00:00Z' }],
      careContacts: [
        { _id: 'a', name: 'Praxis A', status: 'waiting-list', followUpOn: '2026-10-14' },
        { _id: 'b', name: 'Praxis B', status: 'declined', followUpOn: '2026-10-14' },
        { _id: 'c', name: 'Praxis C', status: 'appointment-booked', appointmentAt: '2026-10-20T09:00:00Z' },
      ],
      today,
      now,
    })
    expect(insights.prompts.map((p) => p.kind)).toEqual(['safety', 'assessment-due', 'follow-up'])
    expect(insights.prompts[2].text).toBe('Follow up with Praxis A.')
    expect(insights.nextAppointment.name).toBe('Praxis C')
  })

  it('flags a meaningful worsening between questionnaires', () => {
    const insights = buildInsights({
      checkins: [],
      assessments: [
        { type: 'gad7', score: 5, takenAt: '2026-09-20T12:00:00Z' },
        { type: 'gad7', score: 11, takenAt: '2026-10-10T12:00:00Z' },
      ],
      today,
      now: new Date('2026-10-15T12:00:00Z'),
    })
    expect(insights.prompts.find((p) => p.kind === 'worse')?.text).toContain('GAD-7 score rose from 5 to 11')
  })
})

describe('crisis contacts bundled in the web app', () => {
  it('match the server copy exactly', async () => {
    const client = await import('../../client/src/lib/resources.js')
    const server = await import('../src/domain/resources.js')
    expect(client.REGIONS).toEqual(server.REGIONS)
  })
})

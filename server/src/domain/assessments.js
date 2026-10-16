// PHQ-9 (depression) and GAD-7 (anxiety) questionnaires.
//
// Both were developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke
// and colleagues, with an educational grant from Pfizer Inc. "No permission
// required to reproduce, translate, display or distribute."
//
// Both ask about the last two weeks, so the app offers them every 14 days.
// Scores are self-reports shown with their published severity bands; they do
// not diagnose anything.

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

export const DIFFICULTY_OPTIONS = [
  'Not difficult at all',
  'Somewhat difficult',
  'Very difficult',
  'Extremely difficult',
]

export const QUESTIONNAIRES = {
  phq9: {
    type: 'phq9',
    name: 'PHQ-9',
    topic: 'Mood',
    intro: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    items: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself, or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking much more slowly than usual, or feeling so restless that you could not sit still',
      'Thoughts that you would be better off dead or of hurting yourself in some way',
    ],
    max: 27,
    bands: [
      { min: 0, max: 4, label: 'Minimal' },
      { min: 5, max: 9, label: 'Mild' },
      { min: 10, max: 14, label: 'Moderate' },
      { min: 15, max: 19, label: 'Moderately severe' },
      { min: 20, max: 27, label: 'Severe' },
    ],
    // A change of 5 points or more is generally treated as clinically meaningful.
    meaningfulChange: 5,
  },
  gad7: {
    type: 'gad7',
    name: 'GAD-7',
    topic: 'Anxiety',
    intro: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    items: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid, as if something awful might happen',
    ],
    max: 21,
    bands: [
      { min: 0, max: 4, label: 'Minimal' },
      { min: 5, max: 9, label: 'Mild' },
      { min: 10, max: 14, label: 'Moderate' },
      { min: 15, max: 21, label: 'Severe' },
    ],
    // Studies of the GAD-7 put the smallest meaningful change at about 4 points.
    meaningfulChange: 4,
  },
}

export const ASSESSMENT_TYPES = Object.keys(QUESTIONNAIRES)
export const REPEAT_DAYS = 14

export class AssessmentError extends Error {}

/** Scores a completed questionnaire. Throws AssessmentError on malformed answers. */
export function scoreAssessment(type, answers) {
  const q = QUESTIONNAIRES[type]
  if (!q) throw new AssessmentError(`Unknown questionnaire "${type}".`)
  if (!Array.isArray(answers) || answers.length !== q.items.length) {
    throw new AssessmentError(`${q.name} needs ${q.items.length} answers.`)
  }
  if (!answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3)) {
    throw new AssessmentError('Each answer must be 0, 1, 2 or 3.')
  }
  const score = answers.reduce((sum, a) => sum + a, 0)
  const band = q.bands.find((b) => score >= b.min && score <= b.max)
  return {
    score,
    severity: band.label,
    // PHQ-9 item 9 asks about thoughts of death or self-harm. Any answer above
    // "Not at all" must lead straight to help, whatever the total score.
    safetyFlag: type === 'phq9' && answers[8] > 0,
  }
}

/** Compares the latest result with the one before it. */
export function changeSincePrevious(type, results) {
  const sorted = results.filter((r) => r.type === type).sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt))
  if (sorted.length < 2) return null
  const last = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const delta = last.score - prev.score
  const threshold = QUESTIONNAIRES[type].meaningfulChange
  return {
    delta,
    from: prev.score,
    to: last.score,
    meaningful: Math.abs(delta) >= threshold,
    direction: delta > 0 ? 'worse' : delta < 0 ? 'better' : 'same',
  }
}

/** When each questionnaire is next due, from the user's past results. */
export function dueAssessments(results, now = new Date()) {
  return ASSESSMENT_TYPES.map((type) => {
    const last = results
      .filter((r) => r.type === type)
      .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0]
    if (!last) return { type, due: true, lastTakenAt: null, daysSince: null }
    const daysSince = Math.floor((now - new Date(last.takenAt)) / 86_400_000)
    return { type, due: daysSince >= REPEAT_DAYS, lastTakenAt: last.takenAt, daysSince }
  })
}

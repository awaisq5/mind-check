import { Link } from 'react-router-dom'
import { Brand, HelpNowLink } from '../components/Layout'

const FEATURES = [
  {
    title: 'A one-minute daily check-in',
    text: 'Mood, energy, anxiety, sleep and what you did today. Over a few weeks you see your pattern, and which days go better.',
  },
  {
    title: 'PHQ-9 and GAD-7 every two weeks',
    text: 'The questionnaires many doctors and therapists use, scored with their published bands, so changes are measured, not guessed.',
  },
  {
    title: 'Keep your search for care on track',
    text: 'Log every practice you contact, who put you on a waiting list, and when to follow up. Mind Check reminds you.',
  },
  {
    title: 'A report for your appointment',
    text: 'One printable page with your trends, scores, the notes you chose to share and the questions you want to ask.',
  },
  {
    title: 'A safety plan, one tap away',
    text: 'Your warning signs, what helps, and who to call, written while you are calm and there when you are not.',
  },
  {
    title: 'A companion that knows its limits',
    text: 'Someone to talk things through with at 2 a.m. It never diagnoses, and if you mention risk it points you to people straight away.',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-top">
        <Brand />
        <nav>
          <HelpNowLink />
          <Link to="/login" className="btn btn-ghost btn-sm">
            Log in
          </Link>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">For the time before and between appointments</p>
        <h1>Know how you are doing, and bring it to the people who can help.</h1>
        <p className="hero-lede">
          Waiting for a therapy place, or between sessions? Mind Check helps you track how you feel, notice what helps, keep your search for care moving, and arrive at your next appointment with something concrete to talk about.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Create a free account
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">
            I have an account
          </Link>
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature">
            <h2>{f.title}</h2>
            <p>{f.text}</p>
          </article>
        ))}
      </section>

      <section className="promise">
        <h2>Your data stays yours</h2>
        <ul>
          <li>Notes stay private unless you mark one for your appointment report.</li>
          <li>The companion does not store your conversations, and sees your check-ins only if you allow it.</li>
          <li>Download everything, or delete your account and all data, at any time.</li>
        </ul>
        <Link to="/privacy">How Mind Check handles your data</Link>
      </section>

      <footer className="landing-foot">
        <p>
          Mind Check supports self-monitoring. It is not a medical device, does not diagnose, and does not replace a doctor or therapist. If you are in danger, call 112 (Germany and the EU) or use <Link to="/help">Help now</Link>.
        </p>
        <p className="muted">
          A portfolio project by Awais Hanif Qurashi. <a href="https://github.com/awaisq5/mind-check">Source on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

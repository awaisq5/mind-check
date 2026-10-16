import { Link } from 'react-router-dom'
import { Brand } from '../components/Layout'

export default function Privacy() {
  return (
    <div className="auth">
      <header className="landing-top">
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
      </header>
      <main className="prose">
        <h1>How Mind Check handles your data</h1>
        <p className="muted">Version 2026-10. Mind Check is a portfolio project; this notice describes how the software is built to treat your data.</p>

        <h2>What is stored</h2>
        <ul>
          <li>Your account: name, email and a hashed password (never the password itself).</li>
          <li>Your check-ins: mood, energy, anxiety, sleep, activities and notes.</li>
          <li>Your questionnaire answers and scores, your safety plan, the care contacts you track and your questions for appointments.</li>
          <li>When you agreed to this notice, and which version you agreed to.</li>
        </ul>

        <h2>Why, and on what basis</h2>
        <p>
          This information is about your health, which data protection law treats as a special category (Art. 9 GDPR). Mind Check processes it only to provide the features you use, on the basis of your explicit consent, given when you create your account.
        </p>

        <h2>What is not done with it</h2>
        <ul>
          <li>No advertising, no selling, no sharing with employers or insurers.</li>
          <li>Notes are private. They appear in your appointment report only if you mark them.</li>
          <li>The companion does not store conversations. It sees a short summary of your recent check-ins only if you switch that on in Settings. Messages that suggest risk are never sent to the language model.</li>
          <li>Server logs record errors, never the content of your entries.</li>
        </ul>

        <h2>Your rights</h2>
        <ul>
          <li>Download all your data as a file from Settings (access and portability).</li>
          <li>Change any entry, or delete it (rectification).</li>
          <li>Delete your account: this removes every record that belongs to you (erasure, and withdrawal of consent).</li>
        </ul>

        <h2>Not a medical device</h2>
        <p>
          Mind Check supports self-monitoring and preparing for appointments. It does not diagnose, treat or monitor any condition on a professional's behalf. Questionnaire scores are shown with their published bands for information; only a professional can interpret them for you.
        </p>

        <p>
          <Link to="/">Back</Link>
        </p>
      </main>
    </div>
  )
}

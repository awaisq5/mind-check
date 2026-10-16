// Detects messages that suggest risk of suicide or self-harm, in English and
// German. When one matches, the companion does not call the language model at
// all: it answers with a fixed, reviewed message and the user's crisis contacts.
//
// Keyword matching over-triggers on purpose. A false alarm costs a moment of
// friction; a missed one could cost far more.

const PATTERNS = [
  // English
  /\bsuicid/i,
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bend\s+(it\s+all|my\s+life)\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\b(don'?t|do\s+not)\s+want\s+to\s+(live|be\s+alive|wake\s+up)\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[\s-]?harm/i,
  /\b(hurt|harm|cut)(ting)?\s+my\s*self\b/i,
  /\boverdose\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  // German
  /\bsuizid/i,
  /\bselbstmord/i,
  /\bumbringen\b/i,
  /\bnicht\s+mehr\s+leben\b/i,
  /\bmein\s+leben\s+beenden\b/i,
  /\bsterben\s+will\b|\bwill\s+sterben\b/i,
  /\bselbstverletz/i,
  /\britzen\b/i,
  /\bmir\s+(etwas|was)\s+antun\b/i,
]

export function detectCrisis(text) {
  if (typeof text !== 'string' || !text) return false
  return PATTERNS.some((p) => p.test(text))
}

export function crisisReply(resources) {
  const lines = resources.crisisLines.map((l) => `${l.name}: ${l.phone}`)
  const emergency = resources.emergency ? `If you are in immediate danger, call ${resources.emergency} now.` : 'If you are in immediate danger, call your local emergency number now.'
  return [
    "I'm really glad you told me. What you're feeling sounds serious, and you deserve support from a person right now, not from an app.",
    emergency,
    lines.length ? `You can talk to someone any time: ${lines.join(' · ')}.` : 'You can find a free helpline in your country at findahelpline.com.',
    'If you have a safety plan, now is the time to open it. Would you be willing to contact one of the people on it?',
  ].join('\n\n')
}

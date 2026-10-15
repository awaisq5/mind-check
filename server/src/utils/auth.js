import { CONSENT_VERSION } from '../validation.js'
import jwt from 'jsonwebtoken'

export function signToken(user) {
  return jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

/** The account as the client sees it: never the password hash. */
export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    settings: {
      region: user.settings?.region ?? 'DE',
      shareContextWithCompanion: user.settings?.shareContextWithCompanion ?? false,
      reminderTime: user.settings?.reminderTime ?? '20:00',
    },
    consent: user.consent ?? null,
    needsConsent: !user.consent || user.consent.version !== CONSENT_VERSION,
    createdAt: user.createdAt,
  }
}

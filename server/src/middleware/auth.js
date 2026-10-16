import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Verifies the bearer token and loads the account, so a deleted account's
 * token stops working at once instead of writing orphaned data until it expires.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  let payload
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }

  try {
    const account = await User.findById(payload.userId).select('-passwordHash').lean()
    if (!account) return res.status(401).json({ message: 'Your session has expired. Please log in again.' })
    req.user = { userId: String(account._id), email: account.email }
    req.account = account
    next()
  } catch (error) {
    next(error)
  }
}

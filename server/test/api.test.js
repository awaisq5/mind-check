import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// The database is replaced by mocks, so the tests run without MongoDB.
vi.mock('../src/models/User.js', () => ({
  default: { findOne: vi.fn(), create: vi.fn(), findById: vi.fn() },
}))
vi.mock('../src/models/CheckIn.js', () => ({
  default: { find: vi.fn(), findOne: vi.fn(), create: vi.fn() },
}))

const { default: app } = await import('../src/app.js')
const { default: User } = await import('../src/models/User.js')
const { default: CheckIn } = await import('../src/models/CheckIn.js')

const USER_ID = '665f1c2e8b3e4a0012345678'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
})

afterEach(() => {
  mongoose.connection.db = undefined
  vi.clearAllMocks()
  vi.restoreAllMocks()
  delete process.env.ENABLE_CHATBOT
})

const tokenFor = (userId = USER_ID) => jwt.sign({ userId, email: 'sam@example.com' }, process.env.JWT_SECRET)

describe('health', () => {
  it('reports the database as connected when the ping succeeds', async () => {
    mongoose.connection.db = { admin: () => ({ ping: async () => ({ ok: 1 }) }) }
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true, db: 'connected' })
  })

  it('returns 503 when the database cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mongoose.connection.db = undefined
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ ok: false, db: 'unreachable' })
  })
})

describe('auth', () => {
  it('requires name, email and password to register', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'sam@example.com' })
    expect(res.status).toBe(400)
  })

  it('refuses a second account for the same email', async () => {
    User.findOne.mockResolvedValue({ _id: USER_ID })
    const res = await request(app).post('/api/auth/register').send({ name: 'Sam', email: 'Sam@Example.com', password: 'pw123456' })
    expect(res.status).toBe(409)
    expect(User.findOne).toHaveBeenCalledWith({ email: 'sam@example.com' })
  })

  it('stores a bcrypt hash, never the password, and returns a token', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockImplementation(async (doc) => ({ _id: USER_ID, ...doc }))
    const res = await request(app).post('/api/auth/register').send({ name: 'Sam', email: 'sam@example.com', password: 'pw123456' })
    expect(res.status).toBe(201)
    const stored = User.create.mock.calls[0][0]
    expect(stored.password).toBeUndefined()
    expect(await bcrypt.compare('pw123456', stored.passwordHash)).toBe(true)
    expect(jwt.verify(res.body.token, 'test-secret').userId).toBe(USER_ID)
    expect(res.body.user).toEqual({ id: USER_ID, name: 'Sam', email: 'sam@example.com' })
  })

  it('logs in with the right password only', async () => {
    const passwordHash = await bcrypt.hash('pw123456', 4)
    User.findOne.mockResolvedValue({ _id: USER_ID, name: 'Sam', email: 'sam@example.com', passwordHash })
    const wrong = await request(app).post('/api/auth/login').send({ email: 'sam@example.com', password: 'nope' })
    expect(wrong.status).toBe(401)
    const right = await request(app).post('/api/auth/login').send({ email: 'sam@example.com', password: 'pw123456' })
    expect(right.status).toBe(200)
    expect(right.body.token).toBeTruthy()
  })

  it('gives the same answer for an unknown email as for a wrong password', async () => {
    User.findOne.mockResolvedValue(null)
    const res = await request(app).post('/api/auth/login').send({ email: 'who@example.com', password: 'x' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password.')
  })
})

describe('protected routes', () => {
  it('reject requests without a token or with a bad one', async () => {
    expect((await request(app).get('/api/checkins')).status).toBe(401)
    const bad = await request(app).get('/api/checkins').set('Authorization', 'Bearer not-a-token')
    expect(bad.status).toBe(401)
  })

  it('list only the signed-in user’s check-ins, newest first', async () => {
    const sort = vi.fn().mockResolvedValue([{ mood: 'good' }])
    CheckIn.find.mockReturnValue({ sort })
    const res = await request(app).get('/api/checkins').set('Authorization', `Bearer ${tokenFor()}`)
    expect(res.status).toBe(200)
    expect(CheckIn.find).toHaveBeenCalledWith({ userId: USER_ID })
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 })
  })

  it('save a check-in for the signed-in user with the mood normalised', async () => {
    CheckIn.create.mockImplementation(async (doc) => ({ _id: 'c1', ...doc }))
    const res = await request(app)
      .post('/api/checkins')
      .set('Authorization', `Bearer ${tokenFor()}`)
      .send({ mood: ' Low ', energy: 3, stress: 8, notes: 'Long day' })
    expect(res.status).toBe(201)
    expect(CheckIn.create).toHaveBeenCalledWith({ userId: USER_ID, mood: 'low', energy: 3, stress: 8, notes: 'Long day' })
  })
})

describe('support chat status', () => {
  const latest = (checkin) => CheckIn.findOne.mockReturnValue({ sort: vi.fn().mockResolvedValue(checkin) })
  const status = () => request(app).get('/api/chat/status').set('Authorization', `Bearer ${tokenFor()}`)

  it('stays off when the chatbot is disabled', async () => {
    const res = await status()
    expect(res.body).toEqual({ shouldTriggerChatbot: false, supportLevel: 'normal', chatbotEnabled: false })
    expect(CheckIn.findOne).not.toHaveBeenCalled()
  })

  it('appears after a low check-in', async () => {
    process.env.ENABLE_CHATBOT = 'true'
    latest({ mood: 'low', energy: 3, stress: 8 })
    const res = await status()
    expect(res.body).toMatchObject({ shouldTriggerChatbot: true, supportLevel: 'elevated', chatbotEnabled: true, latestScore: 1 })
  })

  it('stays hidden after a good check-in, even with some stress', async () => {
    process.env.ENABLE_CHATBOT = 'true'
    latest({ mood: 'good', energy: 6, stress: 7 })
    expect((await status()).body.shouldTriggerChatbot).toBe(false)
  })

  it('stays hidden before the first check-in', async () => {
    process.env.ENABLE_CHATBOT = 'true'
    latest(null)
    expect((await status()).body).toEqual({ shouldTriggerChatbot: false, supportLevel: 'normal', chatbotEnabled: true })
  })
})

describe('articles', () => {
  it('filters by category and limit', async () => {
    const res = await request(app).get('/api/articles?category=Sleep&limit=1')
    expect(res.body.articles).toHaveLength(1)
    expect(res.body.articles[0].category).toBe('Sleep')
  })
})

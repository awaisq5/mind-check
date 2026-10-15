// API tests against a real MongoDB (or a compatible server). Set TEST_MONGO_URI,
// for example mongodb://127.0.0.1:27017/mindcheck_test. CI starts MongoDB for them.
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const URI = process.env.TEST_MONGO_URI

process.env.JWT_SECRET = 'test-secret-test-secret'
process.env.NODE_ENV = 'test'

const { default: app } = await import('../src/app.js')

const agent = () => request(app)
let n = 0

async function signUp(overrides = {}) {
  n += 1
  const body = { name: 'Sam', email: `sam${n}@example.com`, password: 'a-long-password', consent: true, ...overrides }
  const res = await agent().post('/api/auth/register').send(body)
  return { res, token: res.body.token, auth: { Authorization: `Bearer ${res.body.token}` }, body }
}

describe.runIf(URI)('API', () => {
  beforeAll(async () => {
    await mongoose.connect(URI)
    await mongoose.connection.db.dropDatabase()
    await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()))
  })

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await mongoose.disconnect()
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('accounts', () => {
    it('requires explicit consent and a 10-character password', async () => {
      const noConsent = await agent().post('/api/auth/register').send({ name: 'A', email: 'a@example.com', password: 'a-long-password', consent: false })
      expect(noConsent.status).toBe(400)
      expect(noConsent.body.message).toMatch(/agree/)
      const short = await agent().post('/api/auth/register').send({ name: 'A', email: 'a@example.com', password: 'short', consent: true })
      expect(short.status).toBe(400)
      expect(short.body.message).toBe('Use at least 10 characters for your password.')
    })

    it('records the consent version and never returns the password hash', async () => {
      const { res } = await signUp()
      expect(res.status).toBe(201)
      expect(res.body.user.consent.version).toBe('2026-10')
      expect(res.body.user.needsConsent).toBe(false)
      expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|a-long-password/)
    })

    it('refuses a duplicate email and gives one answer for unknown email or wrong password', async () => {
      const { body } = await signUp()
      expect((await agent().post('/api/auth/register').send(body)).status).toBe(409)
      const wrong = await agent().post('/api/auth/login').send({ email: body.email, password: 'wrong-password' })
      const unknown = await agent().post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong-password' })
      expect(wrong.status).toBe(401)
      expect(unknown.body.message).toBe(wrong.body.message)
      const ok = await agent().post('/api/auth/login').send({ email: body.email.toUpperCase(), password: body.password })
      expect(ok.status).toBe(200)
    })

    it('updates settings and validates them', async () => {
      const { auth } = await signUp()
      const res = await agent().patch('/api/me').set(auth).send({ region: 'UK', shareContextWithCompanion: true })
      expect(res.body.user.settings).toMatchObject({ region: 'UK', shareContextWithCompanion: true })
      expect((await agent().patch('/api/me').set(auth).send({ region: 'XX' })).status).toBe(400)
    })
  })

  describe('check-ins', () => {
    it('keeps one check-in per day and updates it in place', async () => {
      const { auth } = await signUp()
      const first = await agent().put('/api/checkins/2026-10-10').set(auth).send({ mood: 2, energy: 2, anxiety: 4, sleepHours: 5.5, activities: ['work'], note: 'Hard day' })
      expect(first.status).toBe(201)
      const again = await agent().put('/api/checkins/2026-10-10').set(auth).send({ mood: 3, energy: 3, anxiety: 3 })
      expect(again.status).toBe(200)
      const list = await agent().get('/api/checkins?from=2026-10-01&to=2026-10-31').set(auth)
      expect(list.body.checkIns).toHaveLength(1)
      expect(list.body.checkIns[0]).toMatchObject({ date: '2026-10-10', mood: 3 })
    })

    it('rejects out-of-range values, unknown activities and future dates', async () => {
      const { auth } = await signUp()
      expect((await agent().put('/api/checkins/2026-10-10').set(auth).send({ mood: 6, energy: 3, anxiety: 3 })).status).toBe(400)
      expect((await agent().put('/api/checkins/2026-10-10').set(auth).send({ mood: 3, energy: 3, anxiety: 3, activities: ['skydiving'] })).status).toBe(400)
      expect((await agent().put('/api/checkins/2999-01-01').set(auth).send({ mood: 3, energy: 3, anxiety: 3 })).body.message).toBe('You cannot check in for a future date.')
    })

    it('keeps each user’s data separate', async () => {
      const a = await signUp()
      const b = await signUp()
      await agent().put('/api/checkins/2026-10-11').set(a.auth).send({ mood: 4, energy: 4, anxiety: 2 })
      const theirs = await agent().get('/api/checkins').set(b.auth)
      expect(theirs.body.checkIns).toEqual([])
    })
  })

  describe('questionnaires', () => {
    it('serves the questionnaire texts publicly', async () => {
      const res = await agent().get('/api/assessments/questionnaires')
      expect(res.body.questionnaires.map((q) => q.name)).toEqual(['PHQ-9', 'GAD-7'])
    })

    it('scores on the server and returns crisis contacts when item 9 is positive', async () => {
      const { auth } = await signUp()
      const res = await agent().post('/api/assessments').set(auth).send({ type: 'phq9', answers: [1, 1, 1, 1, 1, 1, 1, 0, 2] })
      expect(res.status).toBe(201)
      expect(res.body.assessment).toMatchObject({ score: 9, severity: 'Mild', safetyFlag: true })
      expect(res.body.resources.crisisLines[0].phone).toBe('0800 111 0 111')
      const insights = await agent().get('/api/insights?today=2026-10-15').set(auth)
      expect(insights.body.insights.prompts[0].kind).toBe('safety')
    })

    it('rejects a wrong number of answers', async () => {
      const { auth } = await signUp()
      const res = await agent().post('/api/assessments').set(auth).send({ type: 'gad7', answers: [1, 1, 1] })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('GAD-7 needs 7 answers.')
    })
  })

  describe('care tracker, questions and safety plan', () => {
    it('tracks contacts and turns due follow-ups into prompts', async () => {
      const { auth } = await signUp()
      const created = await agent().post('/api/care/contacts').set(auth).send({ name: 'Praxis Weber', status: 'waiting-list', followUpOn: '2026-10-14' })
      expect(created.status).toBe(201)
      const id = created.body.contact.id
      const updated = await agent().patch(`/api/care/contacts/${id}`).set(auth).send({ status: 'appointment-booked', appointmentAt: '2026-10-20T09:30:00+02:00' })
      expect(updated.body.contact.status).toBe('appointment-booked')
      const other = await signUp()
      expect((await agent().patch(`/api/care/contacts/${id}`).set(other.auth).send({ name: 'x' })).status).toBe(404)
      expect((await agent().delete('/api/care/contacts/not-an-id').set(auth)).status).toBe(404)
    })

    it('saves the safety plan and drops empty rows', async () => {
      const { auth } = await signUp()
      const empty = await agent().get('/api/care/safety-plan').set(auth)
      expect(empty.body.plan.updatedAt).toBeNull()
      const plan = { warningSigns: ['Not sleeping', ''], copingStrategies: ['Walk'], distractions: [], supportPeople: [{ name: 'Lea', phone: '0170' }, { name: '', phone: '' }], professionals: [], safeEnvironment: [], reasonsToLive: ['My sister'] }
      const res = await agent().put('/api/care/safety-plan').set(auth).send(plan)
      expect(res.body.plan.warningSigns).toEqual(['Not sleeping'])
      expect(res.body.plan.supportPeople).toEqual([{ name: 'Lea', phone: '0170' }])
    })

    it('includes only notes marked for the report', async () => {
      const { auth } = await signUp()
      await agent().put('/api/checkins/2026-10-12').set(auth).send({ mood: 2, energy: 2, anxiety: 4, note: 'Share this', includeInReport: true })
      await agent().put('/api/checkins/2026-10-13').set(auth).send({ mood: 3, energy: 3, anxiety: 3, note: 'Private' })
      await agent().post('/api/care/questions').set(auth).send({ text: 'Is this normal?' })
      const r = (await agent().get('/api/report?days=30&today=2026-10-15').set(auth)).body.report
      expect(r.from).toBe('2026-10-12')
      expect(r.sharedNotes).toEqual([{ date: '2026-10-12', note: 'Share this', mood: 2 }])
      expect(r.checkIns.find((c) => c.date === '2026-10-13').note).toBe('')
      expect(r.questions).toEqual(['Is this normal?'])
    })
  })

  describe('companion', () => {
    it('answers risk language with people, not the model', async () => {
      const { auth } = await signUp()
      const res = await agent().post('/api/chat').set(auth).send({ messages: [{ role: 'user', content: 'I want to end my life' }] })
      expect(res.body.crisis).toBe(true)
      expect(res.body.reply).toContain('112')
      expect(res.body.resources.region).toBe('DE')
    })

    it('says so when the model is not configured', async () => {
      const { auth } = await signUp()
      const res = await agent().post('/api/chat').set(auth).send({ messages: [{ role: 'user', content: 'Hello' }] })
      expect(res.body.crisis).toBe(false)
      expect(res.body.reply).toMatch(/isn't switched on/)
    })
  })

  describe('your data', () => {
    it('exports everything and deletes everything', async () => {
      const { auth, body, res: signed } = await signUp()
      const userId = new mongoose.Types.ObjectId(signed.body.user.id)
      await agent().post('/api/care/contacts').set(auth).send({ name: 'Praxis Weber' })
      await agent().put('/api/checkins/2026-10-12').set(auth).send({ mood: 3, energy: 3, anxiety: 3 })
      await agent().post('/api/assessments').set(auth).send({ type: 'gad7', answers: [0, 0, 0, 0, 0, 0, 0] })
      const exp = await agent().get('/api/me/export').set(auth)
      expect(exp.body.checkIns).toHaveLength(1)
      expect(exp.body.assessments).toHaveLength(1)
      expect(exp.headers['content-disposition']).toMatch(/attachment/)

      expect((await agent().delete('/api/me').set(auth).send({ password: 'wrong' })).status).toBe(403)
      expect((await agent().delete('/api/me').set(auth).send({ password: body.password })).status).toBe(204)
      // The old token stops working at once.
      expect((await agent().get('/api/checkins').set(auth)).status).toBe(401)
      const db = mongoose.connection.db
      for (const name of ['users', 'dailycheckins', 'assessments', 'carecontacts']) {
        const filter = name === 'users' ? { _id: userId } : { userId }
        expect(await db.collection(name).countDocuments(filter), name).toBe(0)
      }
    })
  })

  describe('migration from version 1', () => {
    it('copies old check-ins into the daily format', async () => {
      const { migrate } = await import('../scripts/migrate-v1.js')
      const { res } = await signUp()
      const userId = new mongoose.Types.ObjectId(res.body.user.id)
      await mongoose.connection.db.collection('checkins').insertMany([
        { userId, mood: 'low', energy: 3, stress: 9, notes: 'old', createdAt: new Date('2026-03-30T22:00:00Z') },
        { userId, mood: 'great', energy: 10, stress: 1, notes: '', createdAt: new Date('2026-04-02T10:00:00Z') },
      ])
      const out = await migrate()
      expect(out.read).toBe(2)
      const docs = await mongoose.connection.db.collection('dailycheckins').find({ userId }).sort({ date: 1 }).toArray()
      expect(docs.map((d) => [d.date, d.mood, d.energy, d.anxiety])).toEqual([
        ['2026-03-30', 2, 2, 5],
        ['2026-04-02', 5, 5, 1],
      ])
    })
  })

  it('reports health with a database ping', async () => {
    const res = await agent().get('/api/health')
    expect(res.body).toMatchObject({ ok: true, db: 'connected' })
  })

  it('answers 404 with JSON for unknown API paths', async () => {
    const res = await agent().get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Not found.')
  })
})

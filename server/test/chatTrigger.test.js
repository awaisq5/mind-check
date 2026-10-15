import { describe, expect, it } from 'vitest'
import { chatStatusFor, getCheckinScore } from '../src/utils/chatTrigger.js'

describe('check-in score', () => {
  it('starts from the mood and moves with energy and stress', () => {
    expect(getCheckinScore({ mood: 'okay', energy: 5, stress: 5 })).toBe(5)
    expect(getCheckinScore({ mood: 'great', energy: 10, stress: 1 })).toBe(10)
    expect(getCheckinScore({ mood: 'low', energy: 1, stress: 10 })).toBe(1)
  })

  it('treats an unknown mood as neutral', () => {
    expect(getCheckinScore({ mood: 'meh', energy: 5, stress: 5 })).toBe(5)
  })
})

describe('chat trigger', () => {
  it('triggers on low mood, high stress or a low score', () => {
    expect(chatStatusFor({ mood: 'low', energy: 6, stress: 3 }).shouldTriggerChatbot).toBe(true)
    expect(chatStatusFor({ mood: 'okay', energy: 5, stress: 7 }).shouldTriggerChatbot).toBe(true)
    expect(chatStatusFor({ mood: 'okay', energy: 1, stress: 6 }).shouldTriggerChatbot).toBe(true)
  })

  it('never triggers after a good or great check-in', () => {
    expect(chatStatusFor({ mood: 'great', energy: 2, stress: 9 }).shouldTriggerChatbot).toBe(false)
  })

  it('does not trigger on an ordinary okay day', () => {
    expect(chatStatusFor({ mood: 'okay', energy: 5, stress: 5 })).toMatchObject({ shouldTriggerChatbot: false, supportLevel: 'normal' })
  })
})

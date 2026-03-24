import { describe, it, expect } from 'vitest'
import { SessionUser } from './auth'

describe('SessionUser type', () => {
  it('has correct shape', () => {
    const user: SessionUser = {
      id: '123',
      name: 'Test User'
    }
    expect(user.id).toBe('123')
    expect(user.name).toBe('Test User')
  })
})

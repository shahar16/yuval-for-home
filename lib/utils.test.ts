import { describe, it, expect } from 'vitest'
import { calculateTotalPrice, validateIsraeliPhone } from './utils'

describe('calculateTotalPrice', () => {
  it('returns 500 for 1 product', () => {
    expect(calculateTotalPrice(1)).toBe(500)
  })

  it('returns 500 for 2 products', () => {
    expect(calculateTotalPrice(2)).toBe(500)
  })

  it('returns 600 for 3 products', () => {
    expect(calculateTotalPrice(3)).toBe(600)
  })

  it('returns 800 for 5 products', () => {
    expect(calculateTotalPrice(5)).toBe(800)
  })
})

describe('validateIsraeliPhone', () => {
  it('accepts valid mobile number', () => {
    expect(validateIsraeliPhone('0501234567')).toBe(true)
  })

  it('accepts mobile with dashes', () => {
    expect(validateIsraeliPhone('050-123-4567')).toBe(true)
  })

  it('accepts international format', () => {
    expect(validateIsraeliPhone('+972-50-123-4567')).toBe(true)
  })

  it('accepts landline', () => {
    expect(validateIsraeliPhone('02-1234567')).toBe(true)
  })

  it('rejects invalid format', () => {
    expect(validateIsraeliPhone('123')).toBe(false)
  })

  it('rejects invalid area code', () => {
    expect(validateIsraeliPhone('061234567')).toBe(false)
  })
})

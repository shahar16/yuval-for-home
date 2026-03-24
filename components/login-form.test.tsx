import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginForm } from './login-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock auth actions
vi.mock('@/actions/auth', () => ({
  login: vi.fn(),
  getUsers: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders name selection', () => {
    const users = [
      { id: '1', name: 'יובל', created_at: '' },
      { id: '2', name: 'שרה', created_at: '' }
    ]

    render(<LoginForm users={users} />)

    expect(screen.getByText('בחר שם')).toBeInTheDocument()
  })
})

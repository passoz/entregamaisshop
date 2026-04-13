import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/layout/Navbar'
import { AuthProvider } from '@/components/providers/AuthProvider'
import * as authClient from '@/lib/auth/client'

// Mock dependencies
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('@/lib/CartContext', () => ({
  useCart: () => ({ totalItems: 0 })
}))

vi.mock('@/lib/auth/client', async () => {
  const actual = await vi.importActual('@/lib/auth/client') as any
  return {
    ...actual,
    useSession: vi.fn()
  }
})

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows skeleton while loading', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn()
    })

    const { container } = render(<Navbar />)
    expect(container.querySelector('.animate-pulse')).toBeDefined()
  })

  it('shows Entrar button when unauthenticated', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    })

    render(<Navbar />)
    expect(screen.getByText('Entrar')).toBeDefined()
  })

  it('shows user name and role badge when authenticated', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: { id: '1', name: 'Admin Test', email: 'admin@test.com', roles: ['admin'] }
      },
      status: 'authenticated',
      update: vi.fn()
    } as any)

    render(<Navbar />)
    expect(screen.getByText('Admin')).toBeDefined()
    expect(screen.getByText('Administrador')).toBeDefined()
    expect(screen.getByText(/Sair/i)).toBeDefined()
  })
})

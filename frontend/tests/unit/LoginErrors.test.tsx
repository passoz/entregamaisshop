import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CustomerLogin from '@/app/auth/login/customer/page'
import { signIn } from '@/lib/auth/client'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}))

// Mock NextAuth
vi.mock('@/lib/auth/client', () => ({
  signIn: vi.fn(),
}))

// Mock AuthLayout to avoid layout complexities in unit tests
vi.mock('@/components/layout/AuthLayout', () => ({
  AuthLayout: ({ children, title }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

describe('Customer Login Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows special message for admin accounts on customer portal', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: false, error: 'CredentialsSignin' } as any)

    render(<CustomerLogin />)

    const emailInput = screen.getByLabelText(/E-mail/i)
    const passwordInput = screen.getByLabelText(/Senha/i)
    const loginButton = screen.getByRole('button', { name: /Entrar Agora/i })

    fireEvent.change(emailInput, { target: { value: 'admin@entregamaisshop.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/Contas administrativas devem acessar pelo Portal do Administrador/i)).toBeDefined()
    })
  })

  it('shows themed generic message for invalid customer credentials', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: false, error: 'CredentialsSignin' } as any)

    render(<CustomerLogin />)

    const emailInput = screen.getByLabelText(/E-mail/i)
    const passwordInput = screen.getByLabelText(/Senha/i)
    const loginButton = screen.getByRole('button', { name: /Entrar Agora/i })

    fireEvent.change(emailInput, { target: { value: 'cliente@exemplo.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/Ops! Credenciais inválidas. Verifique seu e-mail e senha para voltar à festa/i)).toBeDefined()
    })
  })
})

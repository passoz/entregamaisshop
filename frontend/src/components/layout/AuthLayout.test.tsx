import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Mock Logo component
describe('AuthLayout Component', () => {
  it('renders correctly with given title and subtitle for different roles', () => {
    const { rerender } = render(
      <AuthLayout role="customer" title="Welcome" subtitle="Testing auth layout">
        <div>Content</div>
      </AuthLayout>
    )

    expect(screen.getByText('Welcome')).toBeDefined()
    expect(screen.getByText('Testing auth layout')).toBeDefined()
    expect(screen.getByText('Content')).toBeDefined()
    expect(screen.getByText(/Sua bebida favorita/i)).toBeDefined()
    expect(screen.getByText(/Parceiros ativos/i)).toBeDefined()

    // Verify role-based elements for seller
    rerender(
      <AuthLayout role="vendedor" title="Vendas" subtitle="Portal do Vendedor">
        <div>Seller Content</div>
      </AuthLayout>
    )
    expect(screen.getByText('Vendas')).toBeDefined()
    expect(screen.getByText(/Leve seu depósito para o digital/i)).toBeDefined()
    expect(screen.getByText(/Depósitos ativos/i)).toBeDefined()

    // Verify role-based elements for admin
    rerender(
      <AuthLayout role="admin" title="Admin" subtitle="Secure Portal">
        <div>Admin Content</div>
      </AuthLayout>
    )
    expect(screen.getByText('Admin')).toBeDefined()
    expect(screen.getByText(/Sua bebida favorita/i)).toBeDefined() // Admin uses default slogan
  })
})

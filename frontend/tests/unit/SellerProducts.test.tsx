import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SellerProducts from '@/app/vendedor/products/page'

vi.mock('@/components/layout/PortalLayout', () => ({
  PortalLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/providers/ToastProvider', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/lib/api'

describe('SellerProducts Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders products returned by the seller endpoint', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce([
      { id: '1', name: 'Cerveja Pilsen Lata 350ml', price: 12.9, status: 'active' },
      { id: '2', name: 'Refrigerante Cola 2L', price: 9.9, status: 'active' },
    ])

    render(<SellerProducts />)

    expect(screen.getByText('Cadastrar item')).toBeDefined()
    expect(await screen.findByText('Cerveja Pilsen Lata 350ml')).toBeDefined()
    expect(screen.getByText('Refrigerante Cola 2L')).toBeDefined()
  })

  it('contains the product creation form and empty state', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce([])

    render(<SellerProducts />)

    expect(screen.getByRole('button', { name: /Salvar produto/i })).toBeDefined()
    expect(await screen.findByText('Nenhum produto cadastrado ainda')).toBeDefined()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SellerProducts from '@/app/vendedor/products/page'

// Mock the Sidebar component as it uses Next.js navigation
vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />
}))

describe('SellerProducts Page', () => {
  it('renders products returned by the seller endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 1, name: 'Cerveja Pilsen Lata 350ml', price: 'R$ 12,90', stock: 18, status: 'Ativo' },
          { id: 2, name: 'Refrigerante Cola 2L', price: 'R$ 9,90', stock: 9, status: 'Ativo' },
        ],
      }),
    )

    render(<SellerProducts />)

    expect(screen.getByText('Produtos e Estoque')).toBeDefined()
    expect(await screen.findByText('Cerveja Pilsen Lata 350ml')).toBeDefined()
    expect(screen.getByText('Refrigerante Cola 2L')).toBeDefined()
  })

  it('contains a "Novo Produto" button', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    )

    render(<SellerProducts />)
    const button = screen.getByRole('button', { name: /Novo Produto/i })
    expect(button).toBeDefined()
    await waitFor(() => {
      expect(screen.getByText('Nenhum produto cadastrado.')).toBeDefined()
    })
  })
})

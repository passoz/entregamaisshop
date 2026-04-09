import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SellerProducts from '@/app/vendedor/products/page'
import { MSWProvider } from '@/components/providers/MSWProvider'

// Mock the Sidebar component as it uses Next.js navigation
vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />
}))

describe('SellerProducts Page', () => {
  it('renders products table', () => {
    // Note: For now the page uses hardcoded MOCK_PRODUCTS
    // Later we will update the page to fetch from API
    render(<SellerProducts />)
    
    expect(screen.getByText('Produtos e Estoque')).toBeDefined()
    expect(screen.getByText('Pizza de Calabresa G')).toBeDefined()
    expect(screen.getByText('Refrigerante Cola 2L')).toBeDefined()
  })

  it('contains a "Novo Produto" button', () => {
    render(<SellerProducts />)
    const button = screen.getByRole('button', { name: /Novo Produto/i })
    expect(button).toBeDefined()
  })
})

import { test, expect } from '@playwright/test';

/**
 * Esse teste cobre toda a cadeia:
 * 1. Vendedor: Cadastro/Login e Inclusão de Produto.
 * 2. Cliente: Cadastro/Login e Pedido.
 * 3. Vendedor: Recebimento de Pedido e Emissão de Entrega.
 * 4. Entregador: Cadastro/Login e Realização da Entrega.
 */
test.describe('Cadeia Completa - EntregaMais Shop', () => {

  test.beforeEach(async ({ page }) => {
    // Habilita o mocking para os testes E2E
    await page.addInitScript(() => {
      window.localStorage.setItem('NEXT_PUBLIC_API_MOCKING', 'enabled');
    });
  });

  test('Deve realizar o fluxo completo de venda e entrega', async ({ page }) => {
    // 1. VENDEDOR: Login e Cadastro de Produto
    await page.goto('/auth/login?role=vendedor');
    await page.fill('input[name="email"]', 'vendedor@teste.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/vendedor\/dashboard|.*\/vendedor/);
    
    // Inclusão de Produto
    await page.goto('/vendedor/products/new');
    await page.fill('input[name="name"]', 'Cerveja Artesanal IPA');
    await page.fill('input[name="price"]', '18.90');
    await page.fill('textarea[name="description"]', 'Uma IPA refrescante com notas cítricas.');
    await page.click('button:has-text("Salvar")');
    
    await expect(page.locator('text=Cerveja Artesanal IPA')).toBeVisible();

    // 2. CLIENTE: Login e Pedido
    await page.goto('/auth/login?role=customer');
    await page.fill('input[name="email"]', 'cliente@teste.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    
    // Buscar produto e adicionar ao carrinho
    await page.click('text=Cerveja Artesanal IPA');
    await page.click('button:has-text("Adicionar ao Carrinho")');
    await page.goto('/cart');
    await page.click('button:has-text("Finalizar Pedido")');
    
    await expect(page.locator('text=Pedido realizado com sucesso')).toBeVisible();
    const orderId = await page.locator('[data-testid="order-id"]').innerText();

    // 3. VENDEDOR: Confirmar e Emitir Entrega
    await page.goto('/auth/login?role=vendedor');
    await page.goto(`/vendedor/orders`);
    await page.click(`text=${orderId}`);
    await page.click('button:has-text("Confirmar Pedido")');
    await page.click('button:has-text("Pronto para Entrega")');

    // 4. ENTREGADOR: Aceitar e Realizar Entrega
    await page.goto('/auth/login?role=entregador');
    await page.fill('input[name="email"]', 'entregador@teste.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/entregador/);
    
    // Aceitar entrega
    await page.click(`text=${orderId}`);
    await page.click('button:has-text("Aceitar Entrega")');
    await page.click('button:has-text("Marcar como Entregue")');
    
    await expect(page.locator('text=Entrega realizada')).toBeVisible();
  });
});

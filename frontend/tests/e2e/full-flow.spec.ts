import { expect, test } from "@playwright/test";

test.describe("Fluxo real completo", () => {
  test("cadastro, credenciamento, venda e entrega ponta a ponta", async ({ page }) => {
    test.setTimeout(240000);

    async function resetSession() {
      await page.context().clearCookies();
    }

    const stamp = Date.now();
    const customerEmail = `cliente.${stamp}@example.com`;
    const sellerEmail = `vendedor.${stamp}@example.com`;
    const driverEmail = `entregador.${stamp}@example.com`;
    const storeName = `Loja E2E ${stamp}`;
    const productName = `Cerveja E2E ${stamp}`;

    await page.goto("/register/customer");
    await page.locator('input[name="name"]').fill("Cliente E2E");
    await page.locator('input[name="email"]').fill(customerEmail);
    await page.locator('input[name="cpf"]').fill("123.456.789-00");
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Criar Conta" }).click();
    await page.waitForURL("**/auth/login/customer");

    await page.goto("/auth/signup/vendedor");
    await page.locator('input[name="storeName"]').fill(storeName);
    await page.locator('input[name="cnpj"]').fill(`00.000.${String(stamp).slice(-6)}/0001-99`);
    await page.locator('input[name="email"]').fill(sellerEmail);
    await page.locator('input[name="phone"]').fill("(11) 99999-9999");
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Solicitar Credenciamento" }).click();
    await page.waitForURL("**/auth/login/vendedor");

    await page.goto("/auth/signup/entregador");
    await page.locator('input[name="name"]').fill("Entregador E2E");
    await page.locator('input[name="email"]').fill(driverEmail);
    await page.locator('input[name="phone"]').fill("(11) 98888-8888");
    await page.locator('select[name="vehicleType"]').selectOption("Moto");
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Cadastrar para Entregar" }).click();
    await page.waitForURL("**/auth/login/entregador");

    await page.goto("/auth/login/admin");
    await page.locator('input[name="email"]').fill("admin@entregamaisshop.com");
    await page.locator('input[name="password"]').fill("admin123");
    await page.getByRole("button", { name: "Entrar no Sistema" }).click();
    await page.waitForURL("**/admin/credentialing");

    await expect(page.getByText(storeName)).toBeVisible();
    await page.getByRole("button", { name: "Aprovar" }).first().click();
    await expect(page.getByText("Lojista aprovado com sucesso!")).toBeVisible();

    await page.getByRole("button", { name: /Entregadores/ }).click();
    await expect(page.getByText("Entregador E2E")).toBeVisible();
    await page.getByRole("button", { name: "Aprovar" }).first().click();
    await expect(page.getByText("Entregador aprovado com sucesso!")).toBeVisible();

    await resetSession();
    await page.goto("/auth/login/vendedor");
    await page.locator('input[name="email"]').fill(sellerEmail);
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Entrar no Painel" }).click();
    await page.waitForTimeout(500);
    await page.goto("/vendedor/products");
    await page.getByRole("textbox", { name: "Nome do produto" }).fill(productName);
    await page.getByRole("textbox", { name: "Descrição curta" }).fill("Produto criado no fluxo E2E real");
    await page.locator('input[name="price"]').fill("15.9");
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByText("Produto cadastrado com sucesso!")).toBeVisible();
    await expect(page.getByText(productName)).toBeVisible();

    await resetSession();
    await page.goto("/auth/login/customer");
    await page.locator('input[name="email"]').fill(customerEmail);
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Entrar Agora" }).click();
    await page.waitForTimeout(500);
    await page.goto("/");
    const sellerId = await page.evaluate(async (targetStoreName) => {
      const response = await fetch("/api/v1/sellers");
      const payload = await response.json();
      const seller = (payload?.data || []).find((item: { name: string; id: string }) => item.name === targetStoreName);
      return seller?.id ?? null;
    }, storeName);
    expect(sellerId).toBeTruthy();
    await page.goto(`/store/${sellerId}`);
    await expect(page.getByText(productName)).toBeVisible();
    await page.getByRole("button", { name: /Adicionar/i }).first().click();
    await expect(page.getByRole("link", { name: "1" })).toBeVisible();
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Pagamento", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Finalizar Pedido" }).click();
    await expect(page.getByText("Pedido Sucesso!")).toBeVisible();
    
    await resetSession();
    await page.goto("/auth/login/vendedor");
    await page.locator('input[name="email"]').fill(sellerEmail);
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Entrar no Painel" }).click();
    await page.waitForTimeout(500);
    await page.goto("/vendedor/orders");
    await expect(page.getByText(productName)).toBeVisible();
    await page.getByRole("button", { name: "Aceitar Pedido" }).click();
    await page.getByRole("button", { name: "Pronto p/ Entrega" }).click();

    await resetSession();
    await page.goto("/auth/login/entregador");
    await page.locator('input[name="email"]').fill(driverEmail);
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Começar Agora" }).click();
    await page.waitForTimeout(500);
    await page.goto("/entregador/dashboard");
    await page.getByRole("button", { name: "Aceitar Entrega" }).click();
    await page.getByRole("button", { name: /Marcar como Entregue/ }).click();
    await expect(page.getByText("Entrega concluída com sucesso!")).toBeVisible();

    await resetSession();
    await page.goto("/auth/login/customer");
    await page.locator('input[name="email"]').fill(customerEmail);
    await page.locator('input[name="password"]').fill("senha123");
    await page.getByRole("button", { name: "Entrar Agora" }).click();
    await page.waitForTimeout(500);
    await page.goto("/orders");
    await expect(page.getByText(productName)).toBeVisible();
    await expect(page.getByText("Entregue")).toBeVisible();
  });
});

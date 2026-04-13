import { CanonicalRole, normalizeRoles } from "@/lib/auth/roles"

type MockUser = {
  name: string
  roles: CanonicalRole[]
}

const mockUsers = new Map<string, MockUser>([
  ["admin@entregamaisshop.com", { name: "Administrador", roles: ["admin"] }],
  ["admin@demo.com", { name: "Admin Demo", roles: ["admin"] }],
  ["cliente@cliente.com", { name: "Cliente Demo", roles: ["customer"] }],
  ["cliente@teste.com", { name: "Cliente Teste", roles: ["customer"] }],
  ["customer@demo.com", { name: "Customer Demo", roles: ["customer"] }],
  ["vendedor@vendedor.com", { name: "Vendedor Demo", roles: ["seller"] }],
  ["vendedor@teste.com", { name: "Vendedor Teste", roles: ["seller"] }],
  ["seller@demo.com", { name: "Seller Demo", roles: ["seller"] }],
  ["entregador@entregador.com", { name: "Entregador Demo", roles: ["driver"] }],
  ["entregador@teste.com", { name: "Entregador Teste", roles: ["driver"] }],
  ["driver@demo.com", { name: "Driver Demo", roles: ["driver"] }],
])

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getMockUser(email: string): MockUser | null {
  return mockUsers.get(normalizeEmail(email)) ?? null
}

export function upsertMockUser(email: string, name: string | undefined, role: string) {
  const normalizedEmail = normalizeEmail(email)
  const existingUser = mockUsers.get(normalizedEmail)
  const nextRoles = normalizeRoles([...(existingUser?.roles ?? []), role])

  mockUsers.set(normalizedEmail, {
    name: name?.trim() || existingUser?.name || normalizedEmail,
    roles: nextRoles,
  })

  return mockUsers.get(normalizedEmail)!
}

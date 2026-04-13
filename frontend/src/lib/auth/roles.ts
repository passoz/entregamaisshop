export type CanonicalRole = "admin" | "customer" | "seller" | "driver"
export type PortalRole = "admin" | "customer" | "vendedor" | "entregador"

const ROLE_ALIASES: Record<string, CanonicalRole> = {
  admin: "admin",
  customer: "customer",
  seller: "seller",
  vendedor: "seller",
  driver: "driver",
  entregador: "driver",
}

const PORTAL_TO_CANONICAL_ROLE: Record<PortalRole, CanonicalRole> = {
  admin: "admin",
  customer: "customer",
  vendedor: "seller",
  entregador: "driver",
}

export function normalizeRole(role?: string | null): CanonicalRole | null {
  if (!role) return null
  return ROLE_ALIASES[role.toLowerCase()] ?? null
}

export function normalizeRoles(roles: string[] = []): CanonicalRole[] {
  return Array.from(
    new Set(
      roles
        .map((role) => normalizeRole(role))
        .filter((role): role is CanonicalRole => role !== null),
    ),
  )
}

export function getRequiredRoleForPortal(role?: string | null): CanonicalRole | null {
  if (!role) return null
  return PORTAL_TO_CANONICAL_ROLE[role as PortalRole] ?? normalizeRole(role)
}

export function userCanAccessPortal(userRoles: string[] = [], portalRole?: string | null): boolean {
  const requiredRole = getRequiredRoleForPortal(portalRole)
  if (!requiredRole) return false

  return normalizeRoles(userRoles).includes(requiredRole)
}

export function getHomePathForRole(role: CanonicalRole): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "seller":
      return "/vendedor/dashboard"
    case "driver":
      return "/entregador/dashboard"
    case "customer":
      return "/"
  }
}

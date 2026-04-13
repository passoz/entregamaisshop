import { normalizeRoles } from "@/lib/auth/roles"
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"

function getAuthSecret() {
  return process.env.AUTH_SECRET || "any-random-secret-for-demo-12345"
}

function sign(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url")
}

function getRolesFromRequest(request: NextRequest) {
  const rawCookie = request.cookies.get("entregamais_session")?.value
  if (!rawCookie) return []

  const [payload, signature] = rawCookie.split(".")
  if (!payload || !signature) return []

  const expectedSignature = sign(payload)
  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length) return []
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return []

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    return normalizeRoles(session?.user?.roles || [])
  } catch {
    return []
  }
}

export default function proxy(request: NextRequest) {
  const { nextUrl } = request

  const host = (request.headers.get("host") || "").toLowerCase()
  const forwardedHost = (request.headers.get("x-forwarded-host") || "").toLowerCase()
  const roles = getRolesFromRequest(request)
  const hasRole = (...allowedRoles: string[]) =>
    normalizeRoles(allowedRoles).some((role) => roles.includes(role))

  const isAnyAdmin = host.includes("admin.") || forwardedHost.includes("admin.")
  const isAnyVendedor = host.includes("vendedor.") || forwardedHost.includes("vendedor.")
  const isAnyEntregador = host.includes("entregador.") || forwardedHost.includes("entregador.")

  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.startsWith("/auth") ||
    nextUrl.pathname.startsWith("/register")
  ) {
    return NextResponse.next()
  }

  if (nextUrl.pathname === "/") {
    const url = nextUrl.clone()
    if (isAnyAdmin) {
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
    if (isAnyVendedor) {
      url.pathname = "/vendedor"
      return NextResponse.redirect(url)
    }
    if (isAnyEntregador) {
      url.pathname = "/entregador"
      return NextResponse.redirect(url)
    }
  }

  if (nextUrl.pathname.startsWith("/admin") && !roles.includes("admin")) {
    const url = nextUrl.clone()
    url.pathname = "/auth/login/admin"
    return NextResponse.redirect(url)
  }

  if (nextUrl.pathname.startsWith("/vendedor") && !hasRole("vendedor", "seller")) {
    const url = nextUrl.clone()
    url.pathname = "/auth/login/vendedor"
    return NextResponse.redirect(url)
  }

  if (nextUrl.pathname.startsWith("/entregador") && !hasRole("entregador", "driver")) {
    const url = nextUrl.clone()
    url.pathname = "/auth/login/entregador"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

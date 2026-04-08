import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  
  // Broad host detection to handle various proxy scenarios
  const host = (req.headers.get("host") || "").toLowerCase()
  const forwardedHost = (req.headers.get("x-forwarded-host") || "").toLowerCase()
  const roles = (req.auth as any)?.roles || []

  const isAnyAdmin = host.includes("admin.") || forwardedHost.includes("admin.")
  const isAnyVendedor = host.includes("vendedor.") || forwardedHost.includes("vendedor.")
  const isAnyEntregador = host.includes("entregador.") || forwardedHost.includes("entregador.")

  // 0. Escape hatch for static assets and auth paths
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.startsWith("/auth") ||
    nextUrl.pathname.startsWith("/register")
  ) {
    return NextResponse.next()
  }

  // 1. Root Path Handling for Subdomains (Explicit Redirect)
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

  // 2. Auth Protection and Role-based Redirection
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isVendedorRoute = nextUrl.pathname.startsWith("/vendedor")
  const isEntregadorRoute = nextUrl.pathname.startsWith("/entregador")

  if (isAdminRoute && !roles.includes("admin")) {
    const url = nextUrl.clone()
    url.pathname = "/auth/login/admin"
    return NextResponse.redirect(url)
  }
  if (isVendedorRoute && !roles.includes("vendedor")) {
    const url = nextUrl.clone()
    url.pathname = "/auth/login/vendedor"
    return NextResponse.redirect(url)
  }
  if (isEntregadorRoute && !roles.includes("entregador")) {
    const url = nextUrl.clone()
    url.pathname = "/auth/login/entregador"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

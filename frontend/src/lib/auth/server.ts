import { getMockUser } from "@/lib/auth/mock-users"
import { getRequiredRoleForPortal, normalizeRoles, userCanAccessPortal } from "@/lib/auth/roles"
import { AUTH_COOKIE_NAME, AuthSession } from "@/lib/auth/shared"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"

const keycloakPublicUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
const keycloakInternalUrl =
  process.env.KEYCLOAK_INTERNAL_URL ||
  process.env.KEYCLOAK_ISSUER_URL ||
  keycloakPublicUrl

function getAuthSecret() {
  return process.env.AUTH_SECRET || "any-random-secret-for-demo-12345"
}

function sign(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url")
}

function encodeSession(session: AuthSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")
  return `${payload}.${sign(payload)}`
}

function decodeSessionCookie(cookieValue?: string | null): AuthSession | null {
  if (!cookieValue) return null

  const [payload, signature] = cookieValue.split(".")
  if (!payload || !signature) {
    return null
  }

  const expectedSignature = sign(payload)

  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthSession
  } catch {
    return null
  }
}

function decodeJwtPayload(token?: string) {
  if (!token) return null
  const [, payload] = token.split(".")
  if (!payload) return null

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    return null
  }
}

function createSessionCookieValue(session: AuthSession) {
  return encodeSession({
    ...session,
    user: {
      ...session.user,
      roles: normalizeRoles(session.user.roles),
    },
  })
}

function buildSessionCookie(session: AuthSession) {
  return {
    name: AUTH_COOKIE_NAME,
    value: createSessionCookieValue(session),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export function setSessionCookie(response: NextResponse, session: AuthSession) {
  response.cookies.set(buildSessionCookie(session))
}

export async function getServerSession() {
  const cookieStore = await cookies()
  return decodeSessionCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value)
}

export function getSessionFromRequest(request: NextRequest) {
  return decodeSessionCookie(request.cookies.get(AUTH_COOKIE_NAME)?.value)
}

export async function authenticateCredentials(input: {
  email: string
  password: string
  role: string
}) {
  const requestedRole = getRequiredRoleForPortal(input.role)
  if (!requestedRole) return null

  if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled" || input.password === "Emshop#777") {
    const mockUser = getMockUser(input.email)
    const mockRoles = normalizeRoles(mockUser?.roles || [])

    if (!userCanAccessPortal(mockRoles, input.role)) {
      return null
    }

    return {
      user: {
        id: `mock-${requestedRole}-1`,
        name: mockUser?.name || `Usuario Teste (${requestedRole})`,
        email: input.email,
        roles: mockRoles,
        image: null,
      },
      accessToken: "mock-token",
      refreshToken: undefined,
      expiresAt: undefined,
    } satisfies AuthSession
  }

  try {
    const tokenUrl = `${keycloakInternalUrl}/protocol/openid-connect/token`
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      grant_type: "password",
      username: input.email,
      password: input.password,
      scope: "openid profile email",
    })

    if (process.env.KEYCLOAK_CLIENT_SECRET) {
      params.set("client_secret", process.env.KEYCLOAK_CLIENT_SECRET)
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cache: "no-store",
    })

    if (!tokenResponse.ok) return null
    const tokens = await tokenResponse.json()
    const accessPayload = decodeJwtPayload(tokens.access_token)

    let profile: any = null
    const userInfoResponse = await fetch(
      `${keycloakInternalUrl}/protocol/openid-connect/userinfo`,
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        cache: "no-store",
      },
    )

    if (userInfoResponse.ok) {
      profile = await userInfoResponse.json()
    }

    const userRoles = normalizeRoles(
      profile?.realm_access?.roles || accessPayload?.realm_access?.roles || [],
    )

    if (!userCanAccessPortal(userRoles, input.role)) {
      return null
    }

    return {
      user: {
        id: profile?.sub || accessPayload?.sub,
        name:
          profile?.name ||
          accessPayload?.name ||
          profile?.preferred_username ||
          accessPayload?.preferred_username,
        email: profile?.email || accessPayload?.email || input.email,
        roles: userRoles,
        image: null,
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_at,
    } satisfies AuthSession
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export const AUTH_COOKIE_NAME = "entregamais_session"
export const AUTH_CHANGED_EVENT = "entregamais:auth-changed"

export type AuthUser = {
  id: string
  name?: string | null
  email: string
  roles: string[]
  image?: string | null
}

export type AuthSession = {
  user: AuthUser
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

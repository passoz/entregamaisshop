import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    }),
    Credentials({
      name: "Entregamais Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // MOCK BYPASS: If mocking is enabled, return a mock user immediately
        if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
          console.log('Auth: Mock login bypass active for', credentials.email)
          return {
            id: `mock-${credentials.role || 'user'}-1`,
            name: `Usuário Teste (${credentials.role})`,
            email: credentials.email as string,
            roles: [credentials.role || 'customer'],
            image: null,
          }
        }

        try {
          // 1. Fetch token from Keycloak using direct access grant
          const tokenUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`
          const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
            grant_type: "password",
            username: credentials.email as string,
            password: credentials.password as string,
            scope: "openid profile email",
          })

          const resp = await fetch(tokenUrl, {
            method: "POST",
            body: params,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          })

          if (!resp.ok) return null
          const tokens = await resp.json()

          // 2. Fetch User Profile to get roles
          const userUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`
          const userResp = await fetch(userUrl, {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          })

          if (!userResp.ok) return null
          const profile = await userResp.json()

          return {
            id: profile.sub,
            name: profile.name || profile.preferred_username,
            email: profile.email,
            roles: profile.realm_access?.roles || [],
            image: null,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.roles = (user as any).roles || []
      } else if (profile) {
        token.roles = (profile as any).realm_access?.roles || []
      }
      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken
      (session as any).refreshToken = token.refreshToken
      (session as any).roles = (token as any).roles || []
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
})

import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.roles = (profile as any).realm_access?.roles || []
      }
      return token
    },
    async session({ session, token }) {
      (session as any).roles = token.roles || []
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
})

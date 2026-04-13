"use client"

import {
  AUTH_CHANGED_EVENT,
  AuthSession,
} from "@/lib/auth/shared"
import { getBrowserSession } from "@/lib/auth/browser"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

type SessionStatus = "authenticated" | "unauthenticated" | "loading"

type AuthContextValue = {
  data: AuthSession | null
  status: SessionStatus
  refreshSession: () => Promise<AuthSession | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<SessionStatus>("loading")

  const refreshSession = async () => {
    try {
      const nextSession = await getBrowserSession()
      setSession(nextSession)
      setStatus(nextSession ? "authenticated" : "unauthenticated")
      return nextSession
    } catch {
      setSession(null)
      setStatus("unauthenticated")
      return null
    }
  }

  useEffect(() => {
    void refreshSession()

    const handleAuthChange = () => {
      void refreshSession()
    }

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange)
    }
  }, [])

  const value = {
    data: session,
    status,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  }
}

export function useSession() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useSession must be used within AuthProvider")
  }

  return {
    data: context.data,
    status: context.status,
    update: context.refreshSession,
  }
}

export async function getSession() {
  return getBrowserSession()
}

export async function signIn(
  provider: string,
  options: Record<string, unknown> = {},
) {
  if (provider !== "credentials") {
    return {
      ok: false,
      status: 400,
      error: "unsupported_provider",
      url: null,
    }
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  })

  if (response.ok) {
    await response.json()
    notifyAuthChanged()
  }

  return {
    ok: response.ok,
    status: response.status,
    error: response.ok ? undefined : "credentials",
    url: null,
  }
}

export async function signOut(options?: { callbackUrl?: string; redirect?: boolean }) {
  await fetch("/api/auth/logout", {
    method: "POST",
  })

  notifyAuthChanged()

  if (options?.redirect !== false && typeof window !== "undefined") {
    window.location.href = options?.callbackUrl || "/"
  }
}

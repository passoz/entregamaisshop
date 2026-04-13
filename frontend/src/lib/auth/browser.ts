import { AuthSession } from "@/lib/auth/shared"

export async function getBrowserSession() {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) return null

  const payload = await response.json()
  return (payload?.session || null) as AuthSession | null
}

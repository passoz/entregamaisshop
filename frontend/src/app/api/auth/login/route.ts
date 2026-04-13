import { authenticateCredentials, setSessionCookie } from "@/lib/auth/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "")
    const role = String(body?.role || "")

    if (!email || !password || !role) {
      return NextResponse.json({ message: "Credenciais incompletas." }, { status: 400 })
    }

    const session = await authenticateCredentials({ email, password, role })
    if (!session) {
      return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 })
    }

    const response = NextResponse.json({ session })
    setSessionCookie(response, session)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Erro ao autenticar." }, { status: 500 })
  }
}

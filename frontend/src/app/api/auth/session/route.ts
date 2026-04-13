import { getServerSession } from "@/lib/auth/server"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession()
  return NextResponse.json({ session })
}

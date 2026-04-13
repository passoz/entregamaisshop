"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { signIn } from "@/lib/auth/client"

export default function CustomerLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: "customer",
        redirect: false,
      })
      
      if (result?.ok) {
        const callbackUrl = searchParams.get("callbackUrl") || "/"
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 100)
      } else {
        if (email.includes('admin@')) {
          setError('Contas administrativas devem acessar pelo Portal do Administrador.')
        } else {
          setError('Ops! Credenciais inválidas. Verifique seu e-mail e senha para voltar à festa.')
        }
      }
    } catch (err) {
      setError('Parece que o freezer travou! Tivemos um problema técnico. Tente de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      role="customer" 
      title="Entrar na Roda" 
      subtitle="Sua bebida gelada a um clique de distância."
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="voce@exemplo.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-ze-yellow focus:ring-ze-yellow/10"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/auth/forgot-password" title="Esqueci minha senha" className="text-xs font-bold text-ze-black/60 hover:underline">
              Esqueceu?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-ze-yellow focus:ring-ze-yellow/10"
          />
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-ze-yellow text-ze-black font-black rounded-2xl shadow-lg shadow-ze-yellow/20 hover:bg-ze-yellow/90 transition-all text-lg group"
        >
          {loading ? 'Entrando...' : 'Entrar Agora'}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Ainda não tem conta? <br/>
            <Link href="/register/customer" className="text-ze-black font-black hover:underline underline-offset-4 decoration-ze-yellow decoration-2">Crie sua conta</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

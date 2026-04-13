"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowRight, Truck } from "lucide-react"
import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { signIn } from "@/lib/auth/client"

export default function DriverLogin() {
  const router = useRouter()
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
        role: "entregador",
        redirect: false,
      })
      
      if (result?.ok) {
        setTimeout(() => {
          window.location.href = '/entregador/dashboard'
        }, 100)
      } else {
        if (email.includes('admin@')) {
          setError('Contas administrativas devem acessar pelo Portal do Administrador.')
        } else {
          setError('Dados de acesso não conferem. Verifique seu e-mail de parceiro e sua senha.')
        }
      }
    } catch (err) {
      setError('Sem sinal com a central de rotas. Verifique sua conexão e tente logar novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      role="entregador" 
      title="Portal do Entregador" 
      subtitle="Entre para começar suas entregas de hoje."
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
            placeholder="entregador@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-coral focus:ring-brand-coral/10"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha de Acesso</Label>
            <Link href="/auth/forgot-password" title="Esqueci minha senha" className="text-xs font-bold text-brand-coral hover:underline">
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
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-coral focus:ring-brand-coral/10"
          />
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-brand-coral text-white font-black rounded-2xl shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90 transition-all text-lg group"
        >
          {loading ? 'Entrando...' : 'Começar Agora'}
          <Truck className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="text-center pt-8 border-t border-slate-50">
          <p className="text-sm font-medium text-slate-500 mb-4">
            Ainda não é um parceiro EntregaMais?
          </p>
          <Link href="/auth/signup/entregador">
            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-brand-coral font-bold hover:bg-brand-coral/5 border-2 group">
              Cadastrar para Entregar
            </Button>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

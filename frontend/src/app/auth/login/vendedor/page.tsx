"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { signIn } from "@/lib/auth/client"

export default function SellerLogin() {
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
        role: "vendedor",
        redirect: false,
      })
      
      if (result?.ok) {
        setTimeout(() => {
          window.location.href = '/vendedor/dashboard'
        }, 100)
      } else {
        if (email.includes('admin@')) {
          setError('Contas administrativas devem acessar pelo Portal do Administrador.')
        } else {
          setError('Dados incorretos. Verifique e-mail e senha para gerenciar sua loja.')
        }
      }
    } catch (err) {
      setError('Erro ao conectar com a central de lojistas. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      role="vendedor" 
      title="Login do Lojista" 
      subtitle="Acesse seu painel para gerenciar sua loja."
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail Corporativo</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="vendas@sualoja.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-teal focus:ring-brand-teal/10"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/auth/forgot-password" title="Esqueci minha senha" className="text-xs font-bold text-brand-teal hover:underline">
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
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-teal focus:ring-brand-teal/10"
          />
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-brand-teal text-white font-black rounded-2xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 transition-all text-lg group"
        >
          {loading ? 'Entrando...' : 'Entrar no Painel'}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Ou continue com</span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 11h8.5c.1.7.2 1.4.2 2.1 0 5.2-3.5 8.9-8.7 8.9C7.1 22 3 17.9 3 13s4.1-9 9-9c2.4 0 4.5.9 6.1 2.3l-2.7 2.7c-1-1-2.2-1.5-3.4-1.5-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c3 0 4.7-2.1 5.1-3.6H12v-2.3z"/></svg>
          Google
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Ainda não tem uma loja? <br/>
            <Link href="/auth/signup/vendedor" className="text-brand-teal font-black hover:underline">Solicite sua conta</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

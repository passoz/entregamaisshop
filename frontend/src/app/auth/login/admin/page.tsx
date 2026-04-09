"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ShieldCheck, ArrowRight } from "lucide-react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function AdminLogin() {
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
        role: "admin",
        redirect: false,
      })
      
      if (result?.ok) {
        router.push('/admin')
      } else {
        setError('Acesso negado. Verifique suas credenciais.')
      }
    } catch (err) {
      setError('Falha na conexão com o servidor de segurança')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      role="admin" 
      title="Acesso Restrito" 
      subtitle="Portal de administração do EntregaMais."
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 italic">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail de Administrador</Label>
          <Input 
            id="email" 
            type="email"
            placeholder="admin@entregamais.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-slate-800 focus:ring-slate-800/10 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Chave de Acesso</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-slate-800 focus:ring-slate-800/10"
          />
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all text-lg group"
        >
          {loading ? 'Validando...' : 'Entrar no Sistema'}
          <ShieldCheck className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
        </Button>

        <div className="text-center pt-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Uso restrito a colaboradores autorizados
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

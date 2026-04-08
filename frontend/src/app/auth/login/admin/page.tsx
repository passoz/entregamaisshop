"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ShieldCheck, ArrowRight } from "lucide-react"

export default function AdminLogin() {
  return (
    <AuthLayout 
      role="admin" 
      title="Acesso Restrito" 
      subtitle="Portal de administração do EntregaMais."
    >
      <form className="space-y-6" action={() => {}}>
        <div className="space-y-2">
          <Label htmlFor="admin-id">ID de Administrador</Label>
          <Input 
            id="admin-id" 
            placeholder="admin.01" 
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-slate-800 focus:ring-slate-800/10 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Chave de Acesso</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-slate-800 focus:ring-slate-800/10"
          />
        </div>

        <Button className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all text-lg group">
          Entrar no Sistema
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

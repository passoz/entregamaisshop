"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowRight, Truck } from "lucide-react"
import Link from "next/link"

export default function DriverLogin() {
  return (
    <AuthLayout 
      role="entregador" 
      title="Portal do Entregador" 
      subtitle="Entre para começar suas entregas de hoje."
    >
      <form className="space-y-6" action={() => {}}>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone ou E-mail</Label>
          <Input 
            id="phone" 
            placeholder="(11) 99999-9999" 
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
            type="password" 
            placeholder="••••••••" 
            className="h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-coral focus:ring-brand-coral/10"
          />
        </div>

        <Button className="w-full h-14 bg-brand-coral text-white font-black rounded-2xl shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90 transition-all text-lg group">
          Começar Agora
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

"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowRight, Store, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SellerSignUp() {
  return (
    <AuthLayout 
      role="vendedor" 
      title="Seja um Parceiro" 
      subtitle="Cadastre sua loja e comece a vender em minutos."
    >
      <form className="space-y-4" action={() => {}}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Nome da Loja</Label>
            <Input id="store-name" placeholder="Sua Loja S.A" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0001-00" className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail Comercial</Label>
          <Input id="email" type="email" placeholder="contato@loja.com" className="h-11 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp de Vendas</Label>
          <Input id="phone" placeholder="(11) 99999-9999" className="h-11 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Criar Senha</Label>
          <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="h-11 rounded-xl" />
        </div>

        <div className="py-2 space-y-3">
          {[
            "Visibilidade para milhares de clientes",
            "Gestão simplificada de estoque e pedidos",
            "Relatórios de vendas em tempo real"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              {text}
            </div>
          ))}
        </div>

        <Button className="w-full h-14 bg-brand-teal text-white font-black rounded-2xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 transition-all text-lg group">
          Solicitar Credenciamento
          <Store className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Já é um parceiro? <Link href="/auth/login/vendedor" className="text-brand-teal font-black hover:underline">Entrar no Painel</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Truck, CheckCircle, Smartphone } from "lucide-react"
import Link from "next/link"

export default function DriverSignUp() {
  return (
    <AuthLayout 
      role="entregador" 
      title="Ganhe com a Gente" 
      subtitle="Faça seu cadastro e comece a entregar na sua região."
    >
      <form className="space-y-4" action={() => {}}>
        <div className="space-y-2">
          <Label htmlFor="fullname">Nome Completo</Label>
          <Input id="fullname" placeholder="Seu Nome" className="h-11 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="nome@exemplo.com" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Celular (WhatsApp)</Label>
            <Input id="phone" placeholder="(11) 99999-9999" className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle">Veículo</Label>
          <select id="vehicle" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-coral/10 bg-white outline-none">
            <option>Moto</option>
            <option>Carro</option>
            <option>Bicicleta</option>
            <option>Caminhão (Leve)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Criar Senha</Label>
          <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="h-11 rounded-xl" />
        </div>

        <div className="py-4 bg-brand-amber/5 rounded-[1.5rem] p-4 border border-brand-amber/10 space-y-3">
          {[
            "Flexibilidade de horários total",
            "Receba seus ganhos semanalmente",
            "Suporte exclusivo 24/7"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <CheckCircle className="w-4 h-4 text-brand-amber fill-brand-amber/10" />
              {text}
            </div>
          ))}
        </div>

        <Button className="w-full h-14 bg-brand-coral text-white font-black rounded-2xl shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90 transition-all text-lg group">
          Cadastrar para Entregar
          <Smartphone className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Já é um parceiro? <Link href="/auth/login/entregador" className="text-brand-coral font-black hover:underline">Entrar Agora</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

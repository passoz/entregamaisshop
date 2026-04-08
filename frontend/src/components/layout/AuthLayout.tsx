import * as React from "react"
import Link from "next/link"
import { Logo } from "@/components/layout/Logo"
import { Card, CardContent } from "@/components/ui/Card"

export function AuthLayout({ 
  children, 
  title, 
  subtitle,
  role 
}: { 
  children: React.ReactNode, 
  title: string, 
  subtitle: string,
  role: 'admin' | 'vendedor' | 'entregador' | 'customer'
}) {
  const roleStyles = {
    admin: "bg-ze-black",
    vendedor: "bg-ze-yellow",
    entregador: "bg-ze-yellow",
    customer: "bg-ze-yellow"
  }

  const roleTextStyles = {
    admin: "text-ze-yellow",
    vendedor: "text-ze-black",
    entregador: "text-ze-black",
    customer: "text-ze-black"
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Visual/Branding */}
      <div className={`hidden lg:flex flex-col justify-between p-12 ${roleStyles[role]} ${roleTextStyles[role]} relative overflow-hidden`}>
        <div className="relative z-10">
          <Logo className={`mb-12 scale-125 origin-left ${role === 'admin' ? 'brightness-150' : ''}`} />
          <h1 className="text-6xl font-black leading-none mb-6 uppercase italic tracking-tighter">
            Entregando <br/>
            gelada no preço <br/>
            de supermercado.
          </h1>
          <p className={`text-xl ${role === 'admin' ? 'text-ze-yellow/70' : 'text-ze-black/70'} max-w-md font-bold`}>
            {role === 'vendedor' ? 'Leve seu depósito para o digital e venda mais bebidas.' : 
             role === 'entregador' ? 'Seja o herói da rodada: entregue bebidas geladas em minutos.' : 
             'Sua bebida favorita, onde você estiver, sempre gelada.'}
          </p>
        </div>

        {/* Big styled Beverage Icon as background watermark */}
        <div className={`absolute -bottom-10 -right-10 opacity-10 ${role === 'admin' ? 'text-ze-yellow' : 'text-ze-black'}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[500px] h-[500px]">
            <path d="M17 22H7a2 2 0 0 1-2-2V7l2-3V2h6v2l2 3v13a2 2 0 0 1-2 2Z" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-12 h-12 rounded-full border-4 ${role === 'admin' ? 'border-ze-yellow/20' : 'border-ze-black/20'} inline-block bg-ze-gray overflow-hidden`}>
                <div className="w-full h-full bg-ze-gray flex items-center justify-center text-lg">
                  {i % 2 === 0 ? '🍺' : '🥤'}
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm font-black uppercase tracking-widest">
            +10k {role === 'vendedor' ? 'Depósitos' : role === 'entregador' ? 'Entregadores' : 'Parceiros'} ativos
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex items-center justify-center p-8 bg-ze-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8 bg-ze-yellow p-4 rounded-2xl">
            <Logo />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-ze-black tracking-tighter uppercase italic">{title}</h2>
            <p className="text-ze-black/60 font-bold">{subtitle}</p>
          </div>

          <Card className="border-4 border-ze-black shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] rounded-3xl overflow-hidden">
            <CardContent className="p-10 bg-white">
              {children}
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-ze-black/40 font-bold uppercase tracking-widest">
              Ao continuar, você concorda com nossos <br/>
              <Link href="/terms" className="text-ze-black underline decoration-ze-yellow decoration-4 underline-offset-4 hover:text-ze-red transition-colors">Termos de Serviço</Link> e <Link href="/privacy" className="text-ze-black underline decoration-ze-yellow decoration-4 underline-offset-4 hover:text-ze-red transition-colors">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function SellerRegistration() {
  return (
    <main className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-xl border-slate-100 shadow-xl shadow-brand-amber/5">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber to-brand-coral text-white shadow-lg shadow-brand-amber/20 mb-6">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Cadastre seu Negócio</h1>
            <p className="text-slate-500 mt-2">Comece a vender e multiplique seu faturamento.</p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Loja</label>
                <Input placeholder="Sabor de Minas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                <Input placeholder="00.000.000/0001-00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail corporativo</label>
              <Input type="email" placeholder="contato@sabordeminas.com" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            
            <Button className="w-full mt-6 h-12 text-base group bg-brand-amber text-slate-900 hover:bg-brand-amber/90 shadow-brand-amber/20">
              Solicitar Cadastro
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Já é parceiro? <Link href="/login" className="font-semibold text-brand-coral hover:underline leading-none">Entrar no Dashboard</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

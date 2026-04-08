import Link from "next/link";
import { Bike, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function DriverRegistration() {
  return (
    <main className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-md border-slate-100 shadow-xl shadow-brand-sky/5">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sky text-white shadow-lg shadow-brand-sky/20 mb-6">
              <Bike className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Seja um Entregador</h1>
            <p className="text-slate-500 mt-2">Faça seu próprio horário e ganhe dinheiro.</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
              <Input placeholder="Carlos Silva" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <Input type="email" placeholder="carlos@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CNH</label>
              <Input placeholder="Num. do documento" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Placa do Veículo</label>
              <Input placeholder="AAA-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            
            <Button className="w-full mt-6 h-12 text-base group bg-brand-sky text-white hover:bg-brand-sky/90 shadow-brand-sky/20 border-0">
              Cadastrar Agora
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Já faz entregas? <Link href="/login" className="font-semibold text-brand-sky hover:underline leading-none">Entrar no App</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

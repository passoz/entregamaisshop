import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function CustomerRegistration() {
  return (
    <main className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-64px)] bg-ze-gray">
      <Card className="w-full max-w-md border-4 border-ze-black shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] rounded-3xl overflow-hidden">
        <CardContent className="p-10 bg-white">
          <div className="text-center mb-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-ze-yellow text-ze-black shadow-xl border-4 border-ze-black mb-8 transform -rotate-3">
              <UserPlus className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-black text-ze-black uppercase italic tracking-tighter leading-none">Entrar na <br/> Rodada</h1>
            <p className="text-ze-black/40 mt-4 font-bold uppercase tracking-widest text-xs">Sua bebida gelada a um clique de distância.</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest">Nome completo</label>
              <Input placeholder="Seu Nome" className="h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0" />
            </div>
            <div>
              <label className="block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest">E-mail</label>
              <Input type="email" placeholder="email@exemplo.com" className="h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0" />
            </div>
            <div>
              <label className="block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest">CPF (Para validação de idade)</label>
              <Input placeholder="000.000.000-00" className="h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0" />
            </div>
            <div>
              <label className="block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest">Senha</label>
              <Input type="password" placeholder="••••••••" className="h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0" />
            </div>
            
            <Button variant="ze-dark" className="w-full mt-8 h-14 text-lg font-black uppercase italic tracking-tighter group transition-all">
              Criar Conta
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </form>

          <div className="mt-10 text-center text-sm font-bold text-ze-black/40 uppercase tracking-widest">
            Já tem uma conta? <Link href="/auth/login/customer" className="text-ze-black underline decoration-ze-yellow decoration-4 underline-offset-4 hover:text-ze-red transition-colors ml-2">Entrar</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

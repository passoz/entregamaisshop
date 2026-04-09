"use client"

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-ze-gray">

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white border-4 border-ze-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] mb-12">
          {/* Hero Section */}
          <div className="bg-ze-black text-white p-10 md:p-16 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-ze-yellow text-ze-black rounded-2xl mb-6 transform rotate-2">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
                Política de <br/> Privacidade
              </h1>
              <p className="text-ze-yellow font-bold uppercase tracking-widest text-sm">
                Segurança e transparência com seus dados
              </p>
            </div>
            
            {/* Watermark */}
            <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 transform -rotate-12" />
          </div>

          <div className="p-8 md:p-16 space-y-12">
            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black">
                  <Database className="w-6 h-6" />
                </div>
                Quais dados coletamos?
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  Para entregar sua bebida gelada, precisamos de algumas informações básicas. Coletamos dados que você nos fornece diretamente, como:
                </p>
                <ul className="list-none mt-4 space-y-3">
                  <li className="flex items-start gap-2 italic">
                    <span className="text-ze-yellow font-black">/</span>
                    <span>Informações de Cadastro: Nome, E-mail, CPF e Senha.</span>
                  </li>
                  <li className="flex items-start gap-2 italic">
                    <span className="text-ze-yellow font-black">/</span>
                    <span>Localização: Para encontrar o vendedor mais próximo e realizar a entrega.</span>
                  </li>
                  <li className="flex items-start gap-2 italic">
                    <span className="text-ze-yellow font-black">/</span>
                    <span>Histórico de Pedidos: Para facilitar suas próximas rodadas.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black">
                  <Eye className="w-6 h-6" />
                </div>
                Como usamos seus dados?
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  Utilizamos suas informações exclusivamente para melhorar sua experiência no Entregamais:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-ze-gray p-6 rounded-2xl border-2 border-ze-black">
                    <h4 className="font-black uppercase italic mb-2 text-ze-black">Operação</h4>
                    <p className="text-sm">Processar pagamentos e coordenar entregas com nossos parceiros.</p>
                  </div>
                  <div className="bg-ze-gray p-6 rounded-2xl border-2 border-ze-black">
                    <h4 className="font-black uppercase italic mb-2 text-ze-black">Comunicação</h4>
                    <p className="text-sm">Enviar atualizações sobre o seu pedido e novidades na geladeira.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                Segurança dos Dados
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  Levamos a segurança a sério. Utilizamos criptografia de ponta a ponta (SSL) e protocolos de autenticação robustos para garantir que seus dados nunca caiam em mãos erradas.
                </p>
                <p className="mt-4 font-bold text-ze-red uppercase tracking-tighter italic">
                  * NUNCA solicitamos sua senha por e-mail ou telefone.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black">
                  <Bell className="w-6 h-6" />
                </div>
                Seus Direitos (LGPD)
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  Você tem total controle sobre seus dados conforme a Lei Geral de Proteção de Dados:
                </p>
                <ul className="list-disc ml-6 mt-4 space-y-2">
                  <li>Direito de acesso e correção de dados.</li>
                  <li>Direito de solicitar a exclusão de sua conta e dados.</li>
                  <li>Direito de revogar o consentimento para marketing.</li>
                </ul>
              </div>
            </section>

            <div className="pt-8 border-t-4 border-ze-gray flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <Lock className="w-12 h-12 text-ze-yellow" />
                <div>
                  <h4 className="font-black uppercase italic text-ze-black">Sua privacidade</h4>
                  <p className="text-sm text-ze-black/50 font-bold uppercase tracking-tight">é o nosso compromisso</p>
                </div>
              </div>
              <Button asChild variant="ze-dark" className="font-black uppercase italic px-10">
                <Link href="/terms">Ver Termos de Serviço</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer for the privacy page */}
        <div className="text-center text-ze-black/40 font-bold uppercase tracking-widest text-xs mb-12">
          Dúvidas sobre seus dados? <a href="mailto:privacidade@entregamais.com" className="text-ze-black underline">privacidade@entregamais.com</a> <br/>
          &copy; 2026 Entregamais Shop
        </div>
      </main>
    </div>
  );
}

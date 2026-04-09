"use client"

import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-ze-gray">

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white border-4 border-ze-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] mb-12">
          {/* Hero Section */}
          <div className="bg-ze-black text-white p-10 md:p-16 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-ze-yellow text-ze-black rounded-2xl mb-6 transform -rotate-2">
                <Scale className="w-8 h-8" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
                Termos de <br/> Serviço
              </h1>
              <p className="text-ze-yellow font-bold uppercase tracking-widest text-sm">
                Atualizado em 08 de Abril de 2026
              </p>
            </div>
            
            {/* Watermark */}
            <FileText className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 transform rotate-12" />
          </div>

          <div className="p-8 md:p-16 space-y-12">
            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black">1</div>
                Aceitação dos Termos
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  Ao acessar ou utilizar a plataforma Entregamais, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá utilizar nossos serviços.
                </p>
                <p className="mt-4">
                  O Entregamais reserva-se o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black">2</div>
                Elegibilidade e Cadastro
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  A venda de bebidas alcoólicas é estritamente proibida para menores de 18 anos. Ao utilizar o Entregamais, você declara ter idade legal para consumir álcool em sua jurisdição.
                </p>
                <ul className="list-disc ml-6 mt-4 space-y-2">
                  <li>Você é responsável por manter a confidencialidade de sua conta.</li>
                  <li>Você deve fornecer informações precisas e completas durante o registro.</li>
                  <li>O uso de CPFs falsos resultará no banimento imediato da plataforma.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black">3</div>
                Uso do Serviço
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  O Entregamais conecta consumidores a vendedores de bebidas e entregadores independentes. Não somos fabricantes das bebidas, mas garantimos a qualidade do serviço de entrega através de nossos parceiros selecionados.
                </p>
                <p className="mt-4 font-bold border-l-4 border-ze-yellow pl-4 italic">
                  "Sua bebida deve chegar gelada. Se chegar quente, entre em contato com nosso suporte imediatamente."
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black">4</div>
                Pagamentos e Cancelamentos
              </h2>
              <div className="prose prose-ze text-ze-black/70 font-medium leading-relaxed">
                <p>
                  Aceitamos pagamentos via Cartão de Crédito, Débito e PIX. Os preços exibidos incluem os impostos aplicáveis, mas as taxas de entrega são calculadas separadamente com base na sua localização.
                </p>
                <p className="mt-4">
                  Cancelamentos podem ser feitos sem custo adicional até que o vendedor aceite o pedido. Após a aceitação, uma taxa de cancelamento pode ser aplicada.
                </p>
              </div>
            </section>

            <div className="pt-8 border-t-4 border-ze-gray flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-12 h-12 text-ze-yellow" />
                <div>
                  <h4 className="font-black uppercase italic text-ze-black">Segurança Primeiro</h4>
                  <p className="text-sm text-ze-black/50 font-bold uppercase tracking-tight">Privacidade e dados protegidos</p>
                </div>
              </div>
              <Button asChild variant="ze-dark" className="font-black uppercase italic px-10">
                <Link href="/privacy">Ver Política de Privacidade</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer for the terms page */}
        <div className="text-center text-ze-black/40 font-bold uppercase tracking-widest text-xs mb-12">
          &copy; 2026 Entregamais - Todos os direitos reservados. <br/>
          Beba com moderação. Se dirigir, não beba.
        </div>
      </main>
    </div>
  );
}

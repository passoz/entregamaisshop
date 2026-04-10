"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight, HelpCircle, MessageCircle, Truck, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HelpPage() {
  const { slug } = useParams();

  const content: Record<string, { title: string, subtitle: string, icon: any, questions: { q: string, a: string }[] }> = {
    "fale-conosco": {
      title: "Fale Conosco",
      subtitle: "Estamos aqui para você",
      icon: MessageCircle,
      questions: [
        { q: "Quais são os canais de atendimento?", a: "Você pode nos contatar via chat no app, e-mail suporte@entregamais.com ou telefone 0800-ZE-MAIS." },
        { q: "Qual o horário de funcionamento do suporte?", a: "Nosso suporte funciona todos os dias, das 08h às 02h da manhã." }
      ]
    },
    "duvidas-frequentes": {
      title: "Dúvidas Frequentes",
      subtitle: "FAQ",
      icon: HelpCircle,
      questions: [
        { q: "Como cancelar um pedido?", a: "Você pode cancelar diretamente pelo app enquanto o status for 'Pendente'. Após isso, entre em contato via chat." },
        { q: "Quais as formas de pagamento?", a: "Aceitamos cartões de crédito, débito, pix e vale-refeição diretamente no aplicativo." },
        { q: "Como alterar meu endereço?", a: "Acesse seu perfil ou mude o endereço diretamente no seletor de localização na home." }
      ]
    },
    "politica-de-entrega": {
      title: "Política de Entrega",
      subtitle: "Como entregamos",
      icon: Truck,
      questions: [
        { q: "Qual o tempo médio de entrega?", a: "Nossa meta é entregar em até 25 minutos para áreas urbanas centrais." },
        { q: "Cobramos taxa de entrega?", a: "Muitos dos nossos parceiros oferecem frete grátis para pedidos acima de um valor mínimo." }
      ]
    },
    "termos-de-uso": {
      title: "Termos de Uso",
      subtitle: "Regras da plataforma",
      icon: FileText,
      questions: [
        { q: "Uso de dados", a: "Seus dados são protegidos e utilizados apenas para processar seus pedidos e melhorar sua experiência." },
        { q: "Idade Mínima", a: "A venda de bebidas alcoólicas é proibida para menores de 18 anos. Verificamos o documento na entrega." }
      ]
    },
    "privacidade": {
      title: "Privacidade",
      subtitle: "Seus dados seguros",
      icon: ShieldCheck,
      questions: [
        { q: "LGPD", a: "Estamos em total conformidade com a Lei Geral de Proteção de Dados." },
        { q: "Compartilhamento", a: "Não vendemos seus dados para terceiros." }
      ]
    }
  };

  const page = content[slug as string] || {
    title: "Central de Ajuda",
    subtitle: "Atendimento EntregaMais",
    icon: HelpCircle,
    questions: [{ q: "Em breve", a: "Estamos preparando mais conteúdos informativos para você." }]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-ze-yellow py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center text-ze-black hover:opacity-70 mb-8 transition-all text-sm font-black uppercase tracking-widest">
            Home <ChevronRight className="w-4 h-4 mx-1" /> Ajuda
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-ze-black rounded-2xl flex items-center justify-center shadow-2xl">
              <page.icon className="w-8 h-8 text-ze-yellow" />
            </div>
            <div>
              <Badge className="bg-ze-black text-white font-black uppercase tracking-[0.2em] mb-3">
                {page.subtitle}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-ze-black italic uppercase tracking-tighter">
                {page.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          {page.questions.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border-2 border-ze-black/5 shadow-sm hover:border-ze-yellow transition-all">
              <h3 className="text-lg font-black text-ze-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-ze-yellow flex items-center justify-center text-[10px] shrink-0">?</span>
                {item.q}
              </h3>
              <p className="text-slate-600 font-bold leading-relaxed italic border-l-4 border-ze-yellow/20 pl-4 ml-3">
                {item.a}
              </p>
            </div>
          ))}

          <div className="mt-20 p-10 bg-ze-black rounded-[3rem] text-center space-y-6">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Não resolveu sua dúvida?</h2>
            <p className="text-white/60 font-bold">Nosso time está pronto para te ajudar agora.</p>
            <Button className="bg-ze-yellow text-ze-black hover:bg-white font-black uppercase tracking-widest px-10 h-14 rounded-2xl shadow-xl transform hover:scale-105 transition-all">
              Abrir Chat de Suporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { 
  ChevronRight, 
  Info, 
  Briefcase, 
  Newspaper, 
  Handshake, 
  TrendingUp, 
  Users,
  Target,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function InstitutionalPage() {
  const { slug } = useParams();

  const content: Record<string, { 
    title: string, 
    subtitle: string, 
    icon: any, 
    sections: { title: string, body: string, icon?: any }[] 
  }> = {
    "sobre-nos": {
      title: "Sobre Nós",
      subtitle: "Nossa História",
      icon: Info,
      sections: [
        { 
          title: "Quem Somos", 
          body: "A EntregaMais nasceu com a missão de revolucionar a forma como as pessoas consomem bebidas, unindo tecnologia de ponta com a agilidade dos depósitos locais.",
          icon: Users
        },
        { 
          title: "Nossa Missão", 
          body: "Garantir que a sua bebida chegue gelada, no preço certo e no menor tempo possível, fortalecendo o comércio local.",
          icon: Target
        },
        { 
          title: "Expansão", 
          body: "Estamos presentes em mais de 100 cidades brasileiras, conectando milhares de lojistas a milhões de consumidores sedentos.",
          icon: Globe
        }
      ]
    },
    "carreiras": {
      title: "Carreiras",
      subtitle: "Trabalhe conosco",
      icon: Briefcase,
      sections: [
        { 
          title: "Cultura", 
          body: "Valorizamos a agilidade, a inovação e, claro, a celebração. Aqui, cada entrega é motivo de orgulho." 
        },
        { 
          title: "Vagas Abertas", 
          body: "Temos oportunidades em Tecnologia, Logística, Marketing e Vendas. Venha fazer parte do time que não deixa a festa parar." 
        }
      ]
    },
    "blog": {
      title: "Blog",
      subtitle: "Notícias e Dicas",
      icon: Newspaper,
      sections: [
        { 
          title: "Dicas de Mixologia", 
          body: "Aprenda a fazer os melhores drinks para o seu final de semana com produtos que você encontra no nosso app." 
        },
        { 
          title: "O Futuro da Logística", 
          body: "Como estamos usando IA para otimizar rotas e entregar sua gelada em tempo recorde." 
        }
      ]
    },
    "seja-um-parceiro": {
      title: "Parceiros",
      subtitle: "Cresça com a gente",
      icon: Handshake,
      sections: [
        { 
          title: "Vantagens", 
          body: "Aumente suas vendas em até 40% conectando seu depósito à nossa base de clientes ativa." 
        },
        { 
          title: "Tecnologia", 
          body: "Oferecemos uma plataforma completa de gestão de pedidos, estoque e logística simplificada." 
        }
      ]
    },
    "investidores": {
      title: "Investidores",
      subtitle: "Relações com Investidores",
      icon: TrendingUp,
      sections: [
        { 
          title: "Visão Geral", 
          body: "A EntregaMais é uma das startups que mais cresce no setor de quick-commerce de bebidas na América Latina." 
        },
        { 
          title: "Documentos", 
          body: "Acesse nossos relatórios trimestrais, apresentações institucionais e marcos estratégicos." 
        }
      ]
    }
  };

  const page = content[slug as string] || {
    title: "Institucional",
    subtitle: "EntregaMais",
    icon: Info,
    sections: [{ title: "Em breve", body: "Estamos preparando este conteúdo para você." }]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <div className="bg-ze-yellow py-20 md:py-32 relative overflow-hidden border-b-8 border-ze-black">
        <div className="container mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center text-ze-black hover:opacity-70 mb-8 transition-all text-sm font-black uppercase tracking-widest">
            Home <ChevronRight className="w-4 h-4 mx-1" /> Institucional
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-20 h-20 bg-ze-black rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
              <page.icon className="w-10 h-10 text-ze-yellow" />
            </div>
            <div className="space-y-2">
              <Badge className="bg-ze-black text-white font-black uppercase tracking-[0.3em] mb-2 px-4 py-1.5 rounded-xl">
                {page.subtitle}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black text-ze-black italic uppercase tracking-tighter leading-none">
                {page.title}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-ze-black/5 -skew-x-12 transform translate-x-1/4" />
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto space-y-24 md:space-y-32">
          {page.sections.map((section, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
              <div className="w-full md:w-1/3">
                <div className="flex items-center gap-4 mb-4">
                  {section.icon && (
                    <div className="w-12 h-12 rounded-2xl bg-ze-yellow flex items-center justify-center border-2 border-ze-black shrink-0">
                      <section.icon className="w-6 h-6 text-ze-black" />
                    </div>
                  )}
                  <h2 className="text-3xl md:text-4xl font-black text-ze-black uppercase italic tracking-tighter leading-none">
                    {section.title}
                  </h2>
                </div>
                <div className="h-2 w-20 bg-ze-yellow rounded-full" />
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-xl md:text-2xl font-bold text-ze-black/70 leading-relaxed italic border-l-8 border-ze-yellow pl-8">
                  {section.body}
                </p>
                <Button variant="ghost" className="mt-8 font-black uppercase text-xs tracking-widest hover:text-ze-red transition-colors group">
                  Saiba mais <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          ))}

          {/* Institutional CTA */}
          <div className="p-10 md:p-20 bg-ze-black rounded-[3rem] md:rounded-[4rem] text-center space-y-8 shadow-[20px_20px_0px_0px_rgba(255,193,7,1)] border-4 border-ze-yellow">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight">
              Vamos construir o futuro da <span className="text-ze-yellow underline decoration-white decoration-8 underline-offset-8">conveniência</span> juntos?
            </h2>
            <p className="text-white/60 font-bold text-lg md:text-xl max-w-2xl mx-auto italic">
              Seja você um investidor, parceiro ou futuro talento, a EntregaMais é o lugar onde a inovação se encontra com a celebração.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Button className="bg-ze-yellow text-ze-black hover:bg-white font-black uppercase tracking-widest px-12 h-16 rounded-2xl shadow-xl transform hover:scale-105 transition-all text-sm">
                Falar com o Time
              </Button>
              <Button variant="outline" className="border-4 border-white text-white hover:bg-white hover:text-ze-black font-black uppercase tracking-widest px-12 h-16 rounded-2xl transform hover:scale-105 transition-all text-sm">
                Nossas Próximas Metas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

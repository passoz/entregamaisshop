"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const institutionalLinks = [
    { href: "/about", label: "Sobre Nós" },
    { href: "/careers", label: "Carreiras" },
    { href: "/blog", label: "Blog" },
    { href: "/partners", label: "Seja um Parceiro" },
    { href: "/investors", label: "Investidores" },
  ];
  const helpLinks = [
    { href: "/contact", label: "Fale Conosco" },
    { href: "/faq", label: "Dúvidas Frequentes" },
    { href: "/delivery-policy", label: "Política de Entrega" },
    { href: "/terms", label: "Termos de Uso" },
    { href: "/privacy", label: "Privacidade" },
  ];
  const socialLinks = [
    { href: "https://www.instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://www.x.com", label: "X", icon: Twitter },
    { href: "https://www.facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://www.youtube.com", label: "YouTube", icon: Youtube },
  ];

  return (
    <footer className="bg-ze-black text-white pt-20 pb-10 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div className="space-y-6">
            <Logo variant="footer" />
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              A melhor e mais rápida forma de receber sua bebida gelada onde você estiver. Preço de mercado, rapidez de entrega.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-ze-yellow hover:text-ze-black transition-all group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-ze-yellow">Institucional</h4>
              <ul className="space-y-4">
                {[
                  { label: "Sobre Nós", slug: "sobre-nos" },
                  { label: "Carreiras", slug: "carreiras" },
                  { label: "Blog", slug: "blog" },
                  { label: "Seja um Parceiro", slug: "seja-um-parceiro" },
                  { label: "Investidores", slug: "investidores" }
                ].map((item) => (
                  <li key={item.slug}>
                    <Link href={`/institucional/${item.slug}`} className="text-sm font-bold text-white hover:text-ze-yellow transition-colors flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-ze-yellow">Ajuda</h4>
              <ul className="space-y-4">
                {[
                  { label: "Fale Conosco", slug: "fale-conosco" },
                  { label: "Dúvidas Frequentes", slug: "duvidas-frequentes" },
                  { label: "Política de Entrega", slug: "politica-de-entrega" },
                  { label: "Termos de Uso", slug: "termos-de-uso" },
                  { label: "Privacidade", slug: "privacidade" }
                ].map((item) => (
                  <li key={item.slug}>
                    <Link href={`/ajuda/${item.slug}`} className="text-sm font-bold text-white hover:text-ze-yellow transition-colors flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter / App Section */}
          <div className="space-y-8">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 rotate-2 hover:rotate-0 transition-transform">
              <h4 className="font-black italic text-lg uppercase tracking-tight">Receba Ofertas!</h4>
              <p className="text-xs font-bold text-white uppercase tracking-widest leading-none">Descontos exclusivos no seu e-mail</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Seu melhor e-mail" 
                  className="bg-ze-black border-white/10 text-xs rounded-xl h-10 placeholder:text-white/20 font-bold uppercase"
                />
                <Button className="bg-ze-yellow text-ze-black hover:bg-white h-10 px-4 rounded-xl shadow-lg">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-ze-yellow">Baixe o App</h4>
              <div className="flex gap-3">
                <div className="h-10 w-28 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-white">App Store</span>
                </div>
                <div className="h-10 w-28 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-white">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features / Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-white/5 mb-12">
          {[
            { icon: Truck, text: "Entrega em 25min", sub: "Média em SP" },
            { icon: ShieldCheck, text: "Compra Segura", sub: "Dados Criptografados" },
            { icon: CreditCard, text: "Pagamento In-App", sub: "Pix, Cartão e Vale" },
            { icon: MapPin, text: "Milhares de Lojas", sub: "Em todo o Brasil" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-ze-yellow/10 flex items-center justify-center group-hover:bg-ze-yellow transition-colors duration-500">
                <feature.icon className="w-6 h-6 text-ze-yellow group-hover:text-ze-black transition-colors duration-500" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-tight text-white">{feature.text}</div>
                <div className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{feature.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">
              © {currentYear} Entregamais Shop. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/ajuda/privacidade" className="text-[10px] font-black text-white/90 hover:text-ze-yellow transition-colors uppercase tracking-[0.2em]">Privacy</Link>
            <Link href="/ajuda/termos-de-uso" className="text-[10px] font-black text-white/90 hover:text-ze-yellow transition-colors uppercase tracking-[0.2em]">Terms</Link>
            <Link href="#" className="text-[10px] font-black text-white/90 hover:text-ze-yellow transition-colors uppercase tracking-[0.2em]">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ze-yellow/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-ze-red/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
    </footer>
  );
}

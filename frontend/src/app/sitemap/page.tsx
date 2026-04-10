import Link from "next/link";
import { InfoPageShell } from "@/components/layout/InfoPageShell";

const links = [
  ["/", "Home"],
  ["/search", "Buscar"],
  ["/about", "Sobre nos"],
  ["/careers", "Carreiras"],
  ["/blog", "Blog"],
  ["/partners", "Seja um parceiro"],
  ["/investors", "Investidores"],
  ["/contact", "Fale conosco"],
  ["/faq", "Duvidas frequentes"],
  ["/delivery-policy", "Politica de entrega"],
  ["/terms", "Termos de uso"],
  ["/privacy", "Privacidade"],
];

export default function SitemapPage() {
  return (
    <InfoPageShell
      eyebrow="Rodape"
      title="Sitemap"
      description="Um mapa rapido das paginas principais do Entregamais."
    >
      <section className="grid gap-3 md:grid-cols-2">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border-2 border-ze-black/10 bg-ze-gray px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-ze-black transition hover:border-ze-black hover:bg-ze-yellow hover:no-underline"
          >
            {label}
          </Link>
        ))}
      </section>
    </InfoPageShell>
  );
}

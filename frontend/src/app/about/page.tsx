import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="Institucional"
      title="Sobre nos"
      description="O Entregamais nasceu para conectar clientes, depositos e entregadores com uma experiencia simples, rapida e confiavel."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Entrega rapida", "Priorizamos operacoes locais para reduzir o tempo entre o pedido e a entrega."],
          ["Preco justo", "A proposta e aproximar o cliente do deposito mais conveniente, sem surpresas no fechamento."],
          ["Cobertura crescente", "Expandimos por cidade, respeitando a operacao de cada parceiro e a disponibilidade local."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-3xl border-2 border-ze-black/10 bg-ze-gray p-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-ze-black">{title}</h2>
            <p className="mt-3 text-sm font-bold text-ze-black/65">{text}</p>
          </article>
        ))}
      </section>
    </InfoPageShell>
  );
}

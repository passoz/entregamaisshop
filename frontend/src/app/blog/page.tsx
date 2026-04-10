import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function BlogPage() {
  return (
    <InfoPageShell
      eyebrow="Conteudo"
      title="Blog"
      description="Noticias, dicas operacionais e historias de parceiros que movem o ecossistema do Entregamais."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Como escolher o deposito ideal para cada bairro",
          "Boas praticas para entregas noturnas com mais previsibilidade",
          "O que clientes esperam de uma jornada de compra rapida",
        ].map((headline) => (
          <article key={headline} className="rounded-3xl border-2 border-ze-black/10 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Em breve</p>
            <h2 className="mt-3 text-xl font-black uppercase tracking-tight text-ze-black">{headline}</h2>
          </article>
        ))}
      </section>
    </InfoPageShell>
  );
}

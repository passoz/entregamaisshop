import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function DeliveryPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Ajuda"
      title="Politica de entrega"
      description="Transparencia sobre prazo, cobertura e comportamentos esperados durante a entrega."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Prazo", "O prazo exibido pode variar conforme distancia, demanda local e confirmacao do parceiro."],
          ["Cobertura", "A disponibilidade depende da localizacao informada e da area atendida por cada deposito."],
          ["Restricoes", "Pedidos com itens controlados seguem validacao de idade e regras locais de comercializacao."],
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

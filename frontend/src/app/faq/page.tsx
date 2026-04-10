import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow="Ajuda"
      title="Duvidas frequentes"
      description="Respostas rapidas para as perguntas mais comuns sobre entregas, localizacao e pedidos."
    >
      <section className="space-y-4">
        {[
          ["Como os depositos proximos sao encontrados?", "Usamos sua localizacao atual ou a cidade informada para ordenar os parceiros mais proximos."],
          ["O que acontece se nenhum deposito for encontrado?", "Mostramos um estado vazio e voce pode tentar outra cidade pelo seletor de localizacao."],
          ["Posso alterar minha localizacao manualmente?", "Sim. O icone ao lado de Depositos Proximos abre o modal de cidade a qualquer momento."],
        ].map(([question, answer]) => (
          <article key={question} className="rounded-3xl border-2 border-ze-black/10 bg-white p-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-ze-black">{question}</h2>
            <p className="mt-3 text-sm font-bold text-ze-black/65">{answer}</p>
          </article>
        ))}
      </section>
    </InfoPageShell>
  );
}

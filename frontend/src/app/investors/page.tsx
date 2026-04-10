import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function InvestorsPage() {
  return (
    <InfoPageShell
      eyebrow="Institucional"
      title="Investidores"
      description="Mantemos esta pagina para compartilhar a visao do negocio, frentes de crescimento e canal oficial para contato institucional."
    >
      <section className="rounded-3xl border-2 border-ze-black/10 bg-white p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-ze-black">Relacao institucional</h2>
        <p className="mt-3 text-sm font-bold text-ze-black/65">
          Consultas institucionais podem ser enviadas para
          {" "}
          <a href="mailto:investidores@entregamais.com" className="underline decoration-ze-yellow underline-offset-4">
            investidores@entregamais.com
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}

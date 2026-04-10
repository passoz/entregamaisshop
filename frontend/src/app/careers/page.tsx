import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function CareersPage() {
  return (
    <InfoPageShell
      eyebrow="Institucional"
      title="Carreiras"
      description="Buscamos pessoas que gostem de operacao, produto e experiencia real de bairro para construir o futuro do Entregamais."
    >
      <section className="rounded-3xl border-2 border-ze-black/10 bg-ze-gray p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-ze-black">Como trabalhamos</h2>
        <p className="mt-3 text-sm font-bold text-ze-black/65">
          Valorizamos autonomia, colaboracao entre times e foco em problemas concretos do cliente.
        </p>
        <p className="mt-4 text-sm font-bold text-ze-black/65">
          Para conversar com a gente sobre vagas e oportunidades, envie seu perfil para
          {" "}
          <a href="mailto:carreiras@entregamais.com" className="underline decoration-ze-yellow underline-offset-4">
            carreiras@entregamais.com
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}

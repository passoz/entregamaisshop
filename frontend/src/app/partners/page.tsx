import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function PartnersPage() {
  return (
    <InfoPageShell
      eyebrow="Institucional"
      title="Seja um parceiro"
      description="Se voce tem um deposito, conveniencia ou operacao local e quer vender mais na sua regiao, podemos conversar."
    >
      <section className="rounded-3xl border-2 border-ze-black/10 bg-ze-gray p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-ze-black">O que oferecemos</h2>
        <p className="mt-3 text-sm font-bold text-ze-black/65">
          Onboarding comercial, integracao operacional e visibilidade para clientes que realmente estao perto da sua loja.
        </p>
        <p className="mt-4 text-sm font-bold text-ze-black/65">
          Entre em contato em
          {" "}
          <a href="mailto:parcerias@entregamais.com" className="underline decoration-ze-yellow underline-offset-4">
            parcerias@entregamais.com
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}

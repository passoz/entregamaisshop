import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function ContactPage() {
  return (
    <InfoPageShell
      eyebrow="Ajuda"
      title="Fale conosco"
      description="Se precisar de suporte com pedidos, cadastro, pagamentos ou operacao, este e o nosso canal principal."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border-2 border-ze-black/10 bg-ze-gray p-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-ze-black">Suporte ao cliente</h2>
          <p className="mt-3 text-sm font-bold text-ze-black/65">contato@entregamais.com</p>
        </article>
        <article className="rounded-3xl border-2 border-ze-black/10 bg-ze-gray p-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-ze-black">WhatsApp comercial</h2>
          <p className="mt-3 text-sm font-bold text-ze-black/65">(21) 99999-0000</p>
        </article>
      </section>
    </InfoPageShell>
  );
}

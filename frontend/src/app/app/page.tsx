import { InfoPageShell } from "@/components/layout/InfoPageShell";

export default function AppDownloadPage() {
  return (
    <InfoPageShell
      eyebrow="Aplicativo"
      title="Baixe o app"
      description="Estamos preparando a experiencia mobile completa. Enquanto isso, voce pode usar a plataforma direto no navegador."
    >
      <section className="rounded-3xl border-2 border-ze-black/10 bg-ze-gray p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-ze-black">Versao mobile em breve</h2>
        <p className="mt-3 text-sm font-bold text-ze-black/65">
          Assim que as lojas forem publicadas, esta pagina sera atualizada com os links oficiais para download.
        </p>
      </section>
    </InfoPageShell>
  );
}

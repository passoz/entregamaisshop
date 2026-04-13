"use client";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function DriverProfilePage() {
  return (
    <PortalLayout title="Perfil do Entregador" role="entregador">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Minha Conta</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black italic">Meu Perfil</h1>
          <p className="mt-3 text-sm font-bold text-ze-black/60 max-w-xl">
            Dados de contato e informações do veículo. Mantenha tudo atualizado para receber as melhores rotas.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border-2 border-ze-black/5 p-6 md:p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]">
          <ProfileForm role="entregador" />
        </div>
      </div>
    </PortalLayout>
  );
}

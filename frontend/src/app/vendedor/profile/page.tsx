"use client";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function SellerProfilePage() {
  return (
    <PortalLayout title="Perfil do Lojista" role="vendedor">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Gestão de Perfil</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black italic">Informações do Lojista</h1>
          <p className="mt-3 text-sm font-bold text-ze-black/60 max-w-xl">
            Atualize seus dados pessoais e as informações do seu depósito para melhorar sua visibilidade na plataforma.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border-2 border-ze-black/5 p-6 md:p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]">
          <ProfileForm role="vendedor" />
        </div>
      </div>
    </PortalLayout>
  );
}

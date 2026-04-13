"use client";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function AdminProfilePage() {
  return (
    <PortalLayout title="Meu Perfil" role="admin">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Configurações de Conta</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black italic">Editar Perfil</h1>
          <p className="mt-3 text-sm font-bold text-ze-black/60 max-w-xl">
            Mantenha suas informações administrativas atualizadas para garantir a segurança e eficiência da plataforma.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border-2 border-ze-black/5 p-6 md:p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]">
          <ProfileForm role="admin" />
        </div>
      </div>
    </PortalLayout>
  );
}

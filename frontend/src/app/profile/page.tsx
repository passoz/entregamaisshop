"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";

export default function CustomerProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-ze-red mb-2">Minha Conta</p>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-ze-black italic drop-shadow-sm">Editar Perfil</h1>
            <div className="w-20 h-1.5 bg-ze-yellow mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="bg-white rounded-[3rem] border-4 border-ze-black p-8 md:p-12 shadow-[30px_30px_0px_0px_rgba(34,34,34,0.05)] transform hover:-rotate-1 transition-transform duration-500">
            <ProfileForm role="customer" />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-ze-yellow/10 p-6 rounded-3xl border-2 border-ze-yellow/20 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-ze-yellow rounded-2xl flex items-center justify-center text-2xl mb-4">📍</div>
              <h3 className="font-black uppercase text-sm mb-1">Meus Endereços</h3>
              <p className="text-xs font-bold text-ze-black/50">Gerencie seus locais de entrega</p>
            </div>
            <div className="bg-ze-black/5 p-6 rounded-3xl border-2 border-ze-black/5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-ze-black text-ze-yellow rounded-2xl flex items-center justify-center text-2xl mb-4">💳</div>
              <h3 className="font-black uppercase text-sm mb-1">Pagamentos</h3>
              <p className="text-xs font-bold text-ze-black/50">Cartões e métodos salvos</p>
            </div>
            <div className="bg-ze-red/5 p-6 rounded-3xl border-2 border-ze-red/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-ze-red text-white rounded-2xl flex items-center justify-center text-2xl mb-4">📦</div>
              <h3 className="font-black uppercase text-sm mb-1">Pedidos</h3>
              <p className="text-xs font-bold text-ze-black/50">Histórico de compras</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

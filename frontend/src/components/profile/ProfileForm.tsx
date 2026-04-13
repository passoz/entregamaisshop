"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface ProfileFormProps {
  role: 'admin' | 'vendedor' | 'entregador' | 'customer';
  endpoint?: string;
}

export function ProfileForm({ role, endpoint }: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const apiEndpoint = endpoint || `/api/v1/${role === 'customer' ? 'user' : role}/profile`;

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiFetch<ProfileData>(apiEndpoint);
        setProfile(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage({ type: 'error', text: 'Não foi possível carregar os dados do perfil.' });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [apiEndpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await apiFetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao salvar as alterações.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ze-yellow"></div>
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-2 border-ze-black/5">
        <p className="font-bold text-ze-black/60 uppercase text-sm tracking-widest">Nenhum dado encontrado</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Nome Completo</label>
          <Input
            name="name"
            value={profile?.name || ''}
            onChange={handleChange}
            placeholder="Seu nome"
            className="h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">E-mail</label>
          <Input
            name="email"
            type="email"
            value={profile?.email || ''}
            onChange={handleChange}
            placeholder="seu@email.com"
            className="h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4 bg-ze-gray/30"
            disabled
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Telefone</label>
          <Input
            name="phone"
            value={profile?.phone || ''}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className="h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
          />
        </div>

        {role === 'vendedor' && (
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Nome do Depósito</label>
            <Input
              name="seller_name"
              value={profile?.seller_name || ''}
              onChange={handleChange}
              placeholder="Nome da Loja"
              className="h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
            />
          </div>
        )}

        {role === 'entregador' && (
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Veículo</label>
            <Input
              name="vehicle"
              value={profile?.vehicle || ''}
              onChange={handleChange}
              placeholder="Ex: Moto, Bicicleta"
              className="h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
            />
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl font-bold text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isSaving}
          className="w-full md:w-auto px-12 h-14 rounded-2xl font-black uppercase tracking-widest bg-ze-yellow text-ze-black hover:bg-ze-yellow/90 shadow-xl shadow-ze-yellow/20 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}

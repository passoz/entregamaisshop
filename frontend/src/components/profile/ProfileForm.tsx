"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { Lock, MapPin, User as UserIcon, Phone as PhoneIcon, Mail, Shield } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  // Endereço
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  // Role specific
  seller_name?: string;
  vehicle?: string;
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        }),
      });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setMessage({ type: 'error', text: 'Erro ao alterar senha. Verifique sua senha atual.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-ze-yellow border-t-ze-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Dados Pessoais */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-ze-black text-ze-yellow rounded-xl flex items-center justify-center shadow-lg">
            <UserIcon size={20} />
          </div>
          <h3 className="text-xl font-black uppercase italic">Dados Pessoais</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Nome Completo</label>
              <Input
                name="name"
                value={profile?.name || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Telefone</label>
              <div className="relative group">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ze-black/30 group-focus-within:text-ze-yellow transition-colors" size={18} />
                <Input
                  name="phone"
                  value={profile?.phone || ''}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold pl-12 pr-4"
                />
              </div>
            </div>

            {role === 'vendedor' && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Nome do Depósito</label>
                <Input
                  name="seller_name"
                  value={profile?.seller_name || ''}
                  onChange={handleChange}
                  className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
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
                  className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
                />
              </div>
            )}
          </div>

          {/* Endereço */}
          <div className="flex items-center gap-3 mt-12 mb-6">
            <div className="w-10 h-10 bg-ze-black text-ze-yellow rounded-xl flex items-center justify-center shadow-lg">
              <MapPin size={20} />
            </div>
            <h3 className="text-xl font-black uppercase italic">Endereço</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-6">
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Rua / Logradouro</label>
              <Input
                name="street"
                value={profile?.street || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Número</label>
              <Input
                name="number"
                value={profile?.number || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Complemento</label>
              <Input
                name="complement"
                value={profile?.complement || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Bairro</label>
              <Input
                name="neighborhood"
                value={profile?.neighborhood || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Cidade</label>
              <Input
                name="city"
                value={profile?.city || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">UF</label>
              <Input
                name="state"
                value={profile?.state || ''}
                onChange={handleChange}
                maxLength={2}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4 uppercase"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">CEP</label>
              <Input
                name="zip_code"
                value={profile?.zip_code || ''}
                onChange={handleChange}
                className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="w-full md:w-auto px-12 h-14 rounded-2xl font-black uppercase tracking-widest bg-ze-yellow text-ze-black hover:bg-ze-yellow/90 shadow-xl shadow-ze-yellow/20 transition-all border-b-4 border-ze-black/20"
            >
              {isSaving ? 'Salvando...' : 'Salvar Dados'}
            </Button>
          </div>
        </form>
      </section>

      {/* Alteração de Senha */}
      <section className="pt-12 border-t-4 border-ze-black/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-ze-black text-ze-yellow rounded-xl flex items-center justify-center shadow-lg">
            <Shield size={20} />
          </div>
          <h3 className="text-xl font-black uppercase italic">Segurança e Senha</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="max-w-xl space-y-6 bg-ze-gray/20 p-8 rounded-[2rem] border-2 border-ze-black/5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Senha Atual</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ze-black/30 group-focus-within:text-ze-yellow transition-colors" size={18} />
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold pl-12 pr-4 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Nova Senha</label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4 bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ze-black/40 px-1">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="h-14 rounded-2xl border-2 border-ze-black/10 focus:border-ze-yellow transition-all font-bold px-4 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isChangingPassword}
            variant="outline"
            className="w-full md:w-auto px-12 h-14 rounded-2xl font-black uppercase tracking-widest border-2 border-ze-black text-ze-black hover:bg-ze-black hover:text-ze-yellow transition-all"
          >
            {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </form>
      </section>

      {message && (
        <div className={`p-4 rounded-2xl font-black uppercase tracking-tighter italic text-sm border-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        } fixed bottom-8 right-8 shadow-2xl z-50 animate-bounce`}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}
    </div>
  );
}

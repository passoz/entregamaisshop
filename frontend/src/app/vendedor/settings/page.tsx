"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { apiFetch } from "@/lib/api";
import type { Seller } from "@/lib/nearbySellers";
import { MapPin, Trash2, Plus, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";

interface DeliveryAreaForm {
  id: string;
  label: string;
  fee: string;
}

export default function SellerSettingsPage() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [areas, setAreas] = useState<DeliveryAreaForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await apiFetch<Seller>("/api/v1/vendedor/profile");
        setSeller(profile);
        setAreas(
          (profile.delivery_areas || []).map((area) => ({
            id: area.id,
            label: area.label,
            fee: area.fee.toFixed(2).replace(".", ","),
          })),
        );
      } catch (error) {
        showToast("Não foi possível carregar as configurações do depósito.", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [showToast]);

  function updateArea(id: string, field: "label" | "fee", value: string) {
    setAreas((current) =>
      current.map((area) => (area.id === id ? { ...area, [field]: value } : area)),
    );
  }

  function addArea() {
    setAreas((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        label: "",
        fee: "0,00",
      },
    ]);
  }

  function removeArea(id: string) {
    setAreas((current) => current.filter((area) => area.id !== id));
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      await apiFetch("/api/v1/vendedor/delivery-areas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          areas: areas
            .filter((area) => area.label.trim())
            .map((area) => ({
              label: area.label.trim(),
              fee: Number(area.fee.replace(",", ".")) || 0,
            })),
        }),
      });
      showToast("Locais atendidos e fretes atualizados com sucesso.", "success");
    } catch (error) {
      showToast("Não foi possível salvar os locais atendidos.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PortalLayout title="Configurações de Entrega" role="vendedor">
      <div className="max-w-5xl space-y-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red mb-2">Logística</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-ze-black italic">Frete e áreas atendidas</h1>
          <p className="mt-3 text-sm font-bold text-ze-black/60 max-w-2xl uppercase tracking-wide">
            Defina os locais que o seu depósito atende usando nossa busca inteligente e determine o preço do frete para cada região.
          </p>
        </div>

        {seller && (
          <Card className="border-4 border-ze-black bg-ze-yellow rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-16 h-16 bg-ze-black rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="w-8 h-8 text-ze-yellow" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-ze-black/40">Seu Depósito</p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-ze-black">{seller.name}</h2>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black uppercase italic text-ze-black">Locais Atendidos</h3>
            <Button 
              type="button" 
              onClick={addArea}
              className="bg-ze-black text-ze-yellow hover:bg-ze-yellow hover:text-ze-black border-2 border-ze-black rounded-xl font-black uppercase text-[10px] tracking-widest px-6"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Local
            </Button>
          </div>

          <div className="space-y-4">
            {areas.length === 0 ? (
              <div className="bg-white border-4 border-dashed border-ze-black/10 rounded-[3rem] p-16 text-center">
                <p className="font-black text-ze-black/20 uppercase tracking-widest italic">Nenhuma área configurada. Adicione o primeiro local acima.</p>
              </div>
            ) : (
              areas.map((area, index) => (
                <Card key={area.id} className="border-4 border-ze-black bg-white rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-[1fr_200px_auto] items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ze-black/40 px-2">Cidade / Bairro (Busca Inteligente)</label>
                        <CityAutocomplete
                          value={area.label}
                          onSelect={(val) => updateArea(area.id, "label", val)}
                          placeholder="Ex: Praia do Forte, Cabo Frio"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ze-black/40 px-2">Taxa de Entrega (R$)</label>
                        <Input
                          value={area.fee}
                          onChange={(event) => updateArea(area.id, "fee", event.target.value)}
                          placeholder="0,00"
                          className="h-14 rounded-2xl border-2 border-ze-black/10 px-4 font-black text-lg focus:border-ze-yellow transition-all"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-14 w-14 rounded-2xl text-ze-red hover:bg-red-50" 
                        onClick={() => removeArea(area.id)}
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {areas.length > 0 && (
          <div className="pt-6">
            <Button 
              type="button" 
              className="h-16 px-12 bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black rounded-[1.5rem] font-black uppercase italic tracking-widest shadow-xl transition-all flex items-center gap-3 border-4 border-ze-black" 
              onClick={handleSave} 
              disabled={isSaving || isLoading}
            >
              <Save className="w-6 h-6" />
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import type { Seller } from "@/lib/nearbySellers";

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
  const [feedback, setFeedback] = useState("");

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
        setFeedback("Nao foi possivel carregar as configuracoes do deposito.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

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
    setFeedback("");

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
      setFeedback("Locais atendidos e fretes atualizados com sucesso.");
    } catch (error) {
      setFeedback("Nao foi possivel salvar os locais atendidos.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="vendedor" currentRoute="/vendedor/settings" />
      <main className="flex-1 p-8">
        <div className="max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Configuracoes</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black">Frete e areas atendidas</h1>
          <p className="mt-3 text-sm font-bold text-ze-black/60">
            Defina os locais que o seu deposito atende e o preco de frete de cada um deles.
          </p>

          {seller && (
            <div className="mt-6 rounded-3xl border-2 border-ze-black/10 bg-white px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-black/40">Deposito</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-ze-black">{seller.name}</h2>
              <p className="mt-2 text-sm font-bold text-ze-black/60">
                Frete minimo atual: {seller.fee_label || `A partir de R$ ${(seller.min_delivery_fee ?? 0).toFixed(2).replace(".", ",")}`}
              </p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {areas.map((area, index) => (
              <div key={area.id} className="grid gap-3 rounded-3xl border-2 border-ze-black/10 bg-white p-5 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                <Input
                  value={area.label}
                  onChange={(event) => updateArea(area.id, "label", event.target.value)}
                  placeholder={`Local ${index + 1} ex: Cabo Frio`}
                  className="h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
                />
                <Input
                  value={area.fee}
                  onChange={(event) => updateArea(area.id, "fee", event.target.value)}
                  placeholder="0,00"
                  className="h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
                />
                <Button type="button" variant="outline" className="h-12 uppercase" onClick={() => removeArea(area.id)}>
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" className="uppercase" onClick={addArea}>
              Adicionar local
            </Button>
            <Button type="button" variant="ze-dark" className="uppercase" onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? "Salvando..." : "Salvar fretes"}
            </Button>
          </div>

          {feedback && <p className="mt-4 text-sm font-bold text-ze-black/70">{feedback}</p>}
        </div>
      </main>
    </div>
  );
}

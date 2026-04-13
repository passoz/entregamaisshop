"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";

type SellerProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  status: string;
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });
  const { showToast } = useToast();

  async function loadProducts() {
    try {
      const data = await apiFetch<SellerProduct[]>("/api/v1/vendedor/products");
      setProducts(data);
    } catch (error) {
      showToast("Erro ao carregar produtos", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch<SellerProduct>("/api/v1/vendedor/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
        }),
      });

      setForm({ name: "", description: "", price: "" });
      showToast("Produto cadastrado com sucesso!", "success");
      await loadProducts();
    } catch (error) {
      showToast("Erro ao cadastrar produto", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PortalLayout title="Produtos" role="vendedor">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="rounded-[2.5rem] border-2 border-ze-black/10">
          <CardContent className="p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Novo produto</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tighter text-ze-black">
                Cadastrar item
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                name="name"
                placeholder="Nome do produto"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
                required
              />
              <Input
                name="description"
                placeholder="Descrição curta"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
              />
              <Input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="15.90"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
                required
              />
              <Button
                type="submit"
                disabled={saving}
                className="h-14 w-full rounded-2xl bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black"
              >
                {saving ? "Salvando..." : "Salvar produto"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Catálogo</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tighter text-ze-black">
              Produtos cadastrados
            </h2>
          </div>

          {loading ? (
            <Card className="rounded-[2.5rem] border-2 border-dashed border-ze-black/10">
              <CardContent className="p-10 text-center font-black uppercase tracking-widest text-ze-black/40">
                Carregando catálogo...
              </CardContent>
            </Card>
          ) : products.length === 0 ? (
            <Card className="rounded-[2.5rem] border-2 border-dashed border-ze-black/10">
              <CardContent className="p-10 text-center font-black uppercase tracking-widest text-ze-black/40">
                Nenhum produto cadastrado ainda
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="rounded-[2rem] border-2 border-ze-black/10">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-ze-black">{product.name}</h3>
                    <p className="mt-2 text-sm font-bold text-ze-black/60">
                      {product.description || "Sem descrição informada."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-ze-gray text-ze-black border border-ze-black/10 font-black uppercase">
                      {product.status}
                    </Badge>
                    <span className="text-2xl font-black text-ze-red">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

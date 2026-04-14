"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { Navigation, Package, Store, User, Radar, Route } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { parseAddressLabel, type OrderTracking } from "@/lib/deliveryTracking";

type DeliveryOrder = {
  id: string;
  status: string;
  driver_id?: string;
  distance_km?: number;
  tracking?: OrderTracking;
  edges?: {
    seller?: { name?: string };
  };
  delivery_address_json?: string;
};

export default function DriverQueue() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const data = await apiFetch<DeliveryOrder[]>("/api/v1/entregador/orders");
      setDeliveries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: "accept" | "pickup" | "deliver") => {
    try {
      const endpoint =
        action === "accept"
          ? `/api/v1/entregador/orders/${id}/accept`
          : action === "pickup"
            ? `/api/v1/entregador/orders/${id}/pickup`
            : `/api/v1/entregador/orders/${id}/deliver`;

      await apiFetch(endpoint, { method: "POST" });
      fetchDeliveries();
    } catch (error) {
      console.error(error);
    }
  };

  const available = deliveries.filter((delivery) => delivery.status === "ready" && !delivery.driver_id);
  const active = deliveries.filter((delivery) => ["accepted", "dispatched", "picked_up"].includes(delivery.status));

  return (
    <PortalLayout title="Logística de Entrega" role="entregador">
      <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-3">
                  <Radar className="w-7 h-7 text-ze-red" />
                  Chamadas Próximas
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-ze-black/35 mt-2">
                  pedidos liberados para coleta perto da sua posição
                </p>
              </div>
              <Badge className="bg-ze-yellow text-ze-black font-black rounded-xl">{available.length}</Badge>
            </div>

            <div className="space-y-6">
              {available.map((delivery) => (
                <article
                  key={delivery.id}
                  className="bg-white rounded-[2.5rem] border-4 border-ze-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-ze-black/35">Pedido disponível</p>
                      <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter mt-2">
                        {delivery.edges?.seller?.name || "Depósito parceiro"}
                      </h3>
                    </div>
                    <Badge className="bg-ze-black text-white font-black rounded-xl">
                      {delivery.distance_km != null ? `${delivery.distance_km.toFixed(1)} km` : "na sua área"}
                    </Badge>
                  </div>

                  <LeafletMap
                    className="h-[260px]"
                    pickup={delivery.tracking?.pickup_location || undefined}
                    delivery={delivery.tracking?.delivery_location || undefined}
                    route={delivery.tracking?.route || []}
                    stage={delivery.tracking?.stage}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-ze-gray rounded-[1.75rem] border-2 border-ze-black/5 p-4">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-ze-black" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/35">Coleta</p>
                          <p className="font-black text-ze-black uppercase tracking-tight">
                            {delivery.tracking?.pickup_location?.label || delivery.edges?.seller?.name || "Depósito"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-ze-gray rounded-[1.75rem] border-2 border-ze-black/5 p-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-ze-red" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/35">Entrega</p>
                          <p className="font-black text-ze-black uppercase tracking-tight">
                            {parseAddressLabel(delivery.delivery_address_json)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAction(delivery.id, "accept")}
                    className="w-full h-14 bg-ze-yellow text-ze-black hover:bg-ze-black hover:text-white font-black uppercase italic tracking-widest rounded-2xl border-4 border-ze-black"
                  >
                    Aceitar Corrida
                  </Button>
                </article>
              ))}

              {!loading && available.length === 0 && (
                <div className="bg-ze-gray text-center p-16 rounded-[3rem] border-4 border-dashed border-ze-black/10">
                  <p className="font-black text-ze-black/30 uppercase tracking-widest italic">Nenhuma chamada próxima agora</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-3">
                <Route className="w-7 h-7 text-ze-red" />
                Minha Rota Atual
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-ze-black/35 mt-2">
                a rota muda automaticamente entre coleta e entrega
              </p>
            </div>

            <div className="space-y-6">
              {active.map((delivery) => {
                const stage = delivery.tracking?.stage;
                const goingToPickup = stage === "to_pickup";
                const action = goingToPickup ? "pickup" : "deliver";

                return (
                  <article
                    key={delivery.id}
                    className="bg-ze-yellow rounded-[2.5rem] border-4 border-ze-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-ze-black/45">Rota ativa</p>
                        <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter mt-2">
                          {goingToPickup ? "Indo buscar encomenda" : "Saiu para entrega"}
                        </h3>
                      </div>
                      <Badge className="bg-ze-black text-white font-black rounded-xl">
                        #{delivery.id.slice(0, 6)}
                      </Badge>
                    </div>

                    <LeafletMap
                      className="h-[320px]"
                      driver={delivery.tracking?.driver_location || undefined}
                      pickup={delivery.tracking?.pickup_location || undefined}
                      delivery={delivery.tracking?.delivery_location || undefined}
                      route={delivery.tracking?.route || []}
                      stage={delivery.tracking?.stage}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-[1.75rem] border-2 border-ze-black p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/35">Coleta</p>
                        <p className="font-black text-ze-black uppercase tracking-tight mt-2">
                          {delivery.tracking?.pickup_location?.label || delivery.edges?.seller?.name || "Depósito"}
                        </p>
                      </div>
                      <div className="bg-white rounded-[1.75rem] border-2 border-ze-black p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/35">Destino</p>
                        <p className="font-black text-ze-black uppercase tracking-tight mt-2">
                          {parseAddressLabel(delivery.delivery_address_json)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAction(delivery.id, action)}
                      className={`w-full h-16 rounded-2xl text-lg font-black uppercase italic tracking-tighter border-4 border-ze-black ${
                        goingToPickup
                          ? "bg-ze-black text-white hover:bg-white hover:text-ze-black"
                          : "bg-ze-red text-white hover:bg-ze-black"
                      }`}
                    >
                      {goingToPickup ? (
                        <>
                          <Package className="w-6 h-6 mr-3" />
                          Confirmar retirada
                        </>
                      ) : (
                        <>
                          <Navigation className="w-6 h-6 mr-3" />
                          Confirmar entrega
                        </>
                      )}
                    </Button>
                  </article>
                );
              })}

              {!loading && active.length === 0 && (
                <div className="bg-white text-center p-16 rounded-[3rem] border-4 border-dashed border-ze-black/10">
                  <p className="font-black text-ze-black/30 uppercase tracking-widest italic">Nenhuma rota ativa no momento</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}

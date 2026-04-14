"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { parseAddressLabel } from "@/lib/deliveryTracking";
import { 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Printer,
  BellRing,
  Truck,
  Send,
  GripVertical,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

type OrderStatus = 'created' | 'confirmed' | 'preparing' | 'ready' | 'accepted' | 'dispatched' | 'picked_up' | 'delivered';

interface KanbanColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  statuses: OrderStatus[];
  color: string;
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);
  const { showToast } = useToast();

  const columns: KanbanColumn[] = [
    { id: 'new', title: 'Novos', icon: <BellRing className="w-6 h-6 text-ze-red animate-bounce" />, statuses: ['created'], color: 'bg-ze-red' },
    { id: 'prep', title: 'Em Preparo', icon: <Clock className="w-6 h-6 text-ze-yellow" />, statuses: ['confirmed', 'preparing'], color: 'bg-ze-yellow' },
    { id: 'logistics', title: 'Logística', icon: <Truck className="w-6 h-6 text-ze-black" />, statuses: ['ready', 'accepted'], color: 'bg-ze-black' },
    { id: 'route', title: 'Em Rota', icon: <Send className="w-6 h-6 text-ze-red" />, statuses: ['dispatched', 'picked_up'], color: 'bg-ze-red' },
  ];

  const fetchOrders = async () => {
    try {
      const data = await apiFetch<any[]>('/api/v1/vendedor/orders'); 
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const int = setInterval(fetchOrders, 5000);
    return () => clearInterval(int);
  }, []);

  const moveOrder = async (orderId: string, targetColumnId: string) => {
    let nextStatus: OrderStatus;
    
    switch (targetColumnId) {
      case 'new': nextStatus = 'created'; break;
      case 'prep': nextStatus = 'confirmed'; break;
      case 'logistics': nextStatus = 'ready'; break;
      case 'route': nextStatus = 'dispatched'; break;
      default: return;
    }

    try {
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      
      const actionMap: Record<string, string> = {
        'confirmed': 'confirm',
        'ready': 'ready',
        'dispatched': 'dispatch'
      };

      const action = actionMap[nextStatus];
      if (action) {
        await apiFetch(`/api/v1/vendedor/orders/${orderId}/${action}`, { method: "POST" });
        showToast(`Pedido movido para ${nextStatus}`, "success");
      }
    } catch (err) {
      showToast("Erro ao mover pedido", "error");
      fetchOrders();
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggingOrderId(orderId);
    e.dataTransfer.setData("orderId", orderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    setDraggingOrderId(null);
    moveOrder(orderId, columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const renderOrderCard = (order: any) => (
    <div 
      key={order.id} 
      draggable
      onDragStart={(e) => handleDragStart(e, order.id)}
      className={`bg-white border-2 border-ze-black rounded-[2rem] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all mb-4 cursor-grab active:cursor-grabbing group relative overflow-hidden ${draggingOrderId === order.id ? 'opacity-40 grayscale scale-95' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-ze-gray rounded-md text-ze-black/20 group-hover:text-ze-black transition-colors">
            <GripVertical size={14} />
          </div>
          <h3 className="font-black text-ze-black text-lg uppercase italic tracking-tighter">#{order.id.split('-')[0]}</h3>
        </div>
        <Badge className="bg-ze-gray text-ze-black/40 text-[8px] font-black uppercase">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-3 h-3 text-ze-red shrink-0 mt-0.5" />
          <p className="text-[10px] font-black text-ze-black leading-tight uppercase truncate">
            {parseAddressLabel(order.delivery_address_json)}
          </p>
        </div>
        
        <div className="bg-ze-gray/30 rounded-xl p-3 space-y-1">
          {order.edges?.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-ze-black uppercase truncate pr-2">{item.quantity}x {item.edges?.product?.name || "Item"}</span>
              <span className="text-ze-black/40 shrink-0">R$ {item.unit_price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t-2 border-ze-black/5 flex items-center justify-between">
        <p className="font-black text-lg text-ze-black tracking-tighter italic">R$ {order.total_amount.toFixed(2)}</p>
        <div className="flex gap-1">
           <button className="p-2 hover:bg-ze-gray rounded-lg transition-colors text-ze-black/20 hover:text-ze-black"><Printer size={12} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <PortalLayout title="Gestão de Pedidos (Kanban)" role="vendedor">
      <div className="flex gap-6 h-[calc(100vh-180px)] min-w-[1200px] overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="flex flex-col w-80 shrink-0 h-full space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-white border-4 border-ze-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2">
                {col.icon}
                <h2 className="text-sm font-black text-ze-black uppercase italic tracking-widest">{col.title}</h2>
              </div>
              <Badge className={`${col.color} text-white font-black rounded-lg border-2 border-ze-black`}>
                {orders.filter(o => col.statuses.includes(o.status)).length}
              </Badge>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar rounded-[2rem] p-2 transition-colors ${draggingOrderId ? 'bg-ze-yellow/5 border-4 border-dashed border-ze-black/10' : ''}`}>
              {orders.filter(o => col.statuses.includes(o.status)).map(o => renderOrderCard(o))}
              
              {orders.filter(o => col.statuses.includes(o.status)).length === 0 && (
                <div className="h-32 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/10 font-black uppercase tracking-widest text-[10px] text-center p-6 italic">
                  Solte aqui para mover
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}

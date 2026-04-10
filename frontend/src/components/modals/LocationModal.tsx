"use client";

import { useState, useEffect } from "react";
import { CityAutocomplete } from "../ui/CityAutocomplete";
import { Button } from "../ui/Button";
import { MapPin, X, Navigation, CheckCircle2 } from "lucide-react";
import { findClosestNeighborhood } from "@/lib/nearbySellers";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string, coords?: { lat: number; lng: number }) => void;
}

export function LocationModal({ isOpen, onClose, onSelect }: LocationModalProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsAnimating(true);
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation, selectedCoords);
      onClose();
    }
  };

  const handleCurrentLocation = async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        try {
          const res = await fetch("/data/neighborhoods.json");
          const neighborhoods = await res.json();
          const name = findClosestNeighborhood(lat, lng, neighborhoods);
          onSelect(name || "Sua localização", { lat, lng });
        } catch (e) {
          onSelect("Sua localização atual", { lat, lng });
        }
        
        onClose();
      },
      (error) => {
        console.error("Erro na geolocalização:", error);
        alert("Não foi possível obter sua localização. Por favor, verifique as permissões do seu navegador.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ze-black/60 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 delay-75 ${isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}>
        
        {/* Header decoration */}
        <div className="bg-ze-yellow p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="w-16 h-16 bg-ze-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-ze-black/10">
            <MapPin className="w-8 h-8 text-ze-yellow" />
          </div>
          <h2 className="text-3xl font-black text-ze-black uppercase italic tracking-tighter leading-none">Onde você está?</h2>
          <p className="text-ze-black/60 text-xs font-bold uppercase tracking-widest mt-2">Encontraremos as lojas mais próximas</p>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-ze-black/5 hover:bg-ze-black/10 transition-colors"
          >
            <X className="w-5 h-5 text-ze-black" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/40 px-2">Sua Localização</label>
            <CityAutocomplete 
              onSelect={(val, coords) => {
                setSelectedLocation(val);
                setSelectedCoords(coords);
              }} 
              placeholder="Ex: Praia do Forte, Cabo Frio" 
            />
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleCurrentLocation}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-ze-gray border border-ze-black/5 group cursor-pointer hover:border-ze-yellow transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-ze-yellow transition-colors">
                <Navigation className="w-5 h-5 text-ze-black" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-black uppercase text-ze-black">Usar localização atual</div>
                <div className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">Precisão máxima</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-ze-black/10 group-hover:text-ze-black transition-colors" />
            </button>
          </div>

          <Button 
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="w-full h-16 rounded-2xl bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black text-sm font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-30 disabled:hover:bg-ze-black disabled:hover:text-white transition-all transform active:scale-95"
          >
            Confirmar Localização
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "./Input";
import { MapPin, Search, X, Loader2 } from "lucide-react";

interface NeighborhoodData {
  bairro: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
}

interface CityAutocompleteProps {
  onSelect: (location: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  initialValue?: string;
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function CityAutocomplete({ onSelect, placeholder, initialValue = "" }: CityAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [allData, setAllData] = useState<[string, string, string, number, number][]>([]);
  const [suggestions, setSuggestions] = useState<NeighborhoodData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  const loadData = async () => {
    if (hasLoadedRef.current) return;
    setIsLoading(true);
    try {
      const res = await fetch("/data/neighborhoods.json");
      const data = await res.json();
      setAllData(data);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Erro ao carregar bairros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query.length > 2 && isOpen && allData.length > 0) {
      const tokens = normalize(query).split(/\s+/).filter(t => t.length > 0);
      const filtered: NeighborhoodData[] = [];
      
      for (let i = 0; i < allData.length; i++) {
        const [b, c, u, lat, lng] = allData[i];
        const combined = normalize(`${b} ${c} ${u}`);
        
        // Every token must be present in the combined string
        const matches = tokens.every(token => combined.includes(token));
        
        if (matches) {
          filtered.push({ bairro: b, cidade: c, uf: u, lat, lng });
          if (filtered.length >= 8) break; // Limit suggestions
        }
      }
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, isOpen, allData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: NeighborhoodData) => {
    const value = `${item.bairro}, ${item.cidade} - ${item.uf}`;
    setQuery(value);
    setIsOpen(false);
    onSelect(value, { lat: item.lat, lng: item.lng });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            loadData();
          }}
          onFocus={() => {
            setIsOpen(true);
            loadData();
          }}
          className="pl-12 h-14 bg-ze-gray border-ze-black/5 rounded-2xl font-black uppercase tracking-widest placeholder:text-ze-black/20 focus:border-ze-yellow transition-all"
          placeholder={placeholder || "Bairro, Cidade ou UF"}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-ze-black/20 animate-spin" />
          ) : (
            <MapPin className="w-6 h-6 text-ze-black/20" />
          )}
        </div>
        {query && (
          <button 
            onClick={() => { setQuery(""); onSelect(""); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-ze-black/40" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-ze-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-ze-yellow/5 text-left border-b border-ze-black/5 last:border-0 group transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-ze-gray flex items-center justify-center group-hover:bg-ze-yellow transition-colors">
                <Search className="w-4 h-4 text-ze-black/40 group-hover:text-ze-black" />
              </div>
              <div className="flex-1">
                <div className="font-black text-ze-black uppercase tracking-tight line-clamp-1">{item.bairro}</div>
                <div className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest truncate">
                  {item.cidade} - {item.uf}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

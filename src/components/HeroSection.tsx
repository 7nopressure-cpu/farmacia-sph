'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Sparkles, 
  ChevronDown, 
  ArrowRight, 
  Pill, 
  Check, 
  ExternalLink,
  X
} from 'lucide-react';
import { Medicamento } from '../lib/types';
import { slugify, DRUG_CATEGORIES, normalizeText } from '../lib/medicationsHelper';

interface HeroSectionProps {
  onStartTriage: (initialSymptom?: string) => void;
  onExploreVademecum: () => void;
  onSelectCategory?: (category: string) => void;
  medicamentos?: Medicamento[];
}

export default function HeroSection({ 
  onStartTriage, 
  onExploreVademecum,
  onSelectCategory,
  medicamentos = []
}: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Medicamento[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute suggestions when user types in search bar
  useEffect(() => {
    if (!query.trim() || medicamentos.length === 0) {
      setSuggestions([]);
      return;
    }

    const cleanQ = normalizeText(query.trim());
    const matches: Medicamento[] = [];
    const seenDci = new Set<string>();

    for (const m of medicamentos) {
      const nom = normalizeText(m.nombre_comercial);
      const dci = normalizeText(m.dci_principio_activo);
      if (nom.includes(cleanQ) || (dci.includes(cleanQ) && dci !== '-')) {
        const key = `${m.dci_principio_activo}_${m.nombre_comercial}`;
        if (!seenDci.has(key)) {
          seenDci.add(key);
          matches.push(m);
          if (matches.length >= 6) break;
        }
      }
    }
    setSuggestions(matches);
  }, [query, medicamentos]);

  // Open medication in new window
  const openMedicationWindow = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const targetSlug = slugify(searchTerm.trim());
    window.open(`/medicamento/${encodeURIComponent(targetSlug)}`, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSuggestions([]);
      openMedicationWindow(query);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    const vademecumEl = document.getElementById('vademecum-section');
    if (vademecumEl) {
      vademecumEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0B2B64] text-white py-14 sm:py-20">
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero-banner.jpg"
          alt="TUFARMACIA Fondo"
          fill
          priority
          className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2B64]/95 via-[#0B2B64]/90 to-[#003876]/95" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* 1. BARRA BUSCADORA PROMINENTE */}
        <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto mb-4">
          <div className="relative flex items-center shadow-2xl rounded-full">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A3E0]" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="busca tu medicamento por nombre comercial o generico"
              className="w-full pl-12 sm:pl-14 pr-28 sm:pr-32 py-3.5 sm:py-4 bg-white text-gray-900 placeholder-gray-400 text-xs sm:text-base font-medium rounded-full shadow-lg border-2 border-transparent focus:border-[#00A3E0] focus:outline-none transition-all"
            />

            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); }}
                className="absolute right-24 sm:right-28 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => openMedicationWindow(query)}
              className="absolute right-1.5 sm:right-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#0B2B64] hover:bg-[#003876] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
            >
              <span>Buscar</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          </div>

          {/* Autocomplete Predictive Dropdown Results */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 text-left z-50 overflow-hidden divide-y divide-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Resultados rápidos (Pulsa Enter o clic para abrir)</span>
                <span className="text-[#00A3E0]">Nueva Ventana</span>
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const searchTarget = item.dci_principio_activo !== '-' ? item.dci_principio_activo : item.nombre_comercial;
                    openMedicationWindow(searchTarget);
                  }}
                  className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-extrabold text-sm text-gray-900 group-hover:text-[#0B2B64] block truncate">
                      {item.nombre_comercial}
                    </span>
                    <span className="text-xs text-[#00A3E0] font-semibold block truncate">
                      Principio Activo: {item.dci_principio_activo}
                    </span>
                    <span className="text-[11px] text-gray-400 block truncate">
                      {item.laboratorio} • {item.forma_farmaceutica}
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 text-right">
                    <span className="text-xs font-bold text-[#0B2B64]">
                      Bs {item.precio_referencial_bs.toFixed(2)}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#00A3E0]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. MENÚ DESPLEGABLE CON LAS 11 CATEGORÍAS DE FÁRMACOS */}
        <div ref={dropdownRef} className="relative inline-block text-left mb-8 z-30">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center justify-between gap-2.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-sm"
          >
            <Pill className="w-4 h-4 text-cyan-300" />
            <span>
              {selectedCategory ? `Categoría: ${selectedCategory}` : 'Selecciona una de las 11 categorías de fármacos'}
            </span>
            <ChevronDown className={`w-4 h-4 text-cyan-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable (Dropdown) con las 11 categorías de la nueva base de datos */}
          {isDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 text-gray-800 text-left divide-y divide-gray-100 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                11 Categorías - Catálogo Nacional Bolivia
              </div>
              {DRUG_CATEGORIES.map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#0B2B64] font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#0B2B64]'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#00A3E0]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. TEXTOS EXACTOS DEBAJO DE LA BARRA BUSCADORA */}
        <div className="space-y-3 max-w-2xl mx-auto">
          {/* Supertítulo / Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Consultor Médico</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Lista Nacional de Medicamentos & Consultor Médico con IA
          </h1>

          {/* Párrafo Descriptivo */}
          <p className="text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed">
            Accede a las caracteristicas de más de 5,400 medicamentos autorizados por AGEMED en Bolivia y realiza tu orientación de triaje clínico inteligente 24/7.
          </p>

          {/* Botón de Acción Principal para el Triaje IA */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onStartTriage()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00A3E0] to-cyan-400 hover:from-cyan-400 hover:to-[#00A3E0] text-[#0B2B64] font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#0B2B64]" />
              <span>Orientación de Triaje Clínico con IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreVademecum}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
            >
              <Pill className="w-4 h-4 text-cyan-300" />
              <span>Ver Lista de Medicamentos</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

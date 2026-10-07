'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Sparkles, 
  ChevronDown, 
  ArrowRight, 
  Pill, 
  Check, 
  ExternalLink,
  X,
  ShieldCheck,
  TrendingDown,
  Building2,
  Stethoscope
} from 'lucide-react';
import { Medicamento } from '../lib/types';
import { slugify, DRUG_CATEGORIES, normalizeText } from '../lib/medicationsHelper';

interface HeroSectionProps {
  onStartTriage: (initialSymptom?: string) => void;
  onExploreHospitals?: () => void;
  medicamentos?: Medicamento[];
}

export default function HeroSection({ 
  onStartTriage, 
  onExploreHospitals,
  medicamentos = []
}: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Medicamento[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown or suggestions when clicking outside
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

  // Compute predictive suggestions when typing
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
  };

  // Get items for the active category (or featured items if none selected)
  const categoryMedications = useMemo(() => {
    if (medicamentos.length === 0) return [];
    if (!selectedCategory) {
      // Return representative featured items across categories
      const featuredTerms = ['paracetamol', 'ibuprofeno', 'azitromicina', 'omeprazol', 'losartan', 'mentisan'];
      return medicamentos.filter(m => 
        featuredTerms.some(t => normalizeText(m.nombre_comercial).includes(t) || normalizeText(m.dci_principio_activo).includes(t))
      ).slice(0, 8);
    }

    const cleanCat = normalizeText(selectedCategory);
    return medicamentos.filter(m => 
      normalizeText(m.categoria_clasificacion || '').includes(cleanCat) ||
      normalizeText(m.grupo_terapeutico || '').includes(cleanCat) ||
      normalizeText(m.accion_terapeutica || '').includes(cleanCat)
    ).slice(0, 12);
  }, [selectedCategory, medicamentos]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2B64] via-[#092250] to-[#003876] text-white pt-10 pb-16 sm:py-16 shadow-inner">
      {/* Background Graphic Banner */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero-banner.jpg"
          alt="TUFARMACIA Fondo"
          fill
          priority
          className="object-cover object-center opacity-20 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2B64]/95 via-[#092250]/90 to-[#003876]/95" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* 1. SECCIÓN PRINCIPAL DE TEXTOS DEL CONSULTOR MÉDICO */}
        <div className="space-y-3 max-w-3xl mx-auto mb-8">
          
          {/* Badge: Consultor Médico */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Consultor Médico</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Lista Nacional de Medicamentos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-[#00A3E0]">
              & Consultor Médico con IA
            </span>
          </h1>

          {/* Párrafo Descriptivo */}
          <p className="text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Accede a las caracteristicas de más de 5,400 medicamentos autorizados por AGEMED en Bolivia y realiza tu orientación de triaje clínico inteligente 24/7.
          </p>
        </div>

        {/* 2. BARRA BUSCADORA CENTRAL PROMINENTE (UNIFICADA) */}
        <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto mb-5">
          <div className="relative flex items-center shadow-2xl rounded-full bg-white p-1 border-2 border-white/30 focus-within:border-[#00A3E0] transition-all">
            <div className="pl-4 sm:pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A3E0]" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="busca tu medicamento por nombre comercial o generico"
              className="w-full pl-3 pr-24 sm:pr-32 py-3 sm:py-3.5 bg-transparent text-gray-900 placeholder-gray-400 text-xs sm:text-base font-medium rounded-full focus:outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); }}
                className="absolute right-24 sm:right-28 text-gray-400 hover:text-gray-600 p-1"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => openMedicationWindow(query)}
              className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#0B2B64] hover:bg-[#003876] text-white font-black text-xs sm:text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Buscar</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          </div>

          {/* Autocomplete Predictive Dropdown Results */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 text-left z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Resultados directos (Pulsa Enter para abrir)</span>
                <span className="text-[#00A3E0] flex items-center gap-1">
                  <span>Nueva Ventana</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const searchTarget = item.dci_principio_activo !== '-' ? item.dci_principio_activo : item.nombre_comercial;
                    openMedicationWindow(searchTarget);
                  }}
                  className="px-4 py-3 hover:bg-cyan-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-black text-sm text-gray-900 group-hover:text-[#0B2B64] block truncate">
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

        {/* 3. MENÚ DESPLEGABLE CON LAS 11 CATEGORÍAS DE FÁRMACOS */}
        <div ref={dropdownRef} className="relative inline-block text-left mb-6 z-30">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center justify-between gap-3 px-6 py-3 rounded-2xl bg-white text-gray-800 hover:bg-gray-50 shadow-xl border border-gray-200 text-xs sm:text-sm font-bold transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#00A3E0] group-hover:rotate-12 transition-transform" />
              <span>
                {selectedCategory ? `Categoría: ${selectedCategory}` : 'Selecciona una de las 11 categorías de fármacos'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable (Dropdown) con las 11 categorías idéntico al requerimiento visual */}
          {isDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1.5 z-50 text-gray-900 text-left divide-y divide-gray-100 max-h-96 overflow-y-auto">
              <div className="px-4 py-2.5 bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>11 Categorías de la Base de Datos</span>
                {selectedCategory && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory(''); }}
                    className="text-xs text-[#00A3E0] hover:underline normal-case font-semibold"
                  >
                    Ver todas
                  </button>
                )}
              </div>
              {DRUG_CATEGORIES.map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full px-4 py-3 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors border-b border-gray-100 last:border-b-0 ${
                      isSelected
                        ? 'bg-blue-50 text-[#0B2B64] font-black'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-[#0B2B64]'
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

        {/* 4. BOTONES DE ACCIÓN RÁPIDA (Triaje IA y Hospitales) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => onStartTriage()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00A3E0] via-cyan-400 to-[#00A3E0] hover:shadow-lg hover:shadow-cyan-500/30 text-[#0B2B64] font-black text-xs sm:text-sm active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#0B2B64]" />
            <span>Iniciar Orientación de Triaje Clínico con IA</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onExploreHospitals && (
            <button
              onClick={onExploreHospitals}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
            >
              <Building2 className="w-4 h-4 text-cyan-300" />
              <span>Hospitales La Paz y El Alto</span>
            </button>
          )}
        </div>

        {/* 5. SELECCIÓN DE FÁRMACOS DESTACADOS O DE LA CATEGORÍA ACTIVA */}
        {categoryMedications.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/15 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  {selectedCategory 
                    ? `Fármacos autorizados en: ${selectedCategory}` 
                    : 'Medicamentos y Principios Activos Frecuentes en Bolivia'}
                </h3>
              </div>
              <span className="text-[11px] text-cyan-200">
                Clic para abrir en nueva ventana
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryMedications.map((med) => {
                const targetSlug = slugify(med.dci_principio_activo !== '-' ? med.dci_principio_activo : med.nombre_comercial);
                return (
                  <a
                    key={med.id}
                    href={`/medicamento/${encodeURIComponent(targetSlug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/95 hover:bg-white rounded-2xl p-3.5 text-gray-800 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group border border-white"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          med.es_venta_libre ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {med.es_venta_libre ? 'Venta Libre' : 'Bajo Receta'}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#00A3E0]" />
                      </div>

                      <h4 className="font-black text-sm text-gray-900 group-hover:text-[#0B2B64] transition-colors truncate">
                        {med.nombre_comercial}
                      </h4>

                      <p className="text-xs text-[#00A3E0] font-semibold truncate">
                        {med.dci_principio_activo}
                      </p>

                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {med.laboratorio}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#0B2B64]">
                      <span>Bs {med.precio_referencial_bs.toFixed(2)}</span>
                      <span className="text-[11px] text-[#00A3E0] group-hover:underline">Ver Ficha B-L →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

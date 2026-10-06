'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  TrendingDown, 
  Pill, 
  Building, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { Medicamento } from '../lib/types';
import { slugify } from '../lib/medicationsHelper';

interface VademecumSectionProps {
  medicamentos: Medicamento[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onOpenSavingsComparator: (med: Medicamento) => void;
}

export default function VademecumSection({
  medicamentos,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onOpenSavingsComparator
}: VademecumSectionProps) {
  const [filterCondicion, setFilterCondicion] = useState<'all' | 'otc' | 'receta'>('all');
  const [filterLab, setFilterLab] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(36);
  }, [searchQuery, filterCondicion, selectedCategory, filterLab]);

  // Extract unique prominent laboratories for filter dropdown
  const laboratories = useMemo(() => {
    const counts: Record<string, number> = {};
    medicamentos.forEach(m => {
      if (m.laboratorio && m.laboratorio !== '-') {
        counts[m.laboratorio] = (counts[m.laboratorio] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([lab]) => lab);
  }, [medicamentos]);

  // Normalization helper
  const normalize = (str: string) =>
    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtered dataset
  const filteredMedicamentos = useMemo(() => {
    let list = medicamentos;

    // Search query
    if (searchQuery.trim()) {
      const q = normalize(searchQuery.trim());
      list = list.filter(m => {
        const nom = normalize(m.nombre_comercial);
        const dci = normalize(m.dci_principio_activo);
        const accion = normalize(m.grupo_terapeutico);
        const lab = normalize(m.laboratorio);
        const ind = normalize(m.indicaciones_principales);
        return nom.includes(q) || dci.includes(q) || lab.includes(q) || accion.includes(q) || ind.includes(q);
      });
    }

    // Condition filter
    if (filterCondicion === 'otc') {
      list = list.filter(m => m.es_venta_libre);
    } else if (filterCondicion === 'receta') {
      list = list.filter(m => !m.es_venta_libre);
    }

    // Category filter from top Navbar or dropdown
    if (selectedCategory && selectedCategory !== 'todos' && selectedCategory !== 'hospitales') {
      if (selectedCategory === 'otc') {
        list = list.filter(m => m.es_venta_libre);
      } else {
        const catClean = normalize(selectedCategory);
        list = list.filter(m => 
          normalize(m.categoria_clasificacion || '').includes(catClean) ||
          normalize(m.grupo_terapeutico || '').includes(catClean) ||
          normalize(m.accion_terapeutica || '').includes(catClean)
        );
      }
    }

    // Laboratory filter
    if (filterLab !== 'all') {
      list = list.filter(m => (m.laboratorio || '').toLowerCase() === filterLab.toLowerCase());
    }

    return list;
  }, [medicamentos, searchQuery, filterCondicion, selectedCategory, filterLab]);

  const visibleList = filteredMedicamentos.slice(0, visibleCount);

  return (
    <section id="vademecum-section" className="py-12 bg-[#F4F6F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#0B2B64] font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Vademécum Oficial del Estado Plurinacional de Bolivia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2B64] tracking-tight">
              Catálogo Nacional de Medicamentos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Registro sanitario oficial AGEMED de <strong>5.471 fármacos</strong> con precios referenciales y bioequivalentes genéricos.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs">
            <span>Resultados:</span>
            <strong className="text-[#0B2B64] font-black text-sm">{filteredMedicamentos.length.toLocaleString()}</strong>
            <span>de {medicamentos.length.toLocaleString() || '5.471'}</span>
          </div>
        </div>

        {/* Filter Toolbar (Farmacorp Style) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 mb-8 flex flex-wrap items-center justify-between gap-4">
          
          {/* Condition toggle buttons (All vs OTC vs Rx) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase mr-1">Condición:</span>
            <button
              onClick={() => setFilterCondicion('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterCondicion === 'all'
                  ? 'bg-[#0B2B64] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({medicamentos.length || 5472})
            </button>
            <button
              onClick={() => setFilterCondicion('otc')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                filterCondicion === 'otc'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Venta Libre (OTC)</span>
            </button>
            <button
              onClick={() => setFilterCondicion('receta')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterCondicion === 'receta'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bajo Receta Médica
            </button>
          </div>

          {/* Laboratory selector */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase">Laboratorio:</span>
            <select
              value={filterLab}
              onChange={(e) => setFilterLab(e.target.value)}
              className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00A3E0] text-gray-800"
            >
              <option value="all">Todos los Laboratorios</option>
              {laboratories.map((lab) => (
                <option key={lab} value={lab}>
                  {lab}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Medication Cards Grid (Farmacorp E-Commerce Retail Style) */}
        {filteredMedicamentos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">
              No se encontraron medicamentos con esos filtros
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Intenta buscar por el nombre genérico del principio activo (ej: Paracetamol, Ibuprofeno, Amoxicilina, Omeprazol) o restablece los filtros.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                setFilterCondicion('all');
                setFilterLab('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-[#0B2B64] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              Limpiar búsqueda y filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {visibleList.map((med) => {
              const isGeneric = (med.laboratorio || '').toLowerCase().includes('ifa') || 
                                (med.laboratorio || '').toLowerCase().includes('cofar') ||
                                (med.laboratorio || '').toLowerCase().includes('delta') ||
                                (med.laboratorio || '').toLowerCase().includes('genérico');

              const targetSlug = slugify(med.dci_principio_activo !== '-' ? med.dci_principio_activo : med.nombre_comercial);
              const medPageUrl = `/medicamento/${encodeURIComponent(targetSlug)}`;

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#00A3E0] shadow-card hover:shadow-card-hover transition-all duration-200 p-4 flex flex-col justify-between group"
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide ${
                          med.es_venta_libre
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {med.es_venta_libre ? 'Venta Libre (OTC)' : 'Bajo Receta'}
                      </span>

                      {/* Savings or form badge */}
                      {isGeneric ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-0.5 shadow-xs">
                          <TrendingDown className="w-3 h-3" />
                          <span>Genérico Ahorro</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400">
                          {med.forma_farmaceutica.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    {/* Commercial Product Packaging Image with target=_blank link */}
                    <a
                      href={medPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block w-full h-36 my-2 bg-gradient-to-b from-gray-50/80 to-white rounded-xl overflow-hidden p-2 border border-gray-100/80 group-hover:border-blue-100 transition-all cursor-pointer"
                    >
                      <img
                        src={med.imagen_url || '/assets/medications/paracetamol_500mg_generico.jpg'}
                        alt={`${med.nombre_comercial} - ${med.dci_principio_activo}`}
                        className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/medications/paracetamol_500mg_generico.jpg';
                        }}
                      />
                      <span className="absolute bottom-1 right-2 text-[9px] font-bold text-gray-400/80 uppercase tracking-tighter flex items-center gap-0.5">
                        <span>Ficha B-L</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </a>

                    {/* Drug Commercial Name */}
                    <a
                      href={medPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-base text-gray-900 group-hover:text-[#0B2B64] transition-colors leading-tight line-clamp-1 block hover:underline"
                    >
                      {med.nombre_comercial}
                    </a>

                    {/* Active Principle (DCI) + Concentration */}
                    <div className="mt-1">
                      <a
                        href={medPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#00A3E0] hover:text-[#0B2B64] block line-clamp-1"
                      >
                        {med.dci_principio_activo}
                      </a>
                      <span className="text-[11px] text-gray-500 font-medium">
                        Dosis: {med.concentracion} • {med.forma_farmaceutica}
                      </span>
                    </div>

                    {/* Laboratory and AGEMED registration */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-0.5">
                      <p className="flex items-center justify-between">
                        <span className="text-gray-400">Laboratorio:</span>
                        <strong className="text-gray-700 line-clamp-1 text-right">{med.laboratorio}</strong>
                      </p>
                      <p className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Reg. Sanitario:</span>
                        <span className="font-mono text-gray-500">{med.registro_sanitario}</span>
                      </p>
                    </div>

                    {/* Therapeutic group badge */}
                    {(med.categoria_clasificacion || med.grupo_terapeutico) && (
                      <div className="mt-2">
                        <span className="text-[10px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 line-clamp-1 inline-block">
                          {med.categoria_clasificacion || med.grupo_terapeutico}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Precio Ref. Bolivia</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-[#0B2B64]">Bs</span>
                          <span className="text-xl font-black text-[#0B2B64] tracking-tight">
                            {med.precio_referencial_bs.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Bioequivalence badge */}
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>AGEMED</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1.5">
                      <a
                        href={medPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#0B2B64] hover:bg-[#003876] flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98]"
                      >
                        <span>Ficha B-L y Variantes</span>
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                      </a>

                      <button
                        onClick={() => onOpenSavingsComparator(med)}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center gap-1 transition-all"
                      >
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                        <span>Alternativas de ahorro</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more button */}
        {visibleCount < filteredMedicamentos.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount(prev => prev + 36)}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-sm font-bold text-[#0B2B64] shadow-sm hover:shadow transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <span>Cargar más medicamentos ({filteredMedicamentos.length - visibleCount} restantes)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

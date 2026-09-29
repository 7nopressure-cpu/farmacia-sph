'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  TrendingDown, 
  MessageCircle, 
  Pill, 
  Tag, 
  Building, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Medicamento } from '../lib/types';

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
  const [visibleCount, setVisibleCount] = useState<number>(24);

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
      .slice(0, 15)
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
        return nom.includes(q) || dci.includes(q) || accion.includes(q) || lab.includes(q) || ind.includes(q);
      });
    }

    // Condition filter
    if (filterCondicion === 'otc') {
      list = list.filter(m => m.es_venta_libre);
    } else if (filterCondicion === 'receta') {
      list = list.filter(m => !m.es_venta_libre);
    }

    // Category filter from top Navbar
    if (selectedCategory && selectedCategory !== 'todos' && selectedCategory !== 'hospitales') {
      if (selectedCategory === 'otc') {
        list = list.filter(m => m.es_venta_libre);
      } else {
        const catClean = normalize(selectedCategory);
        list = list.filter(m => normalize(m.grupo_terapeutico).includes(catClean));
      }
    }

    // Laboratory filter
    if (filterLab !== 'all') {
      list = list.filter(m => m.laboratorio.toLowerCase() === filterLab.toLowerCase());
    }

    return list;
  }, [medicamentos, searchQuery, filterCondicion, selectedCategory, filterLab]);

  const visibleList = filteredMedicamentos.slice(0, visibleCount);

  const handleWhatsAppConsult = (med: Medicamento) => {
    const text = encodeURIComponent(
      `Hola Farmacia SnowPoint Bolivia, deseo consultar la disponibilidad del medicamento: ${med.nombre_comercial} (${med.dci_principio_activo} ${med.concentracion}) del Laboratorio ${med.laboratorio} (Precio Ref: Bs ${med.precio_referencial_bs.toFixed(2)}).`
    );
    window.open(`https://wa.me/59170000000?text=${text}`, '_blank');
  };

  return (
    <section id="vademecum-section" className="py-12 bg-[#F4F6F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00A3E0] mb-1">
              <Pill className="w-4 h-4" />
              <span>Catálogo Farmacoterapéutico Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2B64]">
              Vademécum Nacional de Bolivia
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Búsqueda en tiempo real de fármacos autorizados por AGEMED con comparativa de bioequivalencia y ahorro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm">
              Mostrando <strong className="text-[#0B2B64]">{filteredMedicamentos.length}</strong> medicamentos
            </span>
          </div>
        </div>

        {/* Filter Controls Bar (Farmacorp style) */}
        <div className="my-6 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Sale condition buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase mr-1">Condición:</span>
            <button
              onClick={() => setFilterCondicion('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterCondicion === 'all'
                  ? 'bg-[#0B2B64] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
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

        {/* Medication Cards Grid (Farmacorp E-Commerce Style) */}
        {filteredMedicamentos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">
              No se encontraron medicamentos con esos filtros
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Intenta buscar por el nombre genérico del principio activo (ej: Paracetamol, Ibuprofeno, Amoxicilina) o restablece los filtros.
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
              // Calculate estimated savings badge for higher-priced drugs
              const isGeneric = (med.laboratorio || '').toLowerCase().includes('ifa') || 
                                (med.laboratorio || '').toLowerCase().includes('cofar') ||
                                (med.laboratorio || '').toLowerCase().includes('delta');

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#00A3E0] shadow-card hover:shadow-card-hover transition-all duration-200 p-4 flex flex-col justify-between group"
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                          med.es_venta_libre
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {med.es_venta_libre ? 'Venta Libre (OTC)' : 'Bajo Receta'}
                      </span>

                      {/* Savings badge */}
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

                    {/* Drug Commercial Name */}
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#0B2B64] transition-colors leading-tight line-clamp-1">
                      {med.nombre_comercial}
                    </h3>

                    {/* Active Principle (DCI) + Concentration */}
                    <div className="mt-1">
                      <span className="text-xs font-semibold text-[#00A3E0] block line-clamp-1">
                        {med.dci_principio_activo}
                      </span>
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
                    {med.grupo_terapeutico && (
                      <div className="mt-2">
                        <span className="text-[10px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 line-clamp-1 inline-block">
                          {med.grupo_terapeutico}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Precio Ref. Bolivia</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-[#0B2B64]">Bs</span>
                          <span className="text-xl font-black text-[#0B2B64] tracking-tight">
                            {med.precio_referencial_bs.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Small badge of bioequivalence */}
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>AGEMED</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1.5">
                      <button
                        onClick={() => onOpenSavingsComparator(med)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#0B2B64] bg-cyan-50 hover:bg-[#00A3E0] hover:text-white border border-cyan-200 hover:border-transparent flex items-center justify-center gap-1.5 transition-all"
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Ver alternativas económicas</span>
                      </button>

                      <button
                        onClick={() => handleWhatsAppConsult(med)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Consultar por WhatsApp</span>
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
              onClick={() => setVisibleCount(prev => prev + 24)}
              className="px-8 py-3 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-sm font-bold text-[#0B2B64] shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
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

'use client';

import React from 'react';
import { 
  X, 
  TrendingDown, 
  ShieldCheck, 
  MessageCircle, 
  Check, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Medicamento } from '../lib/types';

interface SavingsComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMed: Medicamento | null;
  allMedicamentos: Medicamento[];
}

export default function SavingsComparatorModal({
  isOpen,
  onClose,
  selectedMed,
  allMedicamentos
}: SavingsComparatorModalProps) {
  if (!isOpen || !selectedMed) return null;

  const normalize = (str: string) =>
    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const targetDci = normalize(selectedMed.dci_principio_activo);

  // Find all medications sharing this active principle
  const equivalents = allMedicamentos.filter(m => {
    const dci = normalize(m.dci_principio_activo);
    return dci.includes(targetDci) || targetDci.includes(dci);
  });

  // Sort by price ascending to find the cheapest generic
  const sorted = [...equivalents].sort((a, b) => a.precio_referencial_bs - b.precio_referencial_bs);
  
  // The lowest price option
  const lowestPriceMed = sorted[0];

  // Highest price option (or the selected med if it is more expensive)
  const highestPriceMed = sorted[sorted.length - 1];

  // Calculate savings comparing against the selectedMed or highest price
  const referencePrice = Math.max(selectedMed.precio_referencial_bs, highestPriceMed ? highestPriceMed.precio_referencial_bs : selectedMed.precio_referencial_bs);
  const bestPrice = lowestPriceMed ? lowestPriceMed.precio_referencial_bs : selectedMed.precio_referencial_bs;
  const savingsBs = Math.max(0, referencePrice - bestPrice);
  const savingsPercent = referencePrice > 0 ? Math.round((savingsBs / referencePrice) * 100) : 0;

  const handleWhatsAppConsult = (med: Medicamento) => {
    const text = encodeURIComponent(
      `Hola Farmacia SnowPoint Bolivia, estoy consultando la alternativa económica de ${selectedMed.nombre_comercial} (${selectedMed.dci_principio_activo}). Deseo adquirir: ${med.nombre_comercial} de Laboratorio ${med.laboratorio} (Precio Ref: Bs ${med.precio_referencial_bs.toFixed(2)}). ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/59170000000?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B2B64] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Comparativa de Ahorro Bioequivalente
              </h2>
              <p className="text-xs text-gray-300">
                Principio activo: <strong className="text-cyan-300">{selectedMed.dci_principio_activo}</strong> ({selectedMed.concentracion})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Big Savings Highlight Banner */}
          {savingsBs > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-300 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Ahorro Máximo Identificado:</span>
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                  Hasta Bs {savingsBs.toFixed(2)}{' '}
                  <span className="text-sm sm:text-base font-bold text-emerald-600">
                    ({savingsPercent}% de ahorro)
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  Mismo principio activo y efecto terapéutico avalado por normativa de bioequivalencia AGEMED.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-500 block">Opción más económica</span>
                <span className="text-lg font-black text-[#0B2B64]">
                  {lowestPriceMed.nombre_comercial}
                </span>
                <span className="text-xs text-emerald-600 font-bold block">
                  Bs {lowestPriceMed.precio_referencial_bs.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Current Selection card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block mb-1">
              Medicamento de Referencia Consultado:
            </span>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                  <img
                    src={selectedMed.imagen_url || '/assets/medications/paracetamol_500mg_generico.jpg'}
                    alt={selectedMed.nombre_comercial}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {selectedMed.nombre_comercial}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {selectedMed.dci_principio_activo} • {selectedMed.concentracion} • Lab: {selectedMed.laboratorio}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Reg. AGEMED: {selectedMed.registro_sanitario}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Precio Ref.</span>
                <span className="text-lg font-extrabold text-[#0B2B64]">
                  Bs {selectedMed.precio_referencial_bs.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00A3E0]" />
                <span>Todas las Alternativas Registradas ({equivalents.length}):</span>
              </h4>
              <span className="text-[11px] text-gray-500">
                Ordenado por precio ascendente
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {sorted.map((item, index) => {
                const isCurrent = item.id === selectedMed.id;
                const diff = selectedMed.precio_referencial_bs - item.precio_referencial_bs;
                const itemPercent = selectedMed.precio_referencial_bs > 0 
                  ? Math.round((diff / selectedMed.precio_referencial_bs) * 100) 
                  : 0;

                return (
                  <div
                    key={item.id || index}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-blue-50/70 border-[#00A3E0] ring-1 ring-[#00A3E0]'
                        : item.precio_referencial_bs === bestPrice
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                        <img
                          src={item.imagen_url || '/assets/medications/paracetamol_500mg_generico.jpg'}
                          alt={item.nombre_comercial}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">
                            {item.nombre_comercial}
                          </span>
                          {item.precio_referencial_bs === bestPrice && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                              Mayor Ahorro
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B2B64] text-white">
                              Tu Selección
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {item.laboratorio} • {item.forma_farmaceutica} • {item.concentracion}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Reg. Sanitario: {item.registro_sanitario} • Condición: {item.condicion_venta}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-extrabold text-[#0B2B64]">
                          Bs {item.precio_referencial_bs.toFixed(2)}
                        </div>
                        {diff > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-600 block">
                            Ahorras Bs {diff.toFixed(2)} ({itemPercent}%)
                          </span>
                        ) : diff < 0 ? (
                          <span className="text-[10px] text-gray-400 block">
                            +Bs {Math.abs(diff).toFixed(2)} vs selección
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 block">
                            Mismo valor
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleWhatsAppConsult(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-emerald-600 text-white shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantía de Calidad y Bioequivalencia:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Los medicamentos genéricos y de marca autorizados por AGEMED en Bolivia comparten el mismo principio activo, concentración y vía de administración, asegurando idéntica eficacia terapéutica a una fracción del costo.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B2B64] hover:bg-[#003876] rounded-xl transition-colors"
            >
              Cerrar Comparativa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

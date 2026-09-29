'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  PhoneCall, 
  Building2, 
  Pill, 
  HelpCircle, 
  RefreshCw, 
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { TriajeResponse, TriageLevel } from '../lib/types';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymptom?: string;
  onSearchInVademecum: (term: string) => void;
  onViewHospitals: () => void;
}

export default function TriageModal({
  isOpen,
  onClose,
  initialSymptom = '',
  onSearchInVademecum,
  onViewHospitals
}: TriageModalProps) {
  const [sintoma, setSintoma] = useState('');
  const [edad, setEdad] = useState('Adulto (18-64 años)');
  const [duracion, setDuracion] = useState('1 a 2 días');
  const [antecedentes, setAntecedentes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriajeResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSymptom) {
      setSintoma(initialSymptom);
    }
  }, [initialSymptom]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sintoma.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/triaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sintoma: sintoma.trim(),
          edad,
          duracion,
          antecedentes: antecedentes.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Error al procesar la evaluación clínica');
      }

      const data: TriajeResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No fue posible completar la evaluación con IA');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSintoma('');
    setAntecedentes('');
  };

  const renderBadge = (level: TriageLevel) => {
    switch (level) {
      case 'VERDE':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>NIVEL VERDE: Leve / Autolimitado</span>
          </div>
        );
      case 'AMARILLO':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>NIVEL AMARILLO: Moderado / Consulta Médica</span>
          </div>
        );
      case 'ROJO':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider animate-pulse shadow-md">
            <AlertOctagon className="w-4 h-4 text-white" />
            <span>NIVEL ROJO: URGENCIA MÉDICA INMEDIATA</span>
          </div>
        );
    }
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
            <div className="p-2 rounded-xl bg-white/10 text-cyan-300">
              <Sparkles className="w-5 h-5 text-[#00A3E0]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Consultor Clínico de Triaje con IA
              </h2>
              <p className="text-xs text-gray-300">
                Orientación farmacológica y derivación de urgencias - Bolivia
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {!result && !loading && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Describe los síntomas principales <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={sintoma}
                  onChange={(e) => setSintoma(e.target.value)}
                  placeholder="Ej: Tengo dolor en el pecho opresivo que empezó hace una hora, o tengo congestión nasal y febrícula..."
                  className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none text-gray-800 placeholder-gray-400 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Grupo etario del paciente
                  </label>
                  <select
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:outline-none text-gray-800"
                  >
                    <option value="Lactante / Pediátrico (< 5 años)">Lactante / Pediátrico (&lt; 5 años)</option>
                    <option value="Niño / Adolescente (5-17 años)">Niño / Adolescente (5-17 años)</option>
                    <option value="Adulto (18-64 años)">Adulto (18-64 años)</option>
                    <option value="Adulto Mayor (65+ años)">Adulto Mayor (65+ años)</option>
                    <option value="Mujer en gestación / Embarazo">Mujer en gestación / Embarazo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tiempo de evolución
                  </label>
                  <select
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:outline-none text-gray-800"
                  >
                    <option value="Menos de 2 horas (Súbito)">Menos de 2 horas (Súbito)</option>
                    <option value="1 a 2 días">1 a 2 días</option>
                    <option value="3 a 7 días">3 a 7 días</option>
                    <option value="Más de 1 semana">Más de 1 semana</option>
                    <option value="Cuadro crónico recurrente">Cuadro crónico recurrente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Antecedentes médicos o alergias (Opcional)
                </label>
                <input
                  type="text"
                  value={antecedentes}
                  onChange={(e) => setAntecedentes(e.target.value)}
                  placeholder="Ej: Hipertensión, asma, diabetes, alergia a la penicilina..."
                  className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:outline-none text-gray-800 placeholder-gray-400"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!sintoma.trim()}
                  className="w-full py-3.5 rounded-xl bg-[#0B2B64] hover:bg-[#003876] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Realizar Evaluación Clínica con IA</span>
                </button>
              </div>
            </form>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#0B2B64]/20 border-t-[#00A3E0] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#00A3E0] absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#0B2B64]">Evaluando según protocolos clínicos...</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Consultando base de conocimientos médicos de triaje, normativas de AGEMED y vademécum de venta libre de Bolivia.
                </p>
              </div>
            </div>
          )}

          {/* Results Card */}
          {result && (
            <div className="space-y-5">
              {/* Badge & Title */}
              <div className={`p-4 rounded-2xl border ${
                result.nivel === 'ROJO' 
                  ? 'bg-red-50/80 border-red-300 ring-2 ring-red-500' 
                  : result.nivel === 'AMARILLO' 
                  ? 'bg-amber-50/80 border-amber-300' 
                  : 'bg-emerald-50/80 border-emerald-300'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  {renderBadge(result.nivel)}
                  <span className="text-[11px] font-semibold text-gray-500">
                    Triaje automatizado SPH
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {result.titulo}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mt-1.5 leading-relaxed">
                  {result.resumen_clinico}
                </p>
              </div>

              {/* CRITICAL ALERT FOR RED LEVEL */}
              {result.nivel === 'ROJO' && (
                <div className="p-4 rounded-xl bg-red-600 text-white space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertOctagon className="w-5 h-5 animate-bounce" />
                    <span>PROTOCOLO DE URGENCIA MÉDICA INMEDIATA</span>
                  </div>
                  <p className="text-xs leading-relaxed text-red-100">
                    Por favor no espere ni intente automedicarse. Trasládese de inmediato a la sala de emergencias más cercana o comuníquese con el servicio de ambulancias de La Paz / El Alto.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:168"
                      className="inline-flex items-center gap-1.5 bg-white text-red-700 font-extrabold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100 shadow transition-all"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Llamar al 168 (Ambulancias SEDES)</span>
                    </a>
                    <button
                      onClick={() => {
                        onClose();
                        onViewHospitals();
                      }}
                      className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Ver Hospitales con Urgencias 24h</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Non-Pharmacological Measures */}
              {result.medidas_no_farmacologicas && result.medidas_no_farmacologicas.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-xs font-bold text-[#0B2B64] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Medidas de Cuidado General y No Farmacológicas:</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {result.medidas_no_farmacologicas.map((m, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-[#00A3E0] font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* OTC Suggested Medications (Strictly Venta Libre in Level VERDE/AMARILLO) */}
              {result.medicamentos_otc_sugeridos && result.medicamentos_otc_sugeridos.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span>Fármacos de Venta Libre Sugeridos (Bolivia OTC):</span>
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Sin Receta Requerida
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.medicamentos_otc_sugeridos.map((med, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center justify-between">
                          <span>{med.dci}</span>
                          <button
                            onClick={() => {
                              onClose();
                              onSearchInVademecum(med.dci);
                            }}
                            className="text-[#00A3E0] hover:text-[#0B2B64] font-semibold text-[11px] flex items-center gap-0.5"
                          >
                            <span>Ver marcas</span>
                            <Search className="w-3 h-3" />
                          </button>
                        </div>
                        {med.nombre_referencial_bo && (
                          <p className="text-[11px] text-gray-500 font-medium">
                            Ref: {med.nombre_referencial_bo}
                          </p>
                        )}
                        <p className="text-gray-700 text-[11px]">
                          <strong>Posología orientativa:</strong> {med.posologia_preventiva}
                        </p>
                        <p className="text-amber-800 text-[10px] bg-amber-50 p-1.5 rounded border border-amber-200">
                          ⚠️ {med.advertencia}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialty & Referral Centers */}
              {result.especialidad_recomendada && (
                <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200">
                  <h4 className="text-xs font-bold text-[#0B2B64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#00A3E0]" />
                    <span>Especialidad Médica Recomendada:</span>
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {result.especialidad_recomendada}
                  </p>
                  {result.hospitales_derivacion_sugeridos && result.hospitales_derivacion_sugeridos.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Centros de referencia sugeridos en La Paz / El Alto:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {result.hospitales_derivacion_sugeridos.map((h, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white border border-blue-200 text-[#0B2B64] font-medium text-[11px]">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Alarm Signs to Watch */}
              {result.signos_alarma && result.signos_alarma.length > 0 && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <span className="font-bold text-gray-800 block mb-1">
                    Signos de alarma ante los cuales acudir de urgencia:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-[11px]">
                    {result.signos_alarma.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Evaluar otro síntoma</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onViewHospitals();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0B2B64] bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#00A3E0]" />
                    <span>Guía de Hospitales</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B2B64] hover:bg-[#003876] transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>

              {/* Legal Note */}
              <p className="text-[10px] text-gray-400 text-center leading-normal pt-1">
                {result.advertencia_legal || 'Orientación preliminar asistida por IA según Ley 1737 del Medicamento de Bolivia.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

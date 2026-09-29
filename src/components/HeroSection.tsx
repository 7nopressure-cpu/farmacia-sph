'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  HeartPulse, 
  Activity,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

interface HeroSectionProps {
  onStartTriage: (initialSymptom?: string) => void;
  onExploreVademecum: () => void;
}

const QUICK_SYMPTOMS = [
  { label: 'Fiebre y dolor de cabeza', level: 'VERDE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Gripe o congestión nasal', level: 'VERDE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Acidez o pesadez gástrica', level: 'VERDE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Fiebre persistente > 3 días', level: 'AMARILLO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { label: 'Dolor en pecho o falta de aire (Urgencia)', level: 'ROJO', color: 'bg-red-500/25 text-red-200 border-red-500/40 animate-pulse' },
];

export default function HeroSection({ onStartTriage, onExploreVademecum }: HeroSectionProps) {
  const [symptomInput, setSymptomInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptomInput.trim()) {
      onStartTriage(symptomInput.trim());
    } else {
      onStartTriage();
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0B2B64] text-white">
      {/* Background Banner with Snowpoint Graphics */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero-banner.jpg"
          alt="Snowpoint Healthcare Fondo"
          fill
          priority
          className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2B64] via-[#0B2B64]/95 to-[#003876]/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading and Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
              <span className="flex h-2 w-2 rounded-full bg-[#00A3E0] animate-ping" />
              <span>Salud Pública & Farmacología Digital Bolivia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Vademécum Nacional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-[#00A3E0]">
                & Consultor Médico con IA
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed max-w-2xl">
              Accede al registro de más de <strong>5,400 medicamentos</strong> autorizados por 
              <strong> AGEMED</strong> en Bolivia. Compara precios entre marcas y bioequivalentes genéricos 
              de ahorro, y realiza tu orientación de triaje clínico inteligente 24/7.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onStartTriage()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00A3E0] to-cyan-500 hover:from-cyan-400 hover:to-[#00A3E0] text-[#0B2B64] font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5 text-[#0B2B64]" />
                <span>Consultor de Triaje IA</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onExploreVademecum}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 active:scale-95 transition-all"
              >
                <Search className="w-4 h-4 text-cyan-300" />
                <span>Explorar Vademécum</span>
              </button>
            </div>

            {/* Micro Badges Farmacorp / Healthcare standards */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Registro AGEMED Oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#00A3E0] flex-shrink-0" />
                <span>Ahorro Genérico hasta 70%</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Triaje Ley 1737 Bolivia</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Clinical Triage Starter Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white text-gray-800 relative">
              {/* Header card */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#0B2B64] text-white">
                    <Activity className="w-5 h-5 text-[#00A3E0]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0B2B64]">Triaje Clínico Inmediato</h3>
                    <p className="text-xs text-gray-500">Evaluación orientativa en 3 niveles</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                  En línea
                </span>
              </div>

              {/* Form Input */}
              <form onSubmit={handleQuickSubmit} className="mt-4 space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
                  ¿Qué síntoma o molestia presentas hoy?
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Ej: Tengo dolor de garganta y malestar general desde ayer..."
                    className="w-full p-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none text-gray-800 placeholder-gray-400 resize-none transition-all"
                  />
                </div>

                {/* Symptom quick chips */}
                <div>
                  <span className="block text-[11px] font-medium text-gray-500 mb-1.5">
                    O selecciona un motivo frecuente:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SYMPTOMS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onStartTriage(item.label)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                          item.level === 'ROJO'
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : item.level === 'AMARILLO'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-[#0B2B64] hover:bg-[#003876] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Evaluar Síntomas con IA Médica</span>
                </button>
              </form>

              {/* Disclaimer footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2 text-[10px] text-gray-500 leading-tight">
                <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso Ley 1737 del Medicamento:</strong> Este orientador preliminar con IA 
                  no reemplaza la consulta con un médico colegiado ni emite recetas médicas bajo prescripción.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

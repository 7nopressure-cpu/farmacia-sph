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
  Send,
  Bot,
  User,
  Stethoscope,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  PhoneCall,
  Building2
} from 'lucide-react';
import { Medicamento, TriajeResponse, TriageLevel } from '../lib/types';
import { slugify, DRUG_CATEGORIES, normalizeText } from '../lib/medicationsHelper';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  triageData?: TriajeResponse;
  timestamp: string;
}

interface HeroSectionProps {
  onStartTriage?: (initialSymptom?: string) => void;
  onExploreHospitals?: () => void;
  medicamentos?: Medicamento[];
}

const QUICK_SUGGESTIONS = [
  '¿Qué dosis preventiva debo tomar?',
  '¿Cuáles son los signos de alarma para ir al hospital?',
  '¿A qué hospital con urgencias 24h me recomiendas ir?'
];

export default function HeroSection({ 
  onStartTriage, 
  onExploreHospitals,
  medicamentos = []
}: HeroSectionProps) {
  // --- BUSCADOR & CATEGORÍAS (COLUMNA IZQUIERDA) ---
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Medicamento[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- CONSULTOR MÉDICO IA INLINE (COLUMNA DERECHA) ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [edad, setEdad] = useState('Adulto (18-64 años)');
  const [duracion, setDuracion] = useState('1 a 2 días');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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

  // Preview medications of the selected category (max 4)
  const categoryPreview = useMemo(() => {
    if (!selectedCategory || medicamentos.length === 0) return [];
    const cleanCat = normalizeText(selectedCategory);
    return medicamentos.filter(m => 
      normalizeText(m.categoria_clasificacion || '').includes(cleanCat) ||
      normalizeText(m.grupo_terapeutico || '').includes(cleanCat) ||
      normalizeText(m.accion_terapeutica || '').includes(cleanCat)
    ).slice(0, 4);
  }, [selectedCategory, medicamentos]);

  // Send message to AI Triage Endpoint
  const handleSendAiMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    setErrorMsg('');
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const formattedHistory = newHistory.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch('/api/triaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sintoma: text,
          edad,
          duracion,
          messages: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error('No fue posible procesar la consulta con IA.');
      }

      const triageData: TriajeResponse = await res.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: triageData.resumen_clinico || 'Evaluación completada.',
        triageData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error en consulta médica con IA:', err);
      setErrorMsg(err.message || 'Error en la conexión con el consultor médico.');
    } finally {
      setLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputText('');
    setErrorMsg('');
  };

  const renderBadge = (level?: TriageLevel) => {
    if (!level) return null;
    switch (level) {
      case 'VERDE':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>NIVEL VERDE: Leve / Autolimitado</span>
          </div>
        );
      case 'AMARILLO':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>NIVEL AMARILLO: Moderado / Consulta Médica</span>
          </div>
        );
      case 'ROJO':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-wider animate-pulse shadow-md">
            <AlertOctagon className="w-3.5 h-3.5 text-white" />
            <span>NIVEL ROJO: URGENCIA MÉDICA INMEDIATA</span>
          </div>
        );
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2B64] via-[#092250] to-[#003876] text-white pt-6 pb-12 sm:pt-8 sm:pb-16 shadow-inner">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LAYOUT DIVIDIDO EN DOS PARTES (IZQUIERDA: BUSCADOR | DERECHA: CONSULTOR IA DIRECTO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: BUSCADOR DE MEDICAMENTOS & CATEGORÍAS */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 text-left">
            
            {/* Badge: Consultor Médico */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Consultor Médico</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black tracking-tight leading-tight text-white drop-shadow-md">
              Lista Nacional de Medicamentos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-[#00A3E0]">
                & Consultor Médico con IA
              </span>
            </h1>

            {/* Párrafo Descriptivo */}
            <p className="text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed">
              Accede a las caracteristicas de más de 5,400 medicamentos autorizados por AGEMED en Bolivia y realiza tu orientación de triaje clínico inteligente 24/7.
            </p>

            {/* BARRA BUSCADORA */}
            <div ref={searchContainerRef} className="relative w-full">
              <div className="relative flex items-center shadow-2xl rounded-full bg-white p-1 border-2 border-white/30 focus-within:border-[#00A3E0] transition-all">
                <div className="pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[#00A3E0]" />
                </div>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="busca tu medicamento por nombre comercial o generico"
                  className="w-full pl-3 pr-24 py-3 bg-transparent text-gray-900 placeholder-gray-400 text-xs sm:text-sm font-medium rounded-full focus:outline-none"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSuggestions([]); }}
                    className="absolute right-24 text-gray-400 hover:text-gray-600 p-1"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openMedicationWindow(query)}
                  className="px-5 py-2.5 rounded-full bg-[#0B2B64] hover:bg-[#003876] text-white font-black text-xs sm:text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Buscar</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                </button>
              </div>

              {/* Autocomplete Predictive Dropdown Results */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 text-left z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Resultados directos (Enter para abrir)</span>
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
                      className="px-4 py-2.5 hover:bg-cyan-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-black text-xs sm:text-sm text-gray-900 group-hover:text-[#0B2B64] block truncate">
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
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00A3E0]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MENÚ DESPLEGABLE CON LAS 11 CATEGORÍAS DE FÁRMACOS */}
            <div ref={dropdownRef} className="relative block z-30">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full inline-flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white text-gray-800 hover:bg-gray-50 shadow-lg border border-gray-200 text-xs sm:text-sm font-bold transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Pill className="w-4 h-4 text-[#00A3E0] flex-shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="truncate">
                    {selectedCategory ? `Categoría: ${selectedCategory}` : 'Selecciona una de las 11 categorías de fármacos'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú Desplegable (Dropdown) con las 11 categorías */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1.5 z-50 text-gray-900 text-left divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  <div className="px-4 py-2.5 bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>11 Categorías de la Base de Datos</span>
                    {selectedCategory && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedCategory(''); }}
                        className="text-xs text-[#00A3E0] hover:underline normal-case font-semibold"
                      >
                        Limpiar selección
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
                        className={`w-full px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-[#0B2B64] font-black'
                            : 'text-gray-800 hover:bg-gray-50 hover:text-[#0B2B64]'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#00A3E0] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vista previa rápida de fármacos de la categoría seleccionada */}
            {selectedCategory && categoryPreview.length > 0 && (
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-200">
                  <span>Fármacos de {selectedCategory}:</span>
                  <span className="text-[10px] text-cyan-300">Abre en nueva ventana</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categoryPreview.map((m) => {
                    const target = m.dci_principio_activo !== '-' ? m.dci_principio_activo : m.nombre_comercial;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => openMedicationWindow(target)}
                        className="p-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 text-left text-xs transition-all shadow-xs flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-bold block truncate group-hover:text-[#0B2B64]">{m.nombre_comercial}</span>
                          <span className="text-[10px] text-[#00A3E0] block truncate">{m.dci_principio_activo}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#00A3E0] flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Acceso a Hospitales La Paz y El Alto */}
            {onExploreHospitals && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExploreHospitals}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95"
                >
                  <Building2 className="w-4 h-4 text-cyan-300" />
                  <span>Ver Hospitales y Centros de Salud en La Paz / El Alto</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                </button>
              </div>
            )}

          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: CONSULTOR MÉDICO CON IA (AMPLIO & DIRECTO) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 w-full">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/20 text-gray-900 flex flex-col h-[580px] sm:h-[620px] overflow-hidden transition-all">
              
              {/* Header de la tarjeta del consultor IA */}
              <div className="bg-[#0B2545] text-white px-4 sm:px-5 py-3 flex items-center justify-between border-b border-[#143D84] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-[#00A3E0] text-white shadow-sm">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold leading-tight">
                        Consultor Clínico IA
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Gemini 1.5 Flash
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300">
                      Triaje clínico en tiempo real • Sin abrir otra ventana
                    </p>
                  </div>
                </div>

                {messages.length > 0 && (
                  <button
                    onClick={handleResetChat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
                    title="Nueva consulta"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="text-[11px]">Reiniciar</span>
                  </button>
                )}
              </div>

              {/* Controles rápidos de paciente (Edad y Duración) */}
              <div className="bg-gray-100/80 px-4 py-2 border-b border-gray-200 grid grid-cols-2 gap-2 text-left flex-shrink-0">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">
                    Grupo etario:
                  </label>
                  <select
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="w-full text-xs py-1 px-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-[#00A3E0]"
                  >
                    <option value="Adulto (18-64 años)">Adulto (18-64 años)</option>
                    <option value="Lactante / Pediátrico (< 5 años)">Pediátrico (&lt; 5 años)</option>
                    <option value="Niño / Adolescente (5-17 años)">Niño (5-17 años)</option>
                    <option value="Adulto Mayor (65+ años)">Adulto Mayor (65+)</option>
                    <option value="Mujer en gestación">Mujer en gestación</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">
                    Tiempo de evolución:
                  </label>
                  <select
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full text-xs py-1 px-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-[#00A3E0]"
                  >
                    <option value="Menos de 2 horas (Súbito)">Menos de 2h (Súbito)</option>
                    <option value="1 a 2 días">1 a 2 días</option>
                    <option value="3 a 7 días">3 a 7 días</option>
                    <option value="Más de 1 semana">Más de 1 semana</option>
                  </select>
                </div>
              </div>

              {/* Área de Conversación / Respuestas Clínicas */}
              <div 
                ref={chatScrollRef}
                className="flex-1 p-3 sm:p-4 overflow-y-auto bg-[#F8FAFC] space-y-3 text-left"
              >
                {/* Estado Inicial de Bienvenida si no hay mensajes */}
                {messages.length === 0 && (
                  <div className="py-4 space-y-3.5 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B2545] to-[#00A3E0] text-white flex items-center justify-center mx-auto shadow-sm">
                      <Sparkles className="w-6 h-6 text-cyan-200" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        ¿Qué síntomas presentas hoy?
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                        Escribe tus síntomas aquí abajo para recibir orientación médica personalizada, nivel de triaje y sugerencia de fármacos de venta libre (OTC).
                      </p>
                    </div>

                    {/* Chips de consultas frecuentes (1 clic) */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        O prueba una consulta frecuente:
                      </span>
                      <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                        {[
                          'Tengo acidez estomacal y reflujo después de comer',
                          'Dolor de garganta, congestión y fiebre leve',
                          'Dolor lumbar al inclinarme',
                          'Dolor opresivo en el pecho y falta de aire (Urgencia)'
                        ].map((sugg, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendAiMessage(sugg)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-cyan-50 hover:text-[#0B2B64] hover:border-[#00A3E0] border border-gray-200 rounded-lg transition-all shadow-2xs text-left"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Renderizado de Mensajes */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#0B2545] text-cyan-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`max-w-[90%] space-y-2.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.role === 'user' ? (
                        <div className="bg-[#0B2545] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-xs text-xs sm:text-sm">
                          <p className="leading-relaxed">{msg.text}</p>
                          <span className="text-[9px] text-gray-300 block text-right mt-1 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                      ) : (
                        /* Tarjeta clínica emitida por la IA */
                        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200 shadow-sm space-y-3 text-gray-800">
                          
                          {/* Badge de Nivel y Título */}
                          {msg.triageData && (
                            <div className={`p-2.5 rounded-xl border ${
                              msg.triageData.nivel === 'ROJO'
                                ? 'bg-red-50 border-red-300'
                                : msg.triageData.nivel === 'AMARILLO'
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-emerald-50 border-emerald-300'
                            }`}>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                {renderBadge(msg.triageData.nivel)}
                                <span className="text-[9px] text-gray-400 font-mono">
                                  {msg.timestamp}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-snug">
                                {msg.triageData.titulo}
                              </h4>
                            </div>
                          )}

                          {/* Resumen clínico */}
                          <div className="text-xs text-gray-700 leading-relaxed">
                            <p>{msg.text}</p>
                          </div>

                          {/* PROTOCOLO ROJO DE EMERGENCIA */}
                          {msg.triageData?.nivel === 'ROJO' && (
                            <div className="p-3 rounded-xl bg-red-600 text-white space-y-2 shadow-md">
                              <div className="flex items-center gap-1.5 font-black text-xs">
                                <AlertOctagon className="w-4 h-4 animate-bounce" />
                                <span>ALERTA DE EMERGENCIA HOSPITALARIA</span>
                              </div>
                              <p className="text-[11px] text-red-100 leading-relaxed">
                                No espere ni intente automedicarse. Llame de inmediato a una ambulancia o acuda a urgencias.
                              </p>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                <a
                                  href="tel:168"
                                  className="inline-flex items-center gap-1 bg-white text-red-700 font-black px-2.5 py-1 rounded-lg text-[11px] hover:bg-gray-100 shadow transition-all"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>Llamar al 168 (SEDES)</span>
                                </a>
                                {onExploreHospitals && (
                                  <button
                                    type="button"
                                    onClick={onExploreHospitals}
                                    className="inline-flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all"
                                  >
                                    <Building2 className="w-3 h-3" />
                                    <span>Ver Hospitales 24h</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Medidas no farmacológicas */}
                          {msg.triageData?.medidas_no_farmacologicas && msg.triageData.medidas_no_farmacologicas.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
                              <h5 className="text-[10px] font-bold text-[#0B2545] uppercase tracking-wider mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Medidas de Autocuidado:</span>
                              </h5>
                              <ul className="space-y-0.5">
                                {msg.triageData.medidas_no_farmacologicas.map((medida, idx) => (
                                  <li key={idx} className="text-[11px] text-gray-700 flex items-start gap-1.5">
                                    <span className="text-[#00A3E0] font-bold">•</span>
                                    <span>{medida}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Fármacos de Venta Libre (OTC) Sugeridos */}
                          {msg.triageData?.medicamentos_otc_sugeridos && msg.triageData.medicamentos_otc_sugeridos.length > 0 && (
                            <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                                  <Pill className="w-3 h-3 text-emerald-600" />
                                  <span>Fármacos de Venta Libre Sugeridos (OTC):</span>
                                </h5>
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Sin Receta
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {msg.triageData.medicamentos_otc_sugeridos.map((med, idx) => (
                                  <div key={idx} className="p-2 rounded-lg bg-white border border-emerald-100 text-xs space-y-0.5">
                                    <div className="font-bold text-gray-900 flex items-center justify-between">
                                      <span>{med.dci}</span>
                                      <button
                                        type="button"
                                        onClick={() => openMedicationWindow(med.dci)}
                                        className="text-[#00A3E0] hover:text-[#0B2B64] font-semibold text-[10px] flex items-center gap-0.5"
                                        title="Abrir ficha en nueva ventana"
                                      >
                                        <span>Ver marcas</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-gray-600">
                                      <strong>Dosis preventiva:</strong> {med.posologia_preventiva}
                                    </p>
                                    <p className="text-amber-800 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                      ⚠️ {med.advertencia}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Especialidad Recomendada */}
                          {msg.triageData?.especialidad_recomendada && (
                            <div className="bg-blue-50/60 rounded-xl p-2.5 border border-blue-200 text-[11px] text-gray-700">
                              <span className="font-bold text-[#0B2545] block mb-0.5">
                                Especialidad médica presencial:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {msg.triageData.especialidad_recomendada}
                              </p>
                              {msg.triageData.hospitales_derivacion_sugeridos && msg.triageData.hospitales_derivacion_sugeridos.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {msg.triageData.hospitales_derivacion_sugeridos.map((hosp, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-[#0B2B64] text-[9px] font-medium">
                                      {hosp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Indicador de Carga */}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#0B2545] text-cyan-300 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-2xs flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00A3E0] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00A3E0] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00A3E0] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] font-medium text-gray-600">
                        Evaluando caso clínico y vademécum boliviano...
                      </span>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Sugerencias de seguimiento (si ya hay conversación) */}
              {messages.length > 0 && !loading && (
                <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 overflow-x-auto scrollbar-none flex-shrink-0 text-left">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#00A3E0]" />
                      Sugerencias:
                    </span>
                    {QUICK_SUGGESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendAiMessage(q)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-gray-700 hover:text-[#0B2B64] hover:bg-cyan-50 border border-gray-200 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra inferior interactiva de envío */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-gray-200 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiMessage(inputText);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      messages.length === 0
                        ? "Escribe aquí tus síntomas (ej: ardor en estómago, dolor de cabeza)..."
                        : "Escribe tu duda o pregunta de seguimiento..."
                    }
                    disabled={loading}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none text-gray-800 placeholder-gray-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    className="px-3.5 py-2 rounded-xl bg-[#0B2B64] hover:bg-[#003876] disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
                  >
                    <span>Consultar</span>
                    <Send className="w-3.5 h-3.5 text-cyan-300" />
                  </button>
                </form>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center truncate">
                  Orientación clínica no vinculante (Ley 1737). Ante signos de alarma acuda a emergencias.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

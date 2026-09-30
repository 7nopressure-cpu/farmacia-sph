'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  PhoneCall, 
  Building2, 
  Pill, 
  RefreshCw, 
  Search,
  Send,
  User,
  Bot,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { TriajeResponse, TriageLevel } from '../lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  triageData?: TriajeResponse;
  timestamp: string;
}

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymptom?: string;
  onSearchInVademecum: (term: string) => void;
  onViewHospitals: () => void;
}

const QUICK_SUGGESTIONS = [
  '¿Qué dosis preventiva de Paracetamol debo tomar?',
  '¿Cuáles son los signos de alarma para ir al hospital?',
  '¿Puedo tomar el medicamento si tengo gastritis?',
  '¿A qué hospital con urgencias 24h me recomiendas ir?'
];

export default function TriageModal({
  isOpen,
  onClose,
  initialSymptom = '',
  onSearchInVademecum,
  onViewHospitals
}: TriageModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [edad, setEdad] = useState('Adulto (18-64 años)');
  const [duracion, setDuracion] = useState('1 a 2 días');
  const [antecedentes, setAntecedentes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // When opened with initial symptom from Hero, start the conversation automatically
  useEffect(() => {
    if (isOpen && initialSymptom && messages.length === 0) {
      handleSendMessage(initialSymptom);
    }
  }, [isOpen, initialSymptom]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
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
      // Build API payload including message history
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
          antecedentes: antecedentes.trim(),
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
      console.error('Error enviando mensaje de triaje:', err);
      setErrorMsg(err.message || 'Error en la conexión con el consultor médico.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
      <div 
        className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B2B64] text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#143D84] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-[#00A3E0] text-white shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  Consultor Clínico de Triaje con IA
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini 1.5 Flash Conectado
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Diálogo clínico interactivo • Normativa AGEMED y Ley 1737 (Bolivia)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleResetChat}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
                title="Iniciar nueva conversación"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Nueva consulta</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F8FAFC] space-y-4">
          
          {/* Welcome Intro if empty */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0B2B64] to-[#00A3E0] text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8 text-cyan-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  ¿Qué síntomas o molestias presentas hoy?
                </h3>
                <p className="text-sm text-gray-600 mt-1 max-w-lg mx-auto">
                  Escribe tu motivo de consulta para recibir una evaluación clínica personalizada, clasificación de triaje (Verde, Amarillo o Rojo), orientación de fármacos de venta libre (OTC) o derivación a hospitales de La Paz y El Alto.
                </p>
              </div>

              {/* Patient context options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">
                    Grupo etario:
                  </label>
                  <select
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A3E0] text-gray-800"
                  >
                    <option value="Adulto (18-64 años)">Adulto (18-64 años)</option>
                    <option value="Lactante / Pediátrico (< 5 años)">Pediátrico (&lt; 5 años)</option>
                    <option value="Niño / Adolescente (5-17 años)">Niño (5-17 años)</option>
                    <option value="Adulto Mayor (65+ años)">Adulto Mayor (65+ años)</option>
                    <option value="Mujer en gestación">Mujer en gestación</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">
                    Tiempo de evolución:
                  </label>
                  <select
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A3E0] text-gray-800"
                  >
                    <option value="Menos de 2 horas (Súbito)">Menos de 2 horas (Súbito)</option>
                    <option value="1 a 2 días">1 a 2 días</option>
                    <option value="3 a 7 días">3 a 7 días</option>
                    <option value="Más de 1 semana">Más de 1 semana</option>
                  </select>
                </div>
              </div>

              {/* Quick Prompt Starters */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  O selecciona una consulta frecuente:
                </span>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {[
                    'Tengo dolor de estómago y acidez después de comer',
                    'Fiebre leve, dolor de garganta y congestión nasal',
                    'Dolor agudo de muela desde anoche',
                    'Dolor lumbar en la espalda al agacharme',
                    'Dolor opresivo de pecho y falta de aire (Urgencia)'
                  ].map((sugg, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sugg)}
                      className="px-3.5 py-2 text-xs font-medium bg-white hover:bg-cyan-50 hover:text-[#0B2B64] hover:border-[#00A3E0] border border-gray-200 rounded-xl transition-all shadow-2xs text-left"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#0B2B64] text-cyan-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* User Message Bubble */}
                {msg.role === 'user' ? (
                  <div className="bg-[#0B2B64] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-sm text-sm">
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[10px] text-gray-300 block text-right mt-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : (
                  /* Assistant Message Full Card */
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-sm space-y-4 text-gray-800">
                    
                    {/* Triage Badge & Title */}
                    {msg.triageData && (
                      <div className={`p-3.5 rounded-xl border ${
                        msg.triageData.nivel === 'ROJO'
                          ? 'bg-red-50 border-red-300'
                          : msg.triageData.nivel === 'AMARILLO'
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-emerald-50 border-emerald-300'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          {renderBadge(msg.triageData.nivel)}
                          <span className="text-[10px] text-gray-400 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                          {msg.triageData.titulo}
                        </h4>
                      </div>
                    )}

                    {/* Clinical Summary */}
                    <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-1">
                      <p>{msg.text}</p>
                    </div>

                    {/* RED EMERGENCY PROTOCOL */}
                    {msg.triageData?.nivel === 'ROJO' && (
                      <div className="p-4 rounded-xl bg-red-600 text-white space-y-2.5 shadow-md">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <AlertOctagon className="w-5 h-5 animate-bounce" />
                          <span>ALERTA DE EMERGENCIA MÉDICA INMEDIATA</span>
                        </div>
                        <p className="text-xs text-red-100 leading-relaxed">
                          Por favor no espere ni intente automedicarse. Acuda de inmediato al servicio de urgencias hospitalarias o comuníquese con el servicio de ambulancias de La Paz / El Alto.
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

                    {/* Non-pharmacological measures */}
                    {msg.triageData?.medidas_no_farmacologicas && msg.triageData.medidas_no_farmacologicas.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                        <h5 className="text-[11px] font-bold text-[#0B2B64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Medidas de Autocuidado y Cuidados en Casa:</span>
                        </h5>
                        <ul className="space-y-1">
                          {msg.triageData.medidas_no_farmacologicas.map((medida, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="text-[#00A3E0] font-bold">•</span>
                              <span>{medida}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* OTC Medications Cards */}
                    {msg.triageData?.medicamentos_otc_sugeridos && msg.triageData.medicamentos_otc_sugeridos.length > 0 && (
                      <div className="bg-white rounded-xl p-3.5 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fármacos de Venta Libre Sugeridos (Bolivia OTC):</span>
                          </h5>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Sin Receta Requerida
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.triageData.medicamentos_otc_sugeridos.map((med, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs space-y-1">
                              <div className="font-bold text-gray-900 flex items-center justify-between">
                                <span>{med.dci}</span>
                                <button
                                  onClick={() => {
                                    onClose();
                                    onSearchInVademecum(med.dci);
                                  }}
                                  className="text-[#00A3E0] hover:text-[#0B2B64] font-semibold text-[10px] flex items-center gap-0.5"
                                  title="Ver marcas en Vademécum"
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
                                <strong>Posología preventiva:</strong> {med.posologia_preventiva}
                              </p>
                              <p className="text-amber-800 text-[10px] bg-amber-50 p-1 rounded border border-amber-200">
                                ⚠️ {med.advertencia}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Specialty & Referral */}
                    {msg.triageData?.especialidad_recomendada && (
                      <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200 text-xs text-gray-700">
                        <span className="font-bold text-[#0B2B64] block mb-1">
                          Especialidad médica presencial recomendada:
                        </span>
                        <p className="font-semibold text-gray-900">
                          {msg.triageData.especialidad_recomendada}
                        </p>
                        {msg.triageData.hospitales_derivacion_sugeridos && msg.triageData.hospitales_derivacion_sugeridos.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.triageData.hospitales_derivacion_sugeridos.map((hosp, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white border border-blue-200 text-[#0B2B64] text-[10px] font-medium">
                                {hosp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Red flags */}
                    {msg.triageData?.signos_alarma && msg.triageData.signos_alarma.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-600">
                        <strong className="text-gray-800 block mb-0.5">Signos de alarma ante los cuales acudir de urgencia:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {msg.triageData.signos_alarma.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Legal note */}
                    <div className="pt-1 text-[10px] text-gray-400 flex items-center justify-between">
                      <span>Normativa Ley 1737 del Medicamento (Bolivia)</span>
                      <button
                        onClick={() => {
                          onClose();
                          onViewHospitals();
                        }}
                        className="text-[#00A3E0] hover:underline font-semibold"
                      >
                        Ver guía de hospitales
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#0B2B64] text-cyan-300 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00A3E0] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#00A3E0] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#00A3E0] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  Analizando caso clínico y vademécum boliviano...
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Follow-up Suggestions Bar (Shown after first message) */}
        {messages.length > 0 && !loading && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto scrollbar-none flex-shrink-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00A3E0]" />
                Sugerencias:
              </span>
              {QUICK_SUGGESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-gray-700 hover:text-[#0B2B64] hover:bg-cyan-50 border border-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Bottom Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                messages.length === 0
                  ? "Describe tus síntomas detalladamente (ej: acidez tras comer, dolor de muela, fiebre)..."
                  : "Escribe tu duda de seguimiento sobre el síntoma o el medicamento..."
              }
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none text-gray-800 placeholder-gray-400 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-[#0B2B64] hover:bg-[#003876] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 flex-shrink-0"
            >
              <span>Enviar</span>
              <Send className="w-4 h-4 text-cyan-300" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
            <span>Orientación clínica no vinculante (Ley 1737 de Bolivia). Ante signos de alarma acuda a emergencias.</span>
            <button
              onClick={handleResetChat}
              className="text-gray-500 hover:text-gray-800 underline sm:hidden"
            >
              Reiniciar chat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

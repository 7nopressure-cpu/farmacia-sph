'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingDown,
  MessageCircle,
  Pill
} from 'lucide-react';
import { Medicamento, PrescriptionAnalysisResponse } from '../lib/types';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSavingsComparator: (med: Medicamento) => void;
}

export default function PrescriptionModal({
  isOpen,
  onClose,
  onOpenSavingsComparator
}: PrescriptionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualDci, setManualDci] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PrescriptionAnalysisResponse | null>(null);
  const [relatedMeds, setRelatedMeds] = useState<Medicamento[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysis(null);
      setErrorMsg('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !manualDci.trim()) {
      setErrorMsg('Por favor selecciona una foto de tu receta o escribe el nombre del medicamento.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setAnalysis(null);
    setRelatedMeds([]);

    try {
      let imageBase64 = '';
      let mimeType = '';

      if (selectedFile) {
        mimeType = selectedFile.type || 'image/jpeg';
        const buffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        imageBase64 = btoa(binary);
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          searchDci: manualDci.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Error al procesar la receta médica');
      }

      const data = await res.json();
      setAnalysis(data.prescriptionDetails);
      setRelatedMeds(data.medicamentos || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No fue posible analizar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setManualDci('');
    setAnalysis(null);
    setRelatedMeds([]);
    setErrorMsg('');
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
              <Camera className="w-5 h-5 text-[#00A3E0]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Lector de Recetas Médicas con IA
              </h2>
              <p className="text-xs text-gray-300">
                Detecta principios activos (DCI) y encuentra equivalentes con máximo ahorro
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
          {!analysis && !loading && (
            <div className="space-y-4">
              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#00A3E0] bg-gray-50 hover:bg-cyan-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-3">
                    <img 
                      src={previewUrl} 
                      alt="Receta médica subida" 
                      className="max-h-56 mx-auto rounded-lg shadow-sm border border-gray-200 object-contain"
                    />
                    <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Imagen cargada ({selectedFile?.name})</span>
                    </p>
                    <span className="text-[11px] text-gray-500 underline">
                      Haz clic para cambiar de foto
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#00A3E0] flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      Sube una foto o captura de tu receta médica
                    </p>
                    <p className="text-xs text-gray-500">
                      Formatos JPG, PNG o fotografía directa desde tu celular
                    </p>
                  </div>
                )}
              </div>

              {/* Or manual DCI search */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-xs text-gray-400 uppercase font-semibold">
                  O escribe el nombre prescrito
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <input
                  type="text"
                  value={manualDci}
                  onChange={(e) => setManualDci(e.target.value)}
                  placeholder="Ej: Azitromicina 500 mg, Losartán 50 mg, Amoxicilina..."
                  className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile && !manualDci.trim()}
                className="w-full py-3.5 rounded-xl bg-[#0B2B64] hover:bg-[#003876] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Analizar Receta y Buscar Equivalentes</span>
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#0B2B64]/20 border-t-[#00A3E0] animate-spin" />
              <div>
                <h4 className="font-bold text-base text-[#0B2B64]">Analizando caligrafía médica con Gemini Vision...</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Decodificando principio activo, concentración y buscando en el Vademécum Nacional de Bolivia.
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {analysis && (
            <div className="space-y-5">
              {/* Detected info badge */}
              <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#0B2B64] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Principio Activo Identificado (DCI):</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B2B64] text-white">
                    {analysis.concentracion || 'Dosis Detectada'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#0B2B64]">
                  {analysis.dci || 'Medicamento Prescrito'}
                </h3>
                {analysis.orientacion && (
                  <p className="text-xs text-gray-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-cyan-100">
                    <strong>Orientación farmacéutica:</strong> {analysis.orientacion}
                  </p>
                )}
              </div>

              {/* Related Equivalent Medicines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>Alternativas Disponibles en Bolivia ({relatedMeds.length}):</span>
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Ordenado por precio (Menor a Mayor)
                  </span>
                </div>

                {relatedMeds.length === 0 ? (
                  <p className="text-xs text-gray-500 p-4 text-center bg-gray-50 rounded-xl">
                    No se encontraron marcas registradas exactas con ese término. Puedes consultar con nuestro farmacéutico por WhatsApp.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {relatedMeds.slice(0, 10).map((med, idx) => (
                      <div 
                        key={med.id || idx}
                        className="p-3 rounded-xl border border-gray-200 hover:border-[#00A3E0] bg-white hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              med.es_venta_libre 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {med.condicion_venta}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {med.laboratorio}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 my-1.5">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={med.imagen_url || '/assets/medications/paracetamol_500mg_generico.jpg'}
                                alt={med.nombre_comercial}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-sm text-gray-900 leading-snug truncate">
                                {med.nombre_comercial}
                              </h5>
                              <p className="text-xs text-gray-500 truncate">
                                {med.dci_principio_activo} {med.concentracion}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Ref. Bolivia</span>
                            <span className="text-base font-extrabold text-[#0B2B64]">
                              Bs {med.precio_referencial_bs.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenSavingsComparator(med);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                          >
                            <span>Comparar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl"
                >
                  Subir otra receta
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0B2B64] hover:bg-[#003876] rounded-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

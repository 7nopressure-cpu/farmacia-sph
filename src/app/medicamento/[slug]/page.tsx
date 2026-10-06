'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Building2, 
  Pill, 
  FileText, 
  Printer, 
  Share2, 
  Sparkles, 
  Check, 
  ExternalLink,
  MapPin,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Medicamento } from '../../../lib/types';
import { getMedicamentosList } from '../../../lib/supabaseClient';
import { getMedicationsBySlug, slugify, MedicationPageData } from '../../../lib/medicationsHelper';
import TriageModal from '../../../components/TriageModal';
import Footer from '../../../components/Footer';

export default function MedicamentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const [allMeds, setAllMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState<Medicamento | null>(null);
  const [searchNav, setSearchNav] = useState('');
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await getMedicamentosList();
        setAllMeds(list);
      } catch (e) {
        console.error('Error cargando medicamentos:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pageData: MedicationPageData | null = useMemo(() => {
    if (allMeds.length === 0 || !slug) return null;
    return getMedicationsBySlug(decodeURIComponent(slug), allMeds);
  }, [slug, allMeds]);

  // Handle active card selection
  const activeMed: Medicamento | null = useMemo(() => {
    if (selectedMed) return selectedMed;
    if (pageData) return pageData.primaryMed;
    return null;
  }, [selectedMed, pageData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNav.trim()) return;
    const targetSlug = slugify(searchNav.trim());
    window.open(`/medicamento/${encodeURIComponent(targetSlug)}`, '_blank');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A3E0] mb-4" />
        <p className="text-sm font-semibold text-[#0B2B64]">Cargando vademécum de medicamentos en Bolivia...</p>
      </div>
    );
  }

  if (!pageData || !activeMed) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
        {/* Header simple */}
        <header className="bg-[#0B2B64] py-3 px-4 text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-36 bg-white rounded p-1">
                <Image
                  src="/assets/06_Logo_TUFARMACIA_Transparente_Letra11_HD.png"
                  alt="TUFARMACIA"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <Link href="/" className="text-xs text-cyan-300 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </Link>
          </div>
        </header>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
            <AlertCircle className="w-14 h-14 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-black text-gray-900">Medicamento no encontrado</h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              No se encontró un principio activo o marca comercial para el término <strong>"{decodeURIComponent(slug)}"</strong> en la base de datos de 5,471 medicamentos.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full bg-[#0B2B64] text-white text-xs font-bold hover:bg-[#003876] transition-colors"
              >
                Buscar en Vademécum
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { activePrinciple, therapeuticAction, category, subgroup, commercialVariants } = pageData;

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col text-gray-800">
      
      {/* 1. Header con TUFARMACIA y Logo Oficial */}
      <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-200">
        {/* Barra superior de acento */}
        <div className="bg-[#0B2B64] py-2 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300">TUFARMACIA</span>
              <span className="text-gray-300 hidden sm:inline">• Vademécum Oficial AGEMED Bolivia</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-cyan-200">
              <span className="hidden md:inline">Base de Datos: 5.471 Medicamentos</span>
              <button 
                onClick={() => setIsTriageOpen(true)}
                className="bg-[#00A3E0] hover:bg-cyan-400 text-[#0B2B64] font-bold px-2.5 py-0.5 rounded-full text-[10px] transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Consultor IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo Oficial TUFARMACIA */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative h-11 w-44 sm:h-12 sm:w-52">
                <Image
                  src="/assets/06_Logo_TUFARMACIA_Transparente_Letra11_HD.png"
                  alt="TUFARMACIA Bolivia"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Buscador de Nueva Ventana */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-[#00A3E0] pointer-events-none" />
                <input
                  type="text"
                  value={searchNav}
                  onChange={(e) => setSearchNav(e.target.value)}
                  placeholder="busca tu medicamento por nombre comercial o generico..."
                  className="w-full pl-10 pr-24 py-2 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400 text-xs sm:text-sm font-medium rounded-full border border-gray-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1 bg-[#0B2B64] hover:bg-[#003876] text-white text-xs font-bold rounded-full transition-colors"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Back link */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2B64] hover:text-[#00A3E0] px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#0B2B64]">Inicio</Link>
            <span>/</span>
            <span className="text-gray-400">{category}</span>
            <span>/</span>
            <span className="font-bold text-[#0B2B64]">{activePrinciple}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
              <span>{copiedLink ? 'Enlace copiado' : 'Compartir'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Imprimir Ficha</span>
            </button>
          </div>
        </div>

        {/* 3. Hero del Principio Activo y Ficha General */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Izquierda: Información Principal del Principio Activo */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Badges de Categoría y Venta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B2B64] text-white">
                  {category}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeMed.es_venta_libre 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {activeMed.es_venta_libre ? 'Venta Libre (OTC)' : 'Bajo Receta Médica'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#00A3E0] border border-blue-100">
                  {commercialVariants.length} {commercialVariants.length === 1 ? 'Opción Comercial' : 'Opciones Comerciales en Bolivia'}
                </span>
              </div>

              {/* Título: Principio Activo (Columna C) */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Principio Activo (DCI)</span>
                <h1 className="text-3xl sm:text-4xl font-black text-[#0B2B64] tracking-tight">
                  {activePrinciple}
                </h1>
              </div>

              {/* Acción Terapéutica (Columna D) */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100">
                <span className="text-xs font-bold text-[#00A3E0] uppercase tracking-wide block mb-1">
                  Acción Terapéutica (Columna D)
                </span>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                  {therapeuticAction || 'Sin especificar'}
                </p>
                {subgroup && subgroup !== therapeuticAction && (
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Subgrupo:</strong> {subgroup}
                  </p>
                )}
              </div>

              {/* Botón Consultor IA para este Fármaco */}
              <div className="pt-1">
                <button
                  onClick={() => setIsTriageOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0B2B64] to-[#00A3E0] hover:from-[#003876] hover:to-cyan-500 text-white font-bold text-xs shadow-sm transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Consultar con IA sobre {activePrinciple}</span>
                </button>
              </div>

            </div>

            {/* Derecha: Imagen Comercial Seleccionada y Precio Referencial */}
            <div className="lg:col-span-4 bg-[#F8FAFC] rounded-2xl p-5 border border-gray-200/80 flex flex-col items-center text-center">
              <div className="relative w-44 h-44 bg-white rounded-xl p-3 border border-gray-100 shadow-2xs mb-3 flex items-center justify-center">
                <img
                  src={activeMed.imagen_url || '/assets/medications/paracetamol_500mg_generico.jpg'}
                  alt={activeMed.nombre_comercial}
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/medications/paracetamol_500mg_generico.jpg';
                  }}
                />
              </div>

              <span className="text-[11px] font-bold text-gray-400 uppercase">Marca en vista:</span>
              <h3 className="font-extrabold text-lg text-[#0B2B64] leading-tight">
                {activeMed.nombre_comercial}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {activeMed.laboratorio}
              </p>

              <div className="mt-3 pt-3 border-t border-gray-200 w-full flex items-baseline justify-center gap-1.5">
                <span className="text-xs text-gray-400">Precio Ref. Bolivia:</span>
                <span className="text-sm font-bold text-[#0B2B64]">Bs</span>
                <span className="text-2xl font-black text-[#0B2B64]">
                  {activeMed.precio_referencial_bs.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 4. TABLA DETALLADA: INFORMACIÓN DE LA BASE DE DATOS medicamentos_bo (COLUMNAS B A L) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-10">
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-gray-100">
            <FileText className="w-5 h-5 text-[#00A3E0]" />
            <div>
              <h2 className="text-lg font-black text-[#0B2B64]">
                Ficha Técnica Oficial del Fármaco (Columnas B a L de medicamentos_bo)
              </h2>
              <p className="text-xs text-gray-500">
                Información técnica registrada en el Catálogo Nacional de Bolivia para <strong>{activeMed.nombre_comercial}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Columna B: Nombre Comercial */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna B • Nombre Comercial
              </span>
              <p className="text-sm font-black text-gray-900 mt-1">{activeMed.nombre_comercial}</p>
            </div>

            {/* Columna C: Principio Activo */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna C • Principio Activo (DCI)
              </span>
              <p className="text-sm font-black text-gray-900 mt-1">{activeMed.dci_principio_activo}</p>
            </div>

            {/* Columna D: Acción Terapéutica */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna D • Acción Terapéutica
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-1">{activeMed.accion_terapeutica || activeMed.grupo_terapeutico || '-'}</p>
            </div>

            {/* Columna E: Categoría Clasificación */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna E • Categoría Clasificación
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-1">{activeMed.categoria_clasificacion || '-'}</p>
            </div>

            {/* Columna F: Subgrupo / Justificación */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna F • Subgrupo / Justificación
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-1">{activeMed.subgrupo_justificacion || '-'}</p>
            </div>

            {/* Columna G: Forma Farmacéutica */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna G • Forma Farmacéutica
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-1">{activeMed.forma_farmaceutica}</p>
            </div>

            {/* Columna H: Laboratorio */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna H • Laboratorio Fabricante
              </span>
              <p className="text-sm font-bold text-[#0B2B64] mt-1">{activeMed.laboratorio}</p>
            </div>

            {/* Columna I: Distribuido por */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna I • Distribuido por
              </span>
              <p className="text-sm font-medium text-gray-800 mt-1">{activeMed.distribuido_por || '-'}</p>
            </div>

            {/* Columna K: Presentaciones */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block">
                Columna K • Presentaciones
              </span>
              <p className="text-sm font-medium text-gray-800 mt-1 whitespace-pre-line">{activeMed.presentaciones || '-'}</p>
            </div>

            {/* Columna J: Fórmula (Span 2) */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 md:col-span-2">
              <span className="text-[11px] font-bold text-[#0B2B64] uppercase block">
                Columna J • Fórmula Farmacológica Completa
              </span>
              <p className="text-xs sm:text-sm font-mono text-gray-800 mt-2 whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-blue-100/60">
                {activeMed.formula || 'Fórmula no especificada en el registro'}
              </p>
            </div>

            {/* Columna L: Dirección Laboratorio */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 md:col-span-1">
              <span className="text-[11px] font-bold text-[#00A3E0] uppercase block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Columna L • Dirección y Contacto</span>
              </span>
              <p className="text-xs text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                {activeMed.direccion_laboratorio || 'Dirección de laboratorio no disponible'}
              </p>
            </div>

          </div>
        </div>

        {/* 5. VARIANTES Y OPCIONES COMERCIALES DISPONIBLES EN BOLIVIA */}
        <div className="space-y-4 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-gray-200">
            <div>
              <span className="text-xs font-bold text-[#00A3E0] uppercase tracking-wider block">Bioequivalencia y Ahorro</span>
              <h2 className="text-2xl font-black text-[#0B2B64] tracking-tight">
                Opciones Comerciales y Marcas Registradas en Bolivia
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Existen <strong>{commercialVariants.length} alternativas registradas</strong> para el principio activo <strong>{activePrinciple}</strong>. Selecciona cualquier marca para ver su ficha completa.
              </p>
            </div>
            <span className="text-xs text-gray-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              {commercialVariants.length} marcas disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commercialVariants.map((variant) => {
              const isSelected = activeMed.id === variant.id;
              const isGeneric = (variant.laboratorio || '').toLowerCase().includes('ifa') ||
                                (variant.laboratorio || '').toLowerCase().includes('cofar') ||
                                (variant.laboratorio || '').toLowerCase().includes('delta') ||
                                (variant.laboratorio || '').toLowerCase().includes('genérico');

              return (
                <div
                  key={variant.id}
                  onClick={() => setSelectedMed(variant)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#00A3E0] shadow-md ring-2 ring-[#00A3E0]/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header card badges */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        variant.es_venta_libre ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {variant.es_venta_libre ? 'OTC' : 'Bajo Receta'}
                      </span>

                      {isGeneric ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>Genérico Ahorro</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400">
                          {variant.forma_farmaceutica.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    {/* Image & Title */}
                    <div className="flex items-center gap-3 my-2">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl p-1.5 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={variant.imagen_url || '/assets/medications/paracetamol_500mg_generico.jpg'}
                          alt={variant.nombre_comercial}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/medications/paracetamol_500mg_generico.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-gray-900 leading-tight truncate">
                          {variant.nombre_comercial}
                        </h4>
                        <p className="text-xs text-[#00A3E0] font-semibold truncate">
                          {variant.laboratorio}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {variant.forma_farmaceutica}
                        </p>
                      </div>
                    </div>

                    {/* Presentation info */}
                    <p className="text-[11px] text-gray-500 line-clamp-2 my-1">
                      <strong>Pres:</strong> {variant.presentaciones || 'Caja estándar'}
                    </p>
                  </div>

                  {/* Bottom price and action */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Precio Ref.</span>
                      <span className="text-sm font-black text-[#0B2B64]">
                        Bs {variant.precio_referencial_bs.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-[#0B2B64] text-white'
                          : 'bg-cyan-50 text-[#0B2B64] hover:bg-[#00A3E0] hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Ficha Activa' : 'Ver Ficha B-L'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer con SnowPoint Healthcare al final de la página */}
      <Footer />

      {/* Triage Modal */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        initialSymptom={`Consulta farmacológica sobre ${activePrinciple} (${activeMed.nombre_comercial})`}
      />
    </div>
  );
}

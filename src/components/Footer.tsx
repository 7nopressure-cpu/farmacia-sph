'use client';

import React from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  PhoneCall, 
  MapPin, 
  Building2, 
  AlertTriangle,
  HeartPulse
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B2B64] text-white pt-12 pb-8 border-t border-[#143D84]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="relative h-12 w-48 bg-white rounded-md p-1.5 flex items-center">
              <Image
                src="/assets/logo.jpg"
                alt="SnowPoint Healthcare Bolivia"
                fill
                className="object-contain object-left px-2"
              />
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Plataforma farmacéutica y de orientación médica digital para el Estado Plurinacional de Bolivia. 
              Promoviendo el acceso transparente a medicamentos esenciales y genéricos de calidad bioequivalente.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <MapPin className="w-4 h-4 text-[#00A3E0]" />
              <span>Sede Central: La Paz - El Alto, Bolivia</span>
            </div>
          </div>

          {/* Col 2: Líneas de Urgencia en Bolivia */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Teléfonos de Urgencia 24h
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                <span>Ambulancias SEDES:</span>
                <a href="tel:168" className="font-extrabold text-red-400 hover:text-red-300">
                  168
                </a>
              </li>
              <li className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                <span>Hospital de Clínicas (Miraflores):</span>
                <a href="tel:2229200" className="font-extrabold text-cyan-300 hover:underline">
                  2229200
                </a>
              </li>
              <li className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                <span>Hospital del Norte (El Alto):</span>
                <a href="tel:2864070" className="font-extrabold text-cyan-300 hover:underline">
                  2864070
                </a>
              </li>
              <li className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                <span>Hospital Obrero CNS N° 1:</span>
                <a href="tel:2224424" className="font-extrabold text-cyan-300 hover:underline">
                  2224424
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Marco Regulatorio Sanitario */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Marco Regulatorio
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Ley N° 1737 del Medicamento (Estado Plurinacional de Bolivia).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Registros sanitarios verificados conforme a normativa AGEMED.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Dispensación de venta bajo receta sujeta a prescripción facultativa.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Laboratorios Bolivianos e Internacionales */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Industria Farmacéutica
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Catálogo integrado con medicamentos de la industria nacional (Laboratorios INTI, Laboratorios Bagó Bolivia, Laboratorios IFA, Laboratorios COFAR, Terbol, Droguería INTI) e importadores autorizados.
            </p>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              💡 <strong>Consejo de ahorro:</strong> Solicita a tu farmacéutico el fármaco genérico equivalente por principio activo (DCI).
            </div>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="my-6 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>DESCARGO DE RESPONSABILIDAD MÉDICA Y LEGAL (LEY 1737):</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            La información contenida en este portal y el asistente clínico de triaje con inteligencia artificial tienen un carácter estrictamente educativo, orientativo y referencial. En ningún caso reemplazan la consulta, diagnóstico, prescripción médica o tratamiento individualizado impartido por un profesional médico colegiado. Ante cualquier síntoma grave, dolor opresivo en el pecho, dificultad respiratoria severa o pérdida del estado de alerta, recurra de inmediato a un centro hospitalario de emergencias.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 pt-4">
          <p>© {new Date().getFullYear()} SnowPoint Healthcare Bolivia - Vademécum Nacional & Consultor IA.</p>
          <p className="text-[11px]">Todos los derechos reservados. Desarrollado para la salud boliviana.</p>
        </div>

      </div>
    </footer>
  );
}

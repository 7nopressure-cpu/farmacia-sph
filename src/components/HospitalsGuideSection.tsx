'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  Clock, 
  ShieldAlert, 
  ExternalLink, 
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Stethoscope
} from 'lucide-react';
import { CentroSalud } from '../lib/types';

interface HospitalsGuideSectionProps {
  centros: CentroSalud[];
}

export default function HospitalsGuideSection({ centros }: HospitalsGuideSectionProps) {
  const [selectedCiudad, setSelectedCiudad] = useState<'all' | 'La Paz' | 'El Alto'>('all');
  const [searchEsp, setSearchEsp] = useState('');

  const normalize = (str: string) =>
    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredCentros = useMemo(() => {
    let list = centros;

    if (selectedCiudad !== 'all') {
      list = list.filter(c => c.ciudad.toLowerCase() === selectedCiudad.toLowerCase());
    }

    if (searchEsp.trim()) {
      const q = normalize(searchEsp.trim());
      list = list.filter(c => {
        const nom = normalize(c.nombre);
        const esp = c.especialidades.some(e => normalize(e).includes(q));
        const zona = normalize(c.zona);
        return nom.includes(q) || esp || zona.includes(q);
      });
    }

    return list;
  }, [centros, selectedCiudad, searchEsp]);

  return (
    <section id="hospitales-section" className="py-14 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00A3E0] mb-1">
              <Building2 className="w-4 h-4" />
              <span>Red Sanitaria Pública y Seguro Social</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2B64]">
              Guía de Derivación y Hospitales: La Paz & El Alto
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Información de contacto inmediato, salas de urgencias 24/7 y carteras de especialidades médicas para pacientes referidos por el triaje clínico.
            </p>
          </div>

          {/* Emergency Line Quick Card */}
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-3 rounded-2xl">
            <div className="p-2.5 rounded-xl bg-red-600 text-white">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                Central de Emergencias Bolivia
              </span>
              <a 
                href="tel:168"
                className="text-lg font-black text-red-700 hover:underline flex items-center gap-1"
              >
                <span>168 (Ambulancias SEDES)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
          {/* City Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase mr-1">Ciudad:</span>
            <button
              onClick={() => setSelectedCiudad('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCiudad === 'all'
                  ? 'bg-[#0B2B64] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Todos ({centros.length})
            </button>
            <button
              onClick={() => setSelectedCiudad('La Paz')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCiudad === 'La Paz'
                  ? 'bg-[#0B2B64] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              La Paz
            </button>
            <button
              onClick={() => setSelectedCiudad('El Alto')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCiudad === 'El Alto'
                  ? 'bg-[#0B2B64] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              El Alto
            </button>
          </div>

          {/* Specialty filter input */}
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchEsp}
              onChange={(e) => setSearchEsp(e.target.value)}
              placeholder="Filtrar por especialidad (ej: Cardiología, Pediatría)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#00A3E0] text-gray-800"
            />
          </div>
        </div>

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCentros.map((centro) => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centro.nombre} ${centro.ciudad} Bolivia`)}`;

            return (
              <div
                key={centro.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#00A3E0] shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0B2B64] border border-blue-200">
                      {centro.ciudad} • {centro.zona}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {centro.nivel_atencion.split(' ')[0]} {centro.nivel_atencion.split(' ')[1] || ''}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                    {centro.nombre}
                  </h3>

                  {/* Institution type */}
                  <p className="text-xs text-[#00A3E0] font-semibold mt-0.5">
                    {centro.tipo_institucion}
                  </p>

                  {/* Address */}
                  <div className="mt-3 text-xs text-gray-600 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{centro.direccion}</span>
                  </div>

                  {/* Hours */}
                  <div className="mt-2 text-xs text-gray-600 flex items-start gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-700">{centro.horario_atencion}</span>
                  </div>

                  {/* Specialties chips */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Especialidades Disponibles:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {centro.especialidades.map((esp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-700"
                        >
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact and Actions Footer */}
                <div className="mt-5 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-red-600 font-bold block uppercase">
                        Urgencias 24h:
                      </span>
                      <a
                        href={`tel:${centro.telefono_urgencias.replace(/[^\d+]/g, '')}`}
                        className="text-sm font-extrabold text-gray-900 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                        <span>{centro.telefono_urgencias}</span>
                      </a>
                    </div>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B2B64] bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                    >
                      <span>Mapa</span>
                      <ExternalLink className="w-3 h-3 text-[#00A3E0]" />
                    </a>
                  </div>

                  <a
                    href={`tel:${centro.telefono_urgencias.replace(/[^\d+]/g, '')}`}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Llamar a Urgencias de este Centro</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

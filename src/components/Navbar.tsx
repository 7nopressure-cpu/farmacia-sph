'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneCall, MapPin, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenTriage?: () => void;
  onScrollToHospitals?: () => void;
}

export default function Navbar({ onOpenTriage, onScrollToHospitals }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B2545] border-b border-[#0e3057] shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 md:py-5 flex items-center justify-between">
        
        {/* Left: Cobertura geográfica oficial */}
        <div className="flex items-center gap-2 text-xs text-cyan-200/90 font-medium flex-1 justify-start">
          <MapPin className="w-4 h-4 text-[#00A3E0]" />
          <span className="hidden sm:inline font-semibold">La Paz • El Alto, Bolivia</span>
          <span className="sm:hidden text-[11px] font-semibold">Bolivia</span>
        </div>

        {/* Center: Logotipo Oficial 01_Logo_TUFARMACIA_Fondo_Azul_Letra11_HD (Ampliado) */}
        <div className="flex justify-center items-center flex-shrink-0">
          <Link href="/" className="relative block h-16 w-56 sm:h-20 sm:w-72 md:h-24 md:w-96 lg:h-28 lg:w-[420px] transition-transform hover:scale-[1.02]">
            <Image 
              src="/assets/01_Logo_TUFARMACIA_Fondo_Azul_Letra11_HD.png" 
              alt="TUFARMACIA Bolivia" 
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Right: Acciones rápidas (Ambulancias y Consultor IA) */}
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          {onOpenTriage && (
            <button
              onClick={onOpenTriage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black text-[#0B2545] bg-cyan-400 hover:bg-cyan-300 transition-all active:scale-95 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consultor IA</span>
            </button>
          )}

          <a
            href="tel:168"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-[11px] font-bold transition-all"
            title="Llamar a Emergencias SEDES Bolivia"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span>SEDES 168</span>
          </a>
        </div>

      </div>
    </header>
  );
}

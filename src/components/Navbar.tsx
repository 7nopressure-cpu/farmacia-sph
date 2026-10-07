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
    <header className="sticky top-0 z-40 bg-[#0B2B64] border-b border-[#143D84] shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        
        {/* Left: Cobertura geográfica oficial */}
        <div className="flex items-center gap-2 text-xs text-cyan-200/90 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span className="hidden sm:inline">La Paz • El Alto, Bolivia</span>
          <span className="sm:hidden text-[11px]">Bolivia</span>
        </div>

        {/* Center: Logotipo Oficial 01_Logo_TUFARMACIA_Fondo_Azul_Letra11_HD */}
        <div className="flex justify-center items-center">
          <Link href="/" className="relative block h-10 w-48 sm:h-12 sm:w-64 transition-transform hover:scale-105">
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
        <div className="flex items-center gap-2">
          {onOpenTriage && (
            <button
              onClick={onOpenTriage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0B2B64] bg-cyan-400 hover:bg-cyan-300 transition-all active:scale-95 shadow-sm"
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
            <PhoneCall className="w-3 h-3 text-red-400" />
            <span>SEDES 168</span>
          </a>
        </div>

      </div>
    </header>
  );
}

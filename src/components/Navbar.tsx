'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Search, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Sparkles, 
  Camera, 
  MessageCircle, 
  X,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenTriage: () => void;
  onOpenPrescription: () => void;
  onScrollToHospitals: () => void;
}

export const CATEGORIES = [
  { id: 'todos', label: 'Todos los Fármacos' },
  { id: 'otc', label: 'Venta Libre (OTC)' },
  { id: 'antiinfecciosos', label: 'Antiinfecciosos' },
  { id: 'cardiovasculares', label: 'Cardiovasculares' },
  { id: 'respiratorios', label: 'Respiratorios' },
  { id: 'analgesicos', label: 'Analgésicos y Gripes' },
  { id: 'digestivos', label: 'Gastrointestinales' },
  { id: 'hospitales', label: '🏥 Especialidades y Hospitales' },
];

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenTriage,
  onOpenPrescription,
  onScrollToHospitals
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (catId: string) => {
    if (catId === 'hospitales') {
      onScrollToHospitals();
    } else {
      onSelectCategory(catId);
      const vademecumEl = document.getElementById('vademecum-section');
      if (vademecumEl) {
        vademecumEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola Farmacia SnowPoint Bolivia, deseo realizar una consulta sobre disponibilidad y precios de medicamentos.');
    window.open(`https://wa.me/59170000000?text=${message}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm transition-all border-b border-gray-100">
      {/* 1. Top Bar: Farmacorp Style Location & Urgent Notice */}
      <div className="bg-[#0B2B64] text-white text-xs py-1.5 px-4 sm:px-8 border-b border-[#143D84]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 font-medium text-cyan-300">
              <MapPin className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Cobertura: La Paz / El Alto, Bolivia</span>
            </span>
            <span className="hidden md:flex items-center gap-1 text-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-300" />
              <span>Atención y Despacho Digital 24/7</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="tel:168" 
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-2 py-0.5 rounded text-[11px] transition-colors"
            >
              <PhoneCall className="w-3 h-3 animate-pulse" />
              <span>Ambulancias SEDES: 168</span>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1 text-gray-300 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Normativa AGEMED - Ley 1737</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo Corporativo SnowPoint Healthcare */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="flex items-center gap-2 group">
              <div className="relative h-12 w-48 sm:h-14 sm:w-56 overflow-hidden rounded-md bg-white flex items-center">
                <Image 
                  src="/assets/logo.jpg" 
                  alt="SnowPoint Healthcare Bolivia" 
                  fill
                  className="object-contain object-left transition-transform group-hover:scale-105"
                  priority
                />
              </div>
            </a>
          </div>

          {/* Central Prominent Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-5 w-5 text-[#00A3E0]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por síntoma, principio activo (DCI) o marca comercial..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#F4F6F8] hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400 text-sm font-medium rounded-full border border-gray-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Consultor IA */}
            <button
              onClick={onOpenTriage}
              className="relative inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#0B2B64] via-[#003876] to-[#00A3E0] hover:shadow-md hover:shadow-cyan-500/20 active:scale-95 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Consultor IA</span>
              <span className="sm:hidden">IA</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A3E0]"></span>
              </span>
            </button>

            {/* Subir Receta */}
            <button
              onClick={onOpenPrescription}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#0B2B64] bg-[#F4F6F8] hover:bg-gray-100 border border-gray-200 hover:border-gray-300 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4 text-[#00A3E0]" />
              <span>Subir Receta</span>
            </button>

            {/* WhatsApp Farmacia */}
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 shadow-sm active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Bar (Farmacorp-Style Chips) */}
      <div className="bg-[#F8FAFC] border-t border-gray-100 py-2 px-4 sm:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 whitespace-nowrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0B2B64] text-white shadow-sm ring-1 ring-[#0B2B64]'
                    : 'bg-white text-gray-600 hover:text-[#0B2B64] hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

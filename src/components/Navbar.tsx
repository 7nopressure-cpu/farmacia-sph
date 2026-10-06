'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  X
} from 'lucide-react';
import { slugify, DRUG_CATEGORIES } from '../lib/medicationsHelper';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenTriage: () => void;
  onScrollToHospitals: () => void;
}

export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'otc', label: 'Venta Libre (OTC)' },
  ...DRUG_CATEGORIES.map(cat => ({ id: cat, label: cat })),
  { id: 'hospitales', label: '🏥 Especialidades y Hospitales' },
];

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenTriage,
  onScrollToHospitals
}: NavbarProps) {

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const targetSlug = slugify(searchQuery.trim());
      window.open(`/medicamento/${encodeURIComponent(targetSlug)}`, '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm transition-all border-b border-gray-100">
      {/* 1. Barra Superior Destacada: TUFARMACIA */}
      <div className="bg-[#0B2B64] py-2 sm:py-2.5 px-4 border-b border-[#143D84] text-center shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm select-none">
            TU<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-[#00A3E0]">FARMACIA</span>
          </span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo Oficial TUFARMACIA (reemplaza a SnowPoint Healthcare en el encabezado) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-11 w-44 sm:h-13 sm:w-56 overflow-hidden rounded-md bg-white flex items-center">
                <Image 
                  src="/assets/06_Logo_TUFARMACIA_Transparente_Letra11_HD.png" 
                  alt="TUFARMACIA Bolivia" 
                  fill
                  className="object-contain object-left transition-transform group-hover:scale-105"
                  priority
                />
              </div>
            </Link>
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
                onKeyDown={handleSearchKeyDown}
                placeholder="busca tu medicamento por nombre comercial o generico"
                className="w-full pl-11 pr-10 py-2.5 bg-[#F4F6F8] hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400 text-xs sm:text-sm font-medium rounded-full border border-gray-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all shadow-inner"
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

          {/* Quick Action Button: Consultor IA */}
          <div className="flex items-center">
            <button
              onClick={onOpenTriage}
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0B2B64] via-[#003876] to-[#00A3E0] hover:shadow-md hover:shadow-cyan-500/20 active:scale-95 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span>Consultor IA</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A3E0]"></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Bar (Chips) con las 11 Categorías de la Base de Datos */}
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

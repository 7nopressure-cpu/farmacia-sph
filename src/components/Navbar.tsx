'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#0B2545] border-b border-[#0e3057] shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-1.5 flex items-center justify-center">
        {/* Logotipo Oficial 01_Logo_TUFARMACIA_Fondo_Azul_Letra11_HD ceñido y ajustado */}
        <Link 
          href="/" 
          className="relative block h-14 w-44 sm:h-16 sm:w-52 md:h-18 md:w-60 lg:h-20 lg:w-64 transition-transform hover:scale-[1.01]"
          title="TUFARMACIA Bolivia"
        >
          <Image 
            src="/assets/01_Logo_TUFARMACIA_Fondo_Azul_Letra11_HD.png" 
            alt="TUFARMACIA Bolivia" 
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>
    </header>
  );
}

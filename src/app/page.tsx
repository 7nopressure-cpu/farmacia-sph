'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HospitalsGuideSection from '../components/HospitalsGuideSection';
import Footer from '../components/Footer';
import TriageModal from '../components/TriageModal';
import { Medicamento, CentroSalud } from '../lib/types';
import { getMedicamentosList, getCentrosSaludList } from '../lib/supabaseClient';

export default function HomePage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [initialTriageSymptom, setInitialTriageSymptom] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [medsData, centrosData] = await Promise.all([
          getMedicamentosList(),
          getCentrosSaludList()
        ]);
        setMedicamentos(medsData);
        setCentros(centrosData);
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenTriage = (symptom?: string) => {
    if (symptom) {
      setInitialTriageSymptom(symptom);
    } else {
      setInitialTriageSymptom('');
    }
    setIsTriageOpen(true);
  };

  const handleScrollToHospitals = () => {
    const el = document.getElementById('hospitales-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Barra Superior con Logotipo Oficial ceñido al logo */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Sección Hero Unificada y Llamativa (Fila 2 y 3 unificadas) */}
        <HeroSection
          onStartTriage={handleOpenTriage}
          onExploreHospitals={handleScrollToHospitals}
          medicamentos={medicamentos}
        />

        {/* 3. Guía de Derivación, Especialidades y Hospitales (La Paz y El Alto) */}
        <HospitalsGuideSection centros={centros} />
      </main>

      {/* 4. Footer Oficial con SnowPoint Healthcare Bolivia, Ley 1737 y AGEMED */}
      <Footer />

      {/* Modal Clínico de Triaje con IA Médica */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        initialSymptom={initialTriageSymptom}
        onSearchInVademecum={(term) => {
          window.open(`/medicamento/${encodeURIComponent(term)}`, '_blank');
        }}
        onViewHospitals={handleScrollToHospitals}
      />
    </div>
  );
}

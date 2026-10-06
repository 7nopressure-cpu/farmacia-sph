'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import VademecumSection from '../components/VademecumSection';
import HospitalsGuideSection from '../components/HospitalsGuideSection';
import Footer from '../components/Footer';
import TriageModal from '../components/TriageModal';
import SavingsComparatorModal from '../components/SavingsComparatorModal';
import { Medicamento, CentroSalud } from '../lib/types';
import { getMedicamentosList, getCentrosSaludList } from '../lib/supabaseClient';
import { 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Building2 
} from 'lucide-react';

export default function HomePage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Modal States
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [initialTriageSymptom, setInitialTriageSymptom] = useState('');
  const [selectedMedForSavings, setSelectedMedForSavings] = useState<Medicamento | null>(null);
  const [isSavingsComparatorOpen, setIsSavingsComparatorOpen] = useState(false);

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

  const handleSearchInVademecum = (term: string) => {
    setSearchQuery(term);
    setSelectedCategory('todos');
    const el = document.getElementById('vademecum-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHospitals = () => {
    const el = document.getElementById('hospitales-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenSavingsComparator = (med: Medicamento) => {
    setSelectedMedForSavings(med);
    setIsSavingsComparatorOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar with prominent TUFARMACIA top bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenTriage={() => handleOpenTriage()}
        onScrollToHospitals={handleScrollToHospitals}
      />

      <main className="flex-1">
        {/* Hero Section with Search, 11 Categories Dropdown and Clinical AI Starter */}
        <HeroSection
          onStartTriage={handleOpenTriage}
          onExploreVademecum={() => {
            const el = document.getElementById('vademecum-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('vademecum-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          medicamentos={medicamentos}
        />

        {/* Vademecum Section */}
        <VademecumSection
          medicamentos={medicamentos}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onOpenSavingsComparator={handleOpenSavingsComparator}
        />

        {/* Hospitals & Centers Guide Section */}
        <HospitalsGuideSection centros={centros} />
      </main>

      {/* Footer with Ley 1737 and Health Authorities */}
      <Footer />

      {/* Clinical AI Triage Modal */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        initialSymptom={initialTriageSymptom}
        onSearchInVademecum={handleSearchInVademecum}
        onViewHospitals={handleScrollToHospitals}
      />

      {/* Savings Comparator Modal */}
      <SavingsComparatorModal
        isOpen={isSavingsComparatorOpen}
        onClose={() => setIsSavingsComparatorOpen(false)}
        selectedMed={selectedMedForSavings}
        allMedicamentos={medicamentos}
      />
    </div>
  );
}

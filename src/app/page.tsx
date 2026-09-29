'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import VademecumSection from '../components/VademecumSection';
import HospitalsGuideSection from '../components/HospitalsGuideSection';
import Footer from '../components/Footer';
import TriageModal from '../components/TriageModal';
import PrescriptionModal from '../components/PrescriptionModal';
import SavingsComparatorModal from '../components/SavingsComparatorModal';
import { Medicamento, CentroSalud } from '../lib/types';
import { getMedicamentosList, getCentrosSaludList } from '../lib/supabaseClient';
import { 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Building2, 
  HeartHandshake, 
  HelpCircle 
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
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
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
      {/* Navbar with Farmacorp Aesthetic */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenTriage={() => handleOpenTriage()}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onScrollToHospitals={handleScrollToHospitals}
      />

      <main className="flex-1">
        {/* Hero Section with Official SnowPoint Banner and Quick Triage Starter */}
        <HeroSection
          onStartTriage={handleOpenTriage}
          onExploreVademecum={() => {
            const el = document.getElementById('vademecum-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Trust Badges / Farmacorp Values Bar */}
        <section className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00A3E0] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">+5,400 Fármacos</h4>
                  <p className="text-xs text-gray-500">Registro Oficial AGEMED</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Ahorro Bioequivalente</h4>
                  <p className="text-xs text-gray-500">Hasta 70% en Genéricos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0B2B64] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-[#00A3E0]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Triaje Médico con IA</h4>
                  <p className="text-xs text-gray-500">Orientación Clínica 24/7</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#00A3E0] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-[#0B2B64]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Hospitales de La Paz</h4>
                  <p className="text-xs text-gray-500">Urgencias y Especialidades</p>
                </div>
              </div>

            </div>
          </div>
        </section>

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

      {/* Prescription Reader Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        onOpenSavingsComparator={handleOpenSavingsComparator}
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

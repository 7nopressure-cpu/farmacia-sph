import { Medicamento } from './types';

export function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugify(str: string): string {
  return normalizeText(str)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const DRUG_CATEGORIES = [
  'Sistema Nervioso',
  'Antiinfecciosos en General',
  'Sistema Cardiovascular',
  'Aparato Digestivo y Metabolismo',
  'Sistema Respiratorio',
  'Sangre y Órganos Hematopoyéticos',
  'Sistema Endocrino (Hormonas)',
  'Sistema Genitourinario y Hormonas Sexuales',
  'Dermatológicos',
  'Preparados Organoplásmicos',
  'No Medicamentos',
] as const;

export interface MedicationPageData {
  primaryMed: Medicamento;
  activePrinciple: string;
  therapeuticAction: string;
  category: string;
  subgroup: string;
  commercialVariants: Medicamento[];
  selectedBrandName?: string;
}

export function getMedicationsBySlug(slug: string, allMeds: Medicamento[]): MedicationPageData | null {
  if (!slug || !allMeds || allMeds.length === 0) return null;

  const cleanSlug = slugify(slug);
  const cleanQuery = normalizeText(slug);

  // 1. Direct match by ID
  const byId = allMeds.find(m => m.id?.toString() === slug);
  if (byId) {
    const dci = (byId.dci_principio_activo || '').trim();
    const variants = (dci && dci !== '-')
      ? allMeds.filter(m => normalizeText(m.dci_principio_activo) === normalizeText(dci))
      : [byId];

    return {
      primaryMed: byId,
      activePrinciple: dci !== '-' ? dci : byId.nombre_comercial,
      therapeuticAction: byId.accion_terapeutica || byId.grupo_terapeutico || 'Fármaco registrado en Bolivia',
      category: byId.categoria_clasificacion || 'Medicamentos en General',
      subgroup: byId.subgrupo_justificacion || byId.forma_farmaceutica || '',
      commercialVariants: variants,
      selectedBrandName: byId.nombre_comercial
    };
  }

  // 2. Direct match by DCI (Principio Activo)
  const matchingByDci = allMeds.filter(m => {
    const dci = (m.dci_principio_activo || '').trim();
    if (!dci || dci === '-') return false;
    return slugify(dci) === cleanSlug || normalizeText(dci) === cleanQuery;
  });

  if (matchingByDci.length > 0) {
    const primary = matchingByDci[0];
    return {
      primaryMed: primary,
      activePrinciple: primary.dci_principio_activo,
      therapeuticAction: primary.accion_terapeutica || primary.grupo_terapeutico || 'Fármaco registrado en Bolivia',
      category: primary.categoria_clasificacion || 'Medicamentos en General',
      subgroup: primary.subgrupo_justificacion || primary.forma_farmaceutica || '',
      commercialVariants: matchingByDci
    };
  }

  // 3. Match by Nombre Comercial (Brand Name)
  const byBrand = allMeds.find(m => {
    return slugify(m.nombre_comercial) === cleanSlug || normalizeText(m.nombre_comercial) === cleanQuery;
  });

  if (byBrand) {
    const dci = (byBrand.dci_principio_activo || '').trim();
    const variants = (dci && dci !== '-')
      ? allMeds.filter(m => normalizeText(m.dci_principio_activo) === normalizeText(dci))
      : [byBrand];

    return {
      primaryMed: byBrand,
      activePrinciple: dci !== '-' ? dci : byBrand.nombre_comercial,
      therapeuticAction: byBrand.accion_terapeutica || byBrand.grupo_terapeutico || 'Fármaco registrado en Bolivia',
      category: byBrand.categoria_clasificacion || 'Medicamentos en General',
      subgroup: byBrand.subgrupo_justificacion || byBrand.forma_farmaceutica || '',
      commercialVariants: variants,
      selectedBrandName: byBrand.nombre_comercial
    };
  }

  // 4. Partial substring match in DCI or Brand
  const partial = allMeds.find(m => {
    const dci = normalizeText(m.dci_principio_activo);
    const nom = normalizeText(m.nombre_comercial);
    return (dci.includes(cleanQuery) && dci !== '-') || nom.includes(cleanQuery);
  });

  if (partial) {
    const dci = (partial.dci_principio_activo || '').trim();
    const variants = (dci && dci !== '-')
      ? allMeds.filter(m => normalizeText(m.dci_principio_activo) === normalizeText(dci))
      : [partial];

    return {
      primaryMed: partial,
      activePrinciple: dci !== '-' ? dci : partial.nombre_comercial,
      therapeuticAction: partial.accion_terapeutica || partial.grupo_terapeutico || 'Fármaco registrado en Bolivia',
      category: partial.categoria_clasificacion || 'Medicamentos en General',
      subgroup: partial.subgrupo_justificacion || partial.forma_farmaceutica || '',
      commercialVariants: variants,
      selectedBrandName: partial.nombre_comercial
    };
  }

  return null;
}

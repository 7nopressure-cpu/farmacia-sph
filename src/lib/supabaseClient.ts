import { createClient } from '@supabase/supabase-js';
import { Medicamento, CentroSalud } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cache memory for fallback
let cachedMedicamentos: Medicamento[] | null = null;
let cachedCentros: CentroSalud[] | null = null;

export async function getMedicamentosList(): Promise<Medicamento[]> {
  // If Supabase is configured, try querying it first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .order('id', { ascending: true })
        .limit(2000);

      if (!error && data && data.length > 0) {
        return data as Medicamento[];
      }
      if (error) {
        console.warn('Nota Supabase medicamentos:', error.message);
      }
    } catch (e) {
      console.warn('Excepción al consultar Supabase, usando catálogo local:', e);
    }
  }

  // Graceful fallback to client JSON dataset
  if (cachedMedicamentos) return cachedMedicamentos;

  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/data/medicamentos_sample.json');
      if (res.ok) {
        const json = await res.json();
        cachedMedicamentos = json;
        return json;
      }
    } else {
      // Server-side
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'medicamentos_sample.json');
      if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        cachedMedicamentos = json;
        return json;
      }
    }
  } catch (err) {
    console.error('Error cargando medicamentos fallback:', err);
  }

  return [];
}

export async function getCentrosSaludList(): Promise<CentroSalud[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('centros_y_especialidades')
        .select('*')
        .order('destacado', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as CentroSalud[];
      }
      if (error) {
        console.warn('Nota Supabase centros:', error.message);
      }
    } catch (e) {
      console.warn('Excepción al consultar centros en Supabase:', e);
    }
  }

  if (cachedCentros) return cachedCentros;

  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/data/centros_especialidades.json');
      if (res.ok) {
        const json = await res.json();
        cachedCentros = json;
        return json;
      }
    } else {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'centros_especialidades.json');
      if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        cachedCentros = json;
        return json;
      }
    }
  } catch (err) {
    console.error('Error cargando centros fallback:', err);
  }

  return [];
}

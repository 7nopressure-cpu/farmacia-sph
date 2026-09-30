import { createClient } from '@supabase/supabase-js';
import { Medicamento, CentroSalud } from './types';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cache memory for fast catalog access
let cachedMedicamentos: Medicamento[] | null = null;
let cachedCentros: CentroSalud[] | null = null;

export async function getMedicamentosList(): Promise<Medicamento[]> {
  // If memory cached, return instantly
  if (cachedMedicamentos && cachedMedicamentos.length >= 5000) {
    return cachedMedicamentos;
  }

  // If Supabase is configured, try querying it
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .order('id', { ascending: true })
        .limit(6000);

      if (!error && data && data.length >= 4000) {
        cachedMedicamentos = data as Medicamento[];
        return cachedMedicamentos;
      }
      if (error) {
        console.warn('Nota Supabase medicamentos:', error.message);
      }
    } catch (e) {
      console.warn('Excepción al consultar Supabase, usando catálogo completo local:', e);
    }
  }

  // Load complete 5,472 items from local JSON dataset
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/data/medicamentos_full.json');
      if (res.ok) {
        const json = await res.json();
        cachedMedicamentos = json;
        return json;
      }
      // Fallback to sample if full isn't reachable
      const resSample = await fetch('/data/medicamentos_sample.json');
      if (resSample.ok) {
        return await resSample.json();
      }
    } else {
      // Server-side
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(process.cwd(), 'public', 'data', 'medicamentos_full.json');
      if (fs.existsSync(fullPath)) {
        const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        cachedMedicamentos = json;
        return json;
      }
      const samplePath = path.join(process.cwd(), 'public', 'data', 'medicamentos_sample.json');
      if (fs.existsSync(samplePath)) {
        const json = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
        cachedMedicamentos = json;
        return json;
      }
    }
  } catch (err) {
    console.error('Error cargando medicamentos full:', err);
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

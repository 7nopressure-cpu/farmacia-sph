import { NextResponse } from 'next/server';
import { supabase, getMedicamentosList } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const dci = (searchParams.get('dci') || '').trim();
    const lab = (searchParams.get('lab') || '').trim();
    const condicion = (searchParams.get('condicion') || '').trim();
    const categoria = (searchParams.get('categoria') || '').trim();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    // 1. Try querying Supabase directly with ilike if available
    if (supabase) {
      try {
        let query = supabase.from('medicamentos').select('*', { count: 'exact' });

        if (q) {
          query = query.or(`nombre_comercial.ilike.%${q}%,dci_principio_activo.ilike.%${q}%,laboratorio.ilike.%${q}%`);
        }
        if (dci) {
          query = query.ilike('dci_principio_activo', `%${dci}%`);
        }
        if (lab) {
          query = query.ilike('laboratorio', `%${lab}%`);
        }
        if (condicion === 'otc' || condicion === 'venta_libre') {
          query = query.eq('es_venta_libre', true);
        } else if (condicion === 'receta') {
          query = query.eq('es_venta_libre', false);
        }
        if (categoria && categoria.toLowerCase() !== 'todos') {
          query = query.ilike('grupo_terapeutico', `%${categoria}%`);
        }

        query = query.order('id', { ascending: true }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (!error && data && data.length > 0) {
          return NextResponse.json({
            source: 'supabase',
            total: count ?? data.length,
            limit,
            offset,
            medicamentos: data
          });
        }
      } catch (sbErr) {
        console.warn('Supabase query error, switching to fast in-memory full catalog:', sbErr);
      }
    }

    // 2. High-speed in-memory search over complete 5,472 dataset
    const all = await getMedicamentosList();

    const normalize = (str: string) =>
      (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let filtered = all;

    if (q) {
      const cleanQ = normalize(q);
      filtered = filtered.filter(m => {
        const nom = normalize(m.nombre_comercial);
        const princ = normalize(m.dci_principio_activo);
        const labName = normalize(m.laboratorio);
        const accion = normalize(m.grupo_terapeutico);
        const ind = normalize(m.indicaciones_principales);
        return nom.includes(cleanQ) || princ.includes(cleanQ) || labName.includes(cleanQ) || accion.includes(cleanQ) || ind.includes(cleanQ);
      });
    }

    if (dci) {
      const cleanDci = normalize(dci);
      filtered = filtered.filter(m => normalize(m.dci_principio_activo).includes(cleanDci));
    }

    if (lab) {
      const cleanLab = normalize(lab);
      filtered = filtered.filter(m => normalize(m.laboratorio).includes(cleanLab));
    }

    if (condicion === 'otc' || condicion === 'venta_libre') {
      filtered = filtered.filter(m => m.es_venta_libre === true);
    } else if (condicion === 'receta') {
      filtered = filtered.filter(m => m.es_venta_libre === false);
    }

    if (categoria && categoria.toLowerCase() !== 'todos') {
      const cleanCat = normalize(categoria);
      filtered = filtered.filter(m => {
        const accion = normalize(m.grupo_terapeutico);
        return accion.includes(cleanCat);
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      source: 'catalog_5472',
      total,
      limit,
      offset,
      medicamentos: paginated
    });
  } catch (error: any) {
    console.error('Error en /api/medicamentos:', error);
    return NextResponse.json({ error: error.message, medicamentos: [] }, { status: 500 });
  }
}

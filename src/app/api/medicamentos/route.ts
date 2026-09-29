import { NextResponse } from 'next/server';
import { getMedicamentosList } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const dci = (searchParams.get('dci') || '').trim().toLowerCase();
    const lab = (searchParams.get('lab') || '').trim().toLowerCase();
    const condicion = searchParams.get('condicion') || '';
    const categoria = searchParams.get('categoria') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const all = await getMedicamentosList();

    const normalize = (str: string) =>
      (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let filtered = all;

    if (q) {
      const cleanQ = normalize(q);
      filtered = filtered.filter(m => {
        const nom = normalize(m.nombre_comercial);
        const princ = normalize(m.dci_principio_activo);
        const accion = normalize(m.grupo_terapeutico);
        const ind = normalize(m.indicaciones_principales);
        return nom.includes(cleanQ) || princ.includes(cleanQ) || accion.includes(cleanQ) || ind.includes(cleanQ);
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

    if (categoria && categoria !== 'todos') {
      const cleanCat = normalize(categoria);
      filtered = filtered.filter(m => {
        const accion = normalize(m.grupo_terapeutico);
        return accion.includes(cleanCat);
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
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

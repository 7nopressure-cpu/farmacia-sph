import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let rawUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

    if (!rawUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const filePath = path.join(process.cwd(), 'public', 'data', 'medicamentos_full.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'medicamentos_full.json not found' }, { status: 500 });
    }

    const allMeds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    const slice = allMeds.slice(offset, offset + limit);

    // Map strictly to Supabase table schema (exclude non-existent columns like imagen_url)
    const mappedBatch = slice.map((m: any) => ({
      id: m.id,
      nombre_comercial: m.nombre_comercial || 'Medicamento',
      dci_principio_activo: m.dci_principio_activo || 'Principio no especificado',
      concentracion: m.concentracion || 'Estándar',
      forma_farmaceutica: m.forma_farmaceutica || 'Comprimidos',
      laboratorio: m.laboratorio || 'Laboratorio Registrado',
      registro_sanitario: m.registro_sanitario || 'NN-30000/2024',
      es_generico: (m.laboratorio || '').toLowerCase().includes('ifa') || (m.laboratorio || '').toLowerCase().includes('cofar') || (m.laboratorio || '').toLowerCase().includes('genérico'),
      precio_referencial_bs: m.precio_referencial_bs || 14.50,
      condicion_venta: m.condicion_venta || 'Bajo Receta Médica',
      es_venta_libre: Boolean(m.es_venta_libre),
      grupo_terapeutico: m.grupo_terapeutico || '',
      indicaciones_principales: m.indicaciones_principales || '',
      activo: true
    }));

    // PostgREST upsert
    const res = await fetch(`${rawUrl}/rest/v1/medicamentos`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(mappedBatch)
    });

    const status = res.status;
    let responseText = '';
    try {
      responseText = await res.text();
    } catch (e) {}

    return NextResponse.json({
      success: res.ok,
      status,
      offset,
      batchSize: mappedBatch.length,
      totalCatalog: allMeds.length,
      hasMore: offset + limit < allMeds.length,
      nextOffset: offset + limit,
      response: responseText || 'OK'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

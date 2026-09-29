import { NextResponse } from 'next/server';
import { getCentrosSaludList } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ciudad = searchParams.get('ciudad');
    const especialidad = searchParams.get('especialidad');

    let centros = await getCentrosSaludList();

    if (ciudad) {
      centros = centros.filter(c => c.ciudad.toLowerCase() === ciudad.toLowerCase());
    }

    if (especialidad) {
      const espClean = especialidad.toLowerCase();
      centros = centros.filter(c => 
        c.especialidades.some(e => e.toLowerCase().includes(espClean))
      );
    }

    return NextResponse.json({ centros });
  } catch (error: any) {
    console.error('Error en /api/especialidades:', error);
    return NextResponse.json({ error: error.message, centros: [] }, { status: 500 });
  }
}

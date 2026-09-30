import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow Vercel function to run up to 60s

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('key');
    // Simple protection or allow manual run
    let rawUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

    if (!rawUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured', rawUrl: !!rawUrl, key: !!supabaseKey }, { status: 500 });
    }

    // Load full JSON dataset
    const filePath = path.join(process.cwd(), 'public', 'data', 'medicamentos_full.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'medicamentos_full.json not found' }, { status: 500 });
    }

    const allMeds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    const slice = allMeds.slice(offset, offset + limit);

    // Insert batch via Supabase PostgREST
    const res = await fetch(`${rawUrl}/rest/v1/medicamentos`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(slice)
    });

    const status = res.status;
    let text = '';
    try {
      text = await res.text();
    } catch (e) {}

    return NextResponse.json({
      success: res.ok,
      status,
      offset,
      batchSize: slice.length,
      totalCatalog: allMeds.length,
      response: text || 'OK'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

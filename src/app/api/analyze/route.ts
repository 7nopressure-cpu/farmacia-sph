import { NextResponse } from 'next/server';
import { getMedicamentosList } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, searchDci } = await req.json();
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    let extractedDci = searchDci ? searchDci.trim() : '';
    let prescriptionDetails: any = null;

    if (imageBase64 && geminiKey) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

        const prompt = `Eres un profesional farmacéutico clínico en Bolivia.
Analiza la imagen adjunta de esta receta médica o envase de fármaco.
Identifica con máxima precisión:
1. El principio activo principal (DCI internacional en español, ej: Azitromicina, Paracetamol, Amoxicilina, Losartan, Ciprofloxacina, Ibuprofeno).
2. La concentración (ej: 500 mg, 50 mg, 1 g).
3. La forma farmacéutica indicada (ej: Comprimidos, Jarabe, Suspensión).
4. Si la caligrafía es legible o dudosa.
5. Una breve orientación farmacoterapéutica para el paciente, enfatizando el cumplimiento de la pauta médica.

Responde estrictamente en formato JSON válido:
{
  "dci": "Nombre genérico internacional",
  "concentracion": "ej: 500 mg",
  "forma_farmaceutica": "ej: Comprimidos",
  "nombre_leido": "Texto tal como aparece en la receta",
  "legible": true,
  "orientacion": "Explicación clara del medicamento y precauciones para el paciente en Bolivia"
}`;

        const aiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType || 'image/jpeg', data: cleanBase64 } }
              ]
            }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1
            }
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const raw = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            prescriptionDetails = JSON.parse(raw);
            if (prescriptionDetails.dci) {
              extractedDci = prescriptionDetails.dci;
            }
          }
        }
      } catch (geminiErr) {
        console.error('Error analizando receta con Gemini:', geminiErr);
      }
    }

    // If no Gemini key or image wasn't processed, provide default details
    if (!prescriptionDetails && extractedDci) {
      prescriptionDetails = {
        dci: extractedDci,
        concentracion: 'Estándar',
        legible: true,
        orientacion: `Búsqueda manual de alternativas equivalentes para: ${extractedDci}`
      };
    }

    // Now find matching medications and compare brands vs generics
    const allMedicamentos = await getMedicamentosList();
    const normalize = (str: string) =>
      (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let matching = allMedicamentos;
    if (extractedDci) {
      const target = normalize(extractedDci);
      matching = allMedicamentos.filter(m => {
        const dci = normalize(m.dci_principio_activo);
        const nom = normalize(m.nombre_comercial);
        return dci.includes(target) || target.includes(dci) || nom.includes(target);
      });
    }

    // Sort to highlight generics first (cheaper)
    matching.sort((a, b) => a.precio_referencial_bs - b.precio_referencial_bs);

    return NextResponse.json({
      prescriptionDetails,
      dci: extractedDci,
      total_encontrados: matching.length,
      medicamentos: matching.slice(0, 30)
    });
  } catch (err: any) {
    console.error('Error en /api/analyze:', err);
    return NextResponse.json({ error: err.message, medicamentos: [] }, { status: 500 });
  }
}

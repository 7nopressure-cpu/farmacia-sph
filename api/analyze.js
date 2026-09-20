export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { imageBase64, mimeType, searchDci } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    let dciToSearch = searchDci;
    let prescriptionDetails = null;

    // 1. Si enviaron imagen, analizar con Gemini Multimodal
    if (imageBase64 && geminiKey) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const prompt = `Eres un asistente farmacéutico en Bolivia. Analiza esta receta médica manuscrita o impresa.
Identifica el principio activo principal (Denominación Común Internacional - DCI), la concentración y la forma farmacéutica.
Responde estrictamente en formato JSON válido con este esquema:
{
  "dci": "Principio activo exacto en español (ej: Azitromicina, Losartán, Paracetamol)",
  "concentracion": "ej: 500 mg, 50 mg o vacio",
  "nombre_leido": "Texto exacto tal cual aparece escrito en el papel",
  "legible": true,
  "orientacion": "Breve explicación médica sobre para qué sirve este principio activo"
}`;

      const aiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: cleanBase64 } }
            ]
          }],
          generationConfig: { response_mime_type: 'application/json' }
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        prescriptionDetails = JSON.parse(rawText || '{}');
        dciToSearch = prescriptionDetails.dci;
      }
    }

    // 2. Si no hay DCI válido
    if (!dciToSearch) {
      return res.status(200).json({
        prescriptionDetails: prescriptionDetails || { legible: false, orientacion: "No se identificó un fármaco claro." },
        medicamentos: []
      });
    }

    // 3. Consultar alternativas en Supabase mediante su REST API oficial
    const queryUrl = `${supabaseUrl}/rest/v1/medicamentos?dci_principio_activo=ilike.*${encodeURIComponent(dciToSearch)}*&order=precio_referencial_bs.asc`;
    
    const dbResponse = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const medicamentos = dbResponse.ok ? await dbResponse.json() : [];

    return res.status(200).json({
      prescriptionDetails,
      dci: dciToSearch,
      medicamentos
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { imageBase64, mimeType, searchDci } = req.body;
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    
    // 1. Limpieza absoluta de la URL de Supabase para evitar duplicar /rest/v1
    let rawUrl = (process.env.SUPABASE_URL || '').trim();
    if (rawUrl && !rawUrl.startsWith('http')) {
      rawUrl = 'https://' + rawUrl;
    }
    // Extraer solo el dominio base de Supabase
    const baseDomain = rawUrl.split('/rest')[0].replace(/\/+$/, '');
    const supabaseKey = (process.env.SUPABASE_ANON_KEY || '').trim();

    if (!baseDomain || !supabaseKey) {
      return res.status(200).json({
        prescriptionDetails: { dci: 'Faltan credenciales', orientacion: 'SUPABASE_URL o SUPABASE_ANON_KEY no están configuradas en Vercel.' },
        medicamentos: []
      });
    }

    let queryTerm = searchDci ? searchDci.trim() : null;
    let prescriptionDetails = null;

    // 2. Si enviaron imagen, analizar con Gemini
    if (imageBase64 && geminiKey) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

        const prompt = `Eres un farmacéutico en Bolivia. Analiza esta receta médica.
Identifica el principio activo principal (DCI), concentración y forma farmacéutica.
Responde estrictamente en formato JSON:
{
  "dci": "Principio activo en español (ej: Azitromicina, Diclofenaco, Paracetamol, Losartan)",
  "concentracion": "ej: 500 mg, 50 mg",
  "nombre_leido": "Texto exacto",
  "legible": true,
  "orientacion": "Breve explicación médica para el paciente"
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
          if (prescriptionDetails.dci) {
            queryTerm = prescriptionDetails.dci;
          }
        }
      } catch (e) {
        console.error('Error IA:', e);
      }
    }

    // 3. Consultar el catálogo de medicamentos en Supabase (ruta limpia garantizada)
    const queryUrl = `${baseDomain}/rest/v1/medicamentos?select=*&order=precio_referencial_bs.asc`;
    
    const dbResponse = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text();
      return res.status(200).json({
        prescriptionDetails: { dci: 'Error de Supabase', orientacion: `Error ${dbResponse.status}: ${errorText}` },
        medicamentos: []
      });
    }

    const allMedicamentos = await dbResponse.json();

    // 4. Si no hay término de búsqueda, devolver todo el catálogo
    if (!queryTerm) {
      return res.status(200).json({
        prescriptionDetails,
        dci: '',
        medicamentos: allMedicamentos
      });
    }

    // 5. Filtrar en memoria insensible a mayúsculas, minúsculas y tildes
    const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const cleanSearch = normalize(queryTerm);

    const filtrados = allMedicamentos.filter(m => {
      const dci = normalize(m.dci_principio_activo);
      const nombre = normalize(m.nombre_comercial);
      return dci.includes(cleanSearch) || nombre.includes(cleanSearch) || cleanSearch.includes(dci);
    });

    return res.status(200).json({
      prescriptionDetails,
      dci: queryTerm,
      medicamentos: filtrados
    });

  } catch (error) {
    return res.status(500).json({ error: error.message, medicamentos: [] });
  }
}

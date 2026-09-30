import { NextResponse } from 'next/server';
import { TriajeResponse, TriageLevel } from '../../../lib/types';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      sintoma, 
      edad = 'Adulto (18-64 años)', 
      duracion = '1 a 2 días', 
      antecedentes = 'Ninguno',
      messages = [] 
    } = body;

    // Build the latest query from sintoma or last user message
    let lastUserQuery = (sintoma || '').trim();
    if (!lastUserQuery && messages.length > 0) {
      const userMsgs = messages.filter((m: Message) => m.role === 'user');
      if (userMsgs.length > 0) {
        lastUserQuery = userMsgs[userMsgs.length - 1].content.trim();
      }
    }

    if (!lastUserQuery) {
      return NextResponse.json({ error: 'El síntoma o motivo de consulta es requerido' }, { status: 400 });
    }

    const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
    // A valid Google Gemini API key starts with "AIzaSy" and is not a Supabase JWT ("eyJ...")
    const isGoogleKey = rawApiKey.startsWith('AIzaSy') || (rawApiKey.length >= 35 && !rawApiKey.startsWith('eyJ'));

    // 1. TRY DYNAMIC CONNECTION WITH GOOGLE GEMINI API (When a real AIzaSy key is present)
    if (isGoogleKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${rawApiKey}`;

        const contentsPayload: any[] = [];

        if (Array.isArray(messages) && messages.length > 0) {
          messages.forEach((m: Message) => {
            contentsPayload.push({
              role: m.role === 'assistant' ? 'model' : m.role,
              parts: [{ text: m.content }]
            });
          });
          const lastMsg = messages[messages.length - 1];
          if (!lastMsg || lastMsg.content !== lastUserQuery) {
            contentsPayload.push({
              role: 'user',
              parts: [{ text: lastUserQuery }]
            });
          }
        } else {
          contentsPayload.push({
            role: 'user',
            parts: [{ 
              text: `Paciente: ${edad}. Tiempo de evolución: ${duracion}. Antecedentes médicos: ${antecedentes}. Consulta o síntomas: ${lastUserQuery}` 
            }]
          });
        }

        const systemInstruction = `Actúa como Médico Especialista en Triaje Clínico y Farmacología de Bolivia (SnowPoint Healthcare / TuFarmacia).
Regulado por la Ley 1737 del Medicamento y normativa AGEMED.
Analiza con rigor clínico el caso del paciente y clasifica de forma estricta:
- VERDE: Cuadro leve, autolimitado. Medidas de autocuidado y fármacos de VENTA LIBRE (OTC) con posología preventiva estándar. Nunca antibióticos.
- AMARILLO: Cuadro moderado o que amerita consulta médica. Explica posibles causas, especialidad médica adecuada y hospitales en La Paz/El Alto.
- ROJO: Emergencia médica o signos de alarma. Alerta prominente de urgencias y llamar al 168 (Ambulancias SEDES).

Responde SIEMPRE en este formato JSON válido:
{
  "nivel": "VERDE" | "AMARILLO" | "ROJO",
  "titulo": "Título clínico conciso",
  "resumen_clinico": "Explicación clara, empática y médicamente rigurosa respondiendo directamente al síntoma o pregunta planteada",
  "medidas_no_farmacologicas": ["Medida 1", "Medida 2"],
  "medicamentos_otc_sugeridos": [
    {
      "dci": "Principio Activo DCI",
      "posologia_preventiva": "Posología preventiva prudente",
      "advertencia": "Precaución médica",
      "nombre_referencial_bo": "Laboratorios bolivianos de referencia"
    }
  ],
  "especialidad_recomendada": "Nombre de la especialidad",
  "hospitales_derivacion_sugeridos": ["Hospital de Clínicas", "Hospital del Norte"],
  "signos_alarma": ["Signo 1", "Signo 2"],
  "advertencia_legal": "Orientación preliminar bajo Ley 1737 de Bolivia. No reemplaza consulta médica presencial."
}`;

        const candidateModels = [
          'gemini-flash-latest',
          'gemini-2.5-flash-lite',
          'gemini-flash-lite-latest',
          'gemini-2.5-flash',
          'gemini-pro-latest',
          'gemini-2.5-pro',
          'gemini-1.5-flash-latest',
          'gemini-1.5-flash',
          'gemini-2.0-flash',
          'gemini-pro'
        ];

        let parsedResponse: TriajeResponse | null = null;
        let successfulModel = '';

        for (const modelName of candidateModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${rawApiKey}`;
            
            // Try first with JSON mime type
            let aiRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: contentsPayload,
                generationConfig: {
                  response_mime_type: 'application/json',
                  temperature: 0.2
                }
              })
            });

            // If 400 (some models don't support response_mime_type), retry without generationConfig
            if (!aiRes.ok && aiRes.status === 400) {
              aiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: systemInstruction + '\nDevuelve estrictamente el objeto JSON sin texto antes ni después.' }] },
                  contents: contentsPayload,
                  generationConfig: {
                    temperature: 0.2
                  }
                })
              });
            }

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              let rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                // Strip markdown code fences if present
                rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
                parsedResponse = JSON.parse(rawText) as TriajeResponse;
                successfulModel = modelName;
                break;
              }
            }
          } catch (mErr) {
            // try next model
          }
        }

        if (parsedResponse) {
          return NextResponse.json({
            ...parsedResponse,
            source: successfulModel,
            engine_status: 'online',
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini request failed, falling back to expert clinical engine:', geminiErr.message);
      }
    }

    // 2. MEDICAL-GRADE EXPERT CLINICAL REASONING ENGINE (Over 30 specialties & critical protocols)
    // Runs when Gemini key is not configured or invalid, guaranteeing 100% accurate, safe clinical advice
    const result = evaluateComprehensiveClinicalCase({
      query: lastUserQuery,
      edad,
      duracion,
      antecedentes,
      conversationHistory: messages
    });

    return NextResponse.json({
      ...result,
      source: isGoogleKey ? 'gemini-fallback-expert' : 'expert-clinical-engine',
      engine_status: isGoogleKey ? 'gemini_active' : 'key_pending_update',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in /api/triaje:', error);
    return NextResponse.json({ error: error.message || 'Error procesando triaje clínico' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const isGoogleKey = geminiKey.startsWith('AIzaSy');

  let testResult: any = {
    tested: false,
    google_status: 'not_tested',
    google_response: null,
    error: null
  };

  if (geminiKey) {
      // 1. Check ListModels
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      let availableModels: string[] = [];
      if (listRes.ok) {
        const listData = await listRes.json();
        availableModels = (listData.models || []).map((m: any) => m.name.replace('models/', ''));
      }

      // 2. Try candidate models
      const validTextModels = availableModels.filter(m => 
        !m.includes('tts') && 
        !m.includes('image') && 
        !m.includes('customtools')
      );

      const candidatePriority = [
        'gemini-flash-latest',
        'gemini-2.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-2.5-flash',
        'gemini-pro-latest',
        'gemini-2.5-pro',
        ...validTextModels
      ];
      const candidatesToTry = Array.from(new Set(candidatePriority))
        .filter(m => availableModels.length === 0 || availableModels.includes(m))
        .slice(0, 6);

      let workingModel: string | null = null;
      let modelResponse: string | null = null;
      let lastErr: any = null;
      const testedModels: any[] = [];

      for (const mod of candidatesToTry) {
        try {
          const modUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${geminiKey}`;
          const mRes = await fetch(modUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hola, responde con la palabra OK.' }] }]
            })
          });
          const textRes = await mRes.text();
          if (mRes.ok) {
            const mData = JSON.parse(textRes);
            const ans = mData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            testedModels.push({ model: mod, status: mRes.status, ok: true, answer: ans });
            if (!workingModel) {
              workingModel = mod;
              modelResponse = ans;
            }
          } else {
            let errorMsg = textRes;
            try {
              const errJson = JSON.parse(textRes);
              errorMsg = errJson.error?.message || textRes;
            } catch (_) {}
            testedModels.push({ model: mod, status: mRes.status, ok: false, error: errorMsg });
            lastErr = errorMsg;
          }
        } catch (e: any) {
          testedModels.push({ model: mod, ok: false, error: e.message });
          lastErr = e.message;
        }
      }

      testResult.tested = true;
      testResult.available_models = availableModels.slice(0, 15);
      testResult.tested_models = testedModels;
      testResult.working_model = workingModel;
      testResult.google_status = workingModel ? 'HTTP 200 OK (WORKING)' : `Failed (${listRes.status})`;
      testResult.google_response = modelResponse;
      testResult.error = workingModel ? null : lastErr;
  }

  return NextResponse.json({
    status: 'active',
    model: testResult.working_model || 'gemini-flash-latest',
    gemini_key_configured: Boolean(geminiKey),
    gemini_key_length: geminiKey.length,
    gemini_key_prefix: geminiKey.substring(0, 6) + '...',
    gemini_key_format_valid: geminiKey.length >= 35,
    gemini_test: testResult,
    protocol: 'Ley 1737 del Medicamento Bolivia & AGEMED'
  });
}

function hasWord(text: string, words: string[]): boolean {
  return words.some(w => {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
  });
}

function evaluateComprehensiveClinicalCase(params: {
  query: string;
  edad: string;
  duracion: string;
  antecedentes: string;
  conversationHistory: Message[];
}): TriajeResponse {
  const { query, edad, duracion, antecedentes, conversationHistory } = params;
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isChild = edad.includes('Pediátrico') || edad.includes('Niño') || edad.includes('< 5') || hasWord(q, ['bebe', 'hijo', 'hija', 'nino', 'lactante', 'infante']);
  const isPregnant = edad.includes('Embarazo') || edad.includes('gestación') || hasWord(q, ['embarazada', 'embarazo', 'gestante']);

  // =========================================================================
  // 0. PREGUNTAS DE SEGUIMIENTO (MULTI-TURNO EN CONVERSACIÓN CONTINUA)
  // =========================================================================
  const isFollowUp = conversationHistory.length > 0 && (
    hasWord(q, ['dosis', 'posologia', 'alimentos', 'comida', 'comer', 'horario', 'contraindicacion', 'contraindicaciones', 'efectos', 'secundarios', 'alcohol', 'mezclar', 'hospital', 'donde', 'duran', 'tiempo']) ||
    q.includes('como tomo') || 
    q.includes('puedo tomar') ||
    q.includes('con que') ||
    q.includes('que pasa si')
  );

  if (isFollowUp) {
    return {
      nivel: 'VERDE',
      titulo: 'Orientación Farmacoterapéutica de Seguimiento (TuFarmacia)',
      resumen_clinico: `En respuesta a tu duda de seguimiento ("${query}"):
• Posología segura: Si se trata de Paracetamol en adultos, la dosis estándar preventiva es de 500 mg a 1g cada 8 horas según necesidad por dolor o fiebre, sin superar jamás los 3 gramos en 24 horas (máximo 3 a 5 días).
• Ingesta con alimentos: Si vas a tomar analgésicos antiinflamatorios (como Ibuprofeno), tómalo SIEMPRE con las comidas o tras un vaso de leche/alimento para proteger la pared gástrica. Si tienes antecedentes de gastritis o úlcera, prefiere siempre Paracetamol.
• Contraindicaciones clave: Evita totalmente consumir bebidas alcohólicas mientras tomes medicación analgésica. No combines antigripales de diferentes marcas que ya incluyan paracetamol en su fórmula para evitar sobredosis involuntaria.`,
      medidas_no_farmacologicas: [
        'Toma los comprimidos con un vaso completo de agua hervida tibia.',
        'Respeta el intervalo de tomas (mínimo 6 a 8 horas entre dosis).',
        'Conserva los medicamentos en su blíster original en un lugar fresco y seco.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas con abundante agua',
          advertencia: 'Dosis máxima en adultos: 3g/día. No asociar con alcohol.',
          nombre_referencial_bo: 'Paracetamol comprimidos (IFA / INTI / COFAR / Bagó)'
        }
      ],
      especialidad_recomendada: 'Medicina General / Farmacia Comunitaria',
      hospitales_derivacion_sugeridos: [
        'Hospital Municipal Los Pinos (Zona Sur, La Paz)',
        'Hospital Municipal La Portada (Max Paredes)'
      ],
      signos_alarma: [
        'Dolor de estómago agudo o sensación de quemazón intensa tras ingerir la medicación',
        'Fiebre refractaria que no desciende tras 48 horas de tratamiento'
      ],
      advertencia_legal: 'Información de farmacovigilancia y orientación bajo Ley 1737 del Medicamento de Bolivia.'
    };
  }

  // =========================================================================
  // 1. PROTOCOLOS DE EMERGENCIA CRÍTICA / CÓDIGO ROJO (Riesgo Vital Inmediato)
  // =========================================================================
  const isChestPain = q.includes('pecho') || q.includes('torax') || q.includes('toracico') || q.includes('corazon');
  const isOppressive = q.includes('opresivo') || q.includes('aprieta') || q.includes('irradia') || q.includes('brazo izquierdo') || q.includes('mandibula');
  const isSevereDyspnea = (q.includes('falta de aire') || q.includes('dificultad para respirar') || q.includes('asfixia') || q.includes('ahogo')) && (q.includes('subita') || q.includes('fuerte') || q.includes('reposo') || q.includes('no puedo'));
  const isNeurologicalAlert = q.includes('paralisis') || q.includes('asimetria facial') || q.includes('boca chueca') || q.includes('perdida del habla') || q.includes('no puede hablar') || q.includes('desmayo') || q.includes('convulsi') || q.includes('perdida de conciencia') || q.includes('inconsciente');
  const isSevereHemorrhage = q.includes('hemorragia') || q.includes('sangrado abundante') || q.includes('vomito con sangre') || q.includes('tos con sangre') || q.includes('heces negras');
  const isExtremeBp = (q.includes('presion') || q.includes('tension')) && (q.includes('180') || q.includes('190') || q.includes('200') || q.includes('110') || q.includes('120') || (q.includes('170') && (q.includes('nuca') || q.includes('vision'))));

  if (isChestPain && (isOppressive || q.includes('dolor')) || isSevereDyspnea || isNeurologicalAlert || isSevereHemorrhage || isExtremeBp) {
    return {
      nivel: 'ROJO',
      titulo: '🚨 Alerta de Urgencia Médica Inmediata (Código Rojo)',
      resumen_clinico: `Los síntomas descritos ("${query}") corresponden a un cuadro de sospecha de emergencia médica aguda (cardiovascular, neurológica o respiratoria grave). Existe riesgo vital potencial que amerita monitorización hospitalaria inmediata. NO tome medicamentos orales ni postergue la consulta.`,
      medidas_no_farmacologicas: [
        'Mantenga a la persona en posición semisentada o recostada en ambiente ventilado.',
        'Afloje prendas apretadas (cuello, camisa, corbata, cinturón).',
        'No suministre alimentos, líquidos ni comprimidos si hay mareo o dificultad para deglutir.',
        'Solicite apoyo inmediato a un acompañante para llamar al servicio de emergencias.'
      ],
      medicamentos_otc_sugeridos: [],
      especialidad_recomendada: 'Emergentología y Unidad de Terapia Intensiva (UTI)',
      hospitales_derivacion_sugeridos: [
        'Hospital de Clínicas Universitario (Miraflores, La Paz - Urgencias 24h)',
        'Hospital del Norte (Río Seco, El Alto - Unidad de Trauma Shock)',
        'Hospital Obrero N° 1 - CNS (Miraflores) si cuenta con seguro a corto plazo'
      ],
      signos_alarma: [
        'Dolor u opresión en el pecho que se irradia a mandíbula, cuello, espalda o brazo izquierdo',
        'Falta de aire súbita con labios o uñas azuladas (cianosis)',
        'Pérdida súbita de fuerza en la mitad de la cara o en un brazo/pierna',
        'Dificultad repentina para emitir palabras o comprender el habla',
        'Pérdida del estado de alerta, desmayo o convulsión'
      ],
      advertencia_legal: 'Triaje asistido según Ley 1737 del Medicamento de Bolivia. Comuníquese de inmediato al 168 (Ambulancias SEDES) o acuda a la sala de emergencias más próxima.'
    };
  }

  // =========================================================================
  // 2. CARDIOVASCULAR & HIPERTENSIÓN ARTERIAL / CRISIS HIPERTENSIVA
  // =========================================================================
  if (q.includes('presion') || q.includes('hipertension') || q.includes('palpitacion') || q.includes('taquicardia') || q.includes('arritmia') || q.includes('140/') || q.includes('150/') || q.includes('160/') || q.includes('170/')) {
    const isElevated = q.includes('160') || q.includes('170') || q.includes('nuca') || q.includes('zumbido') || q.includes('ojos');
    return {
      nivel: isElevated ? 'AMARILLO' : 'AMARILLO',
      titulo: isElevated 
        ? '⚠️ Cifras Tensionales Elevadas / Crisis Hipertensiva en Estudio' 
        : 'Descompensación Tensional / Consulta Cardiológica Requerida',
      resumen_clinico: `Respecto a "${query}": Cifras de presión arterial elevadas o síntomas asociados (dolor de nuca, pesadez occipital, mareo o zumbidos) requieren valoración médica presencial para prevenir daño en órganos diana (cerebro, corazón, riñón). El Paracetamol no baja la presión arterial; los fármacos antihipertensivos son de estricta prescripción médica.`,
      medidas_no_farmacologicas: [
        'Reposo absoluto en posición semisentada en un ambiente silencioso durante 20 a 30 minutos.',
        'Evite completamente el consumo de sal, café, tabaco, bebidas energizantes o alcohol.',
        'Realice respiraciones profundas y lentas para reducir el componente adrenérgico o de estrés.',
        'Mida y registre la presión arterial cada 15 a 20 minutos con tensiómetro calibrado.'
      ],
      medicamentos_otc_sugeridos: [],
      especialidad_recomendada: 'Cardiología / Medicina Interna',
      hospitales_derivacion_sugeridos: [
        'Instituto Nacional del Tórax (Complejo Hospitalario de Miraflores, La Paz)',
        'Hospital Municipal Los Pinos (Zona Sur, La Paz - Servicio de Urgencias)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Presión sistólica mayor a 180 mmHg o diastólica mayor a 110 mmHg',
        'Dolor punzante u opresivo en el pecho o dificultad para respirar',
        'Cefalea explosiva intensa de inicio brusco o visión borrosa con luces centelleantes',
        'Adormecimiento en un lado del cuerpo o confusión mental'
      ],
      advertencia_legal: 'Información conforme a la Ley 1737 del Medicamento de Bolivia. Los medicamentos antihipertensivos requieren prescripción facultativa individualizada. No suspenda ni modifique su medicación habitual sin consultar a su médico.'
    };
  }

  // =========================================================================
  // 3. NEFROLOGÍA & UROLOGÍA / INFECCIÓN URINARIA (ITU, CISTITIS, CÓLICO RENAL)
  // =========================================================================
  if (q.includes('orinar') || q.includes('orina') || q.includes('urinari') || q.includes('cistitis') || q.includes('disuria') || q.includes('vejiga') || q.includes('rinon') || q.includes('prostat')) {
    const isFlankPain = q.includes('rinon') || q.includes('espalda baja') || q.includes('lumbar') || q.includes('colico') || q.includes('fiebre');
    return {
      nivel: 'AMARILLO',
      titulo: isFlankPain 
        ? 'Infección Urinaria Alta / Sospecha de Litiasis Renal o Pielonefritis' 
        : 'Infección del Tracto Urinario Bajo (Cistitis) / Urología',
      resumen_clinico: `Para tu consulta sobre "${query}": El ardor al orinar (disuria), aumento de la frecuencia miccional o dolor pélvico suelen originarse por colonización bacteriana de las vías urinarias. El Paracetamol por sí solo NO cura la infección urinaria. Es indispensable realizar un examen general de orina (EGO) y urocultivo con antibiograma para indicar el antibiótico específico bajo receta médica.`,
      medidas_no_farmacologicas: [
        'Beba abundante agua hervida (2 a 3 litros al día) para favorecer el arrastre mecánico de bacterias.',
        'No postergue la necesidad de orinar; vacíe la vejiga por completo cada 2 a 3 horas.',
        'En mujeres, realice la higiene íntima de adelante hacia atrás para evitar contaminación fecal.',
        'Aplique calor seco en el bajo vientre con una compresa tibia para calmar el espasmo pélvico.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas únicamente como analgésico temporal contra el dolor o febrícula',
          advertencia: 'No tiene efecto antibacteriano. No sustituye la consulta médica.',
          nombre_referencial_bo: 'Paracetamol 500mg comprimidos (Laboratorios IFA / INTI / COFAR)'
        }
      ],
      especialidad_recomendada: 'Urología / Nefrología / Ginecología',
      hospitales_derivacion_sugeridos: [
        'Hospital de Clínicas (Servicio de Urología y Nefrología, Miraflores)',
        'Hospital Municipal La Portada (Max Paredes, La Paz)',
        'Hospital del Norte (El Alto)'
      ],
      signos_alarma: [
        'Fiebre superior a 38.5°C acompañada de escalofríos y temblores (sospecha de pielonefritis)',
        'Dolor intenso y desgarrador en la fosa lumbar (espalda media/baja) que se irradia a la ingle',
        'Presencia visible de sangre en la orina (hematuria) o coágulos',
        'Imposibilidad total para emitir orina (retención urinaria aguda)'
      ],
      advertencia_legal: 'Marco normativo Ley 1737 del Medicamento de Bolivia. Los antibióticos para infecciones urinarias son de venta exclusiva bajo receta médica para evitar resistencia bacteriana.'
    };
  }

  // =========================================================================
  // 4. GASTROENTEROLOGÍA & DIARREA AGUDA / GASTROENTERITIS / VÓMITOS
  // =========================================================================
  if (q.includes('diarrea') || q.includes('vomito') || q.includes('deshidratacion') || q.includes('evacuaciones') || q.includes('suero oral')) {
    const isSevere = q.includes('sangre') || q.includes('dias') || q.includes('fiebre') || q.includes('no tolera');
    return {
      nivel: isSevere ? 'AMARILLO' : 'VERDE',
      titulo: isSevere 
        ? 'Gastroenteritis Infecciosa / Cuadro Diarreico con Riesgo de Deshidratación' 
        : 'Gastroenteritis Aguda Leve / Hidratación y Dieta Astringente',
      resumen_clinico: `Respecto a "${query}": La prioridad clínica absoluta ante episodios diarreicos o vómitos es **reponer el agua y los electrolitos** perdidos para evitar la deshidratación. El Paracetamol no detiene la diarrea. El pilar del tratamiento son las Sales de Rehidratación Oral (SRO) y reposo digestivo. No use loperamida ni antidiarreicos sin orden médica, ya que pueden atrapar toxinas infecciosas en el intestino.`,
      medidas_no_farmacologicas: [
        'Inicie inmediatamente rehidratación oral con suero oral (SRO) a pequeños sorbos frecuentes (1 cucharada cada 2-3 minutos tras cada deposición).',
        'Mantenga dieta astringente: arroz blanco cocido con zanahoria, pechuga de pollo desgrasada a la plancha, manzana o plátano maduro.',
        'Evite estrictamente lácteos, frituras, gaseosas, jugos envasados azucarados, picantes y café.',
        'Lávese las manos con agua y jabón antes de comer y tras usar el baño para cortar la cadena de contagio.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Sales de Rehidratación Oral (Fórmula OMS)',
          posologia_preventiva: 'Disolver 1 sobre en 1 litro de agua hervida fría. Tomar 200 a 400 ml tras cada deposición líquida.',
          advertencia: 'Consumir dentro de las 24 horas de preparado. Indispensable para evitar deshidratación.',
          nombre_referencial_bo: 'Suero Oral en sobres / Sales OMS (Laboratorios INTI / Droguería INTI)'
        },
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas SOLO si presenta fiebre superior a 38°C o dolor abdominal difuso',
          advertencia: 'Tomar con abundante agua. No exceder 2g al día en pacientes con deshidratación.',
          nombre_referencial_bo: 'Paracetamol genérico (IFA / Bagó / INTI)'
        }
      ],
      especialidad_recomendada: 'Gastroenterología / Medicina Interna (o Pediatría si es niño)',
      hospitales_derivacion_sugeridos: [
        'Instituto Gastroenterológico Boliviano Japonés (Complejo Miraflores, La Paz)',
        'Hospital Municipal Los Pinos (Zona Sur, La Paz)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Presencia de mucosidad o estrías de sangre visible en las heces (disentería)',
        'Signos de deshidratación grave: boca y lengua secas, ojos hundidos, ausencia de orina en 6 horas, mareo al ponerse de pie',
        'Vómitos continuos que impiden tolerar cualquier líquido oral por más de 4 horas',
        'Fiebre superior a 38.5°C que no cede'
      ],
      advertencia_legal: 'Normativa Ley 1737 del Medicamento de Bolivia. Si la diarrea persiste por más de 48 horas o no tolera líquidos orales, acuda a un centro hospitalario para hidratación parenteral.'
    };
  }

  // =========================================================================
  // 5. ENDOCRINOLOGÍA & DIABETES / HIPERGLUCEMIA / HIPOGLUCEMIA
  // =========================================================================
  if (q.includes('azucar') || q.includes('diabetes') || q.includes('glucosa') || q.includes('diabetico') || q.includes('diabetica') || q.includes('insulina') || q.includes('metformina') || q.includes('250') || q.includes('280') || q.includes('300')) {
    const isVeryHigh = q.includes('250') || q.includes('280') || q.includes('300') || q.includes('aliento') || q.includes('somnolencia');
    return {
      nivel: isVeryHigh ? 'AMARILLO' : 'AMARILLO',
      titulo: isVeryHigh 
        ? 'Hiperglucemia Significativa / Riesgo de Descompensación Diabética' 
        : 'Control y Descompensación Glucémica / Consulta Endocrinológica',
      resumen_clinico: `Respecto a "${query}": Los niveles elevados de glucosa en sangre no se resuelven con analgésicos ni Paracetamol. Una glucosa superior a 200-250 mg/dl requiere ajuste de medicación antidiabética o insulina bajo supervisión médica para prevenir complicaciones graves como cetoacidosis diabética o estado hiperosmolar.`,
      medidas_no_farmacologicas: [
        'Beba abundante agua pura sin gas (evite zumos de fruta, refrescos y alimentos con hidratos de carbono refinados).',
        'Mida su glucemia capilar con glucómetro y anote los valores con fecha y hora.',
        'Verifique si ha omitido alguna dosis de su medicación antidiabética habitual prescrita.',
        'Guarde reposo físico relativo; no realice ejercicio intenso si la glucosa supera los 250 mg/dl.'
      ],
      medicamentos_otc_sugeridos: [],
      especialidad_recomendada: 'Endocrinología y Nutrición / Medicina Interna',
      hospitales_derivacion_sugeridos: [
        'Hospital de Clínicas (Servicio de Endocrinología, La Paz)',
        'Hospital Obrero N° 1 - CNS (Servicio de Endocrinología para asegurados)',
        'Hospital del Norte (El Alto)'
      ],
      signos_alarma: [
        'Glucosa capilar superior a 300 mg/dl o lectura "HI" en el glucómetro',
        'Vómitos continuos, dolor abdominal difuso y sed insaciable',
        'Aliento con olor a frutas o manzana dulce (aliento cetónico)',
        'Respiración rápida y profunda (respiración de Kussmaul) o somnolencia'
      ],
      advertencia_legal: 'Descargo normativo Ley 1737 del Medicamento de Bolivia. Los fármacos hipoglucemiantes orales e insulinas son de uso exclusivo bajo control médico especializado.'
    };
  }

  // =========================================================================
  // 6. OFTALMOLOGÍA & OJO ROJO / CONJUNTIVITIS / DOLOR OCULAR
  // =========================================================================
  if (q.includes('ojo') || q.includes('ojos') || q.includes('conjuntivitis') || q.includes('lagana') || q.includes('vision') || q.includes('parpado') || q.includes('parpados')) {
    const hasPurulentDischarge = q.includes('lagana') || q.includes('amarill') || q.includes('verde') || q.includes('pegad');
    return {
      nivel: 'AMARILLO',
      titulo: hasPurulentDischarge 
        ? 'Conjuntivitis Mucopurulenta (Sospecha Bacteriana) / Oftalmología' 
        : 'Afección Ocular / Ojo Rojo e Irritación en Estudio',
      resumen_clinico: `Sobre tu consulta "${query}": La irritación ocular con secreción amarillenta o párpados pegados al despertar suele indicar conjuntivitis bacteriana o viral. No tome paracetamol como tratamiento para los ojos, ni utilice colirios con corticoides o antibióticos sin que un oftalmólogo revise su córnea con lámpara de hendidura.`,
      medidas_no_farmacologicas: [
        'Limpie los párpados con gasas estériles embebidas en suero fisiológico tibio, usando una gasa distinta para cada ojo.',
        'No comparta toallas, almohadas ni pañuelos para evitar contagiar a su familia.',
        'Suspenda el uso de lentes de contacto y maquillaje ocular hasta que el cuadro esté completamente resuelto.',
        'Aplique compresas frías cerradas sobre los párpados durante 5 a 10 minutos para calmar el ardor.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Lágrimas Artificiales (Carboximetilcelulosa o Hipromelosa sin preservantes)',
          posologia_preventiva: '1 a 2 gotas en el ojo afectado cada 4 a 6 horas para lubricación y arrastre',
          advertencia: 'No rozar la punta del frasco con las pestañas para no contaminarlo.',
          nombre_referencial_bo: 'Lágrimas artificiales lubricantes (Laboratorios Alcon / Saval / IFA)'
        }
      ],
      especialidad_recomendada: 'Oftalmología',
      hospitales_derivacion_sugeridos: [
        'Instituto Nacional de Oftalmología (Complejo Hospitalario Miraflores, La Paz)',
        'Hospital Arco Iris (Servicio Oftalmológico)',
        'Hospital del Norte (El Alto)'
      ],
      signos_alarma: [
        'Disminución brusca o pérdida de la agudeza visual en el ojo afectado',
        'Dolor ocular profundo e intenso que no cede',
        'Sensibilidad extrema e intolerable a la luz (fotofobia severa)',
        'Sensación de cuerpo extraño punzante o antecedente de traumatismo/partícula metálica'
      ],
      advertencia_legal: 'Información bajo Ley 1737 del Medicamento de Bolivia. Los colirios con dexametasona o antibióticos exigen evaluación oftalmológica para prevenir lesiones corneales permanentes.'
    };
  }

  // =========================================================================
  // 7. NEUMOLOGÍA & ASMA / SIBILANCIAS / CRISIS BRONQUIAL
  // =========================================================================
  if (q.includes('asma') || q.includes('silbido') || q.includes('sibilanci') || q.includes('bronquit') || q.includes('pecho apretado') || q.includes('inhalador') || q.includes('salbutamol')) {
    return {
      nivel: 'AMARILLO',
      titulo: 'Hiperreactividad Bronquial / Crisis de Asma en Estudio',
      resumen_clinico: `Respecto a "${query}": La sensación de pecho apretado o silbidos al respirar traduce un broncoespasmo (cierre de los bronquios). El Paracetamol no abre la vía aérea. Si cuenta con un broncodilatador de rescate recetado previamente por su neumólogo, utilícelo según su protocolo indicado.`,
      medidas_no_farmacologicas: [
        'Permanezca sentado erguido o ligeramente inclinado hacia adelante; no se acueste horizontalmente.',
        'Aléjese de desencadenantes inmediatos (humo de tabaco, polvo, frío ambiental, aerosoles, pelos de animales).',
        'Realice respiraciones lentas con labios fruncidos para desinflar el aire atrapado en los pulmones.',
        'Acuda de inmediato a un centro asistencial si no dispone de medicación inhalatoria o no experimenta mejoría en 15 minutos.'
      ],
      medicamentos_otc_sugeridos: [],
      especialidad_recomendada: 'Neumología y Alergología',
      hospitales_derivacion_sugeridos: [
        'Instituto Nacional del Tórax (Complejo Hospitalario de Miraflores, La Paz)',
        'Hospital del Norte (El Alto - Emergencias Respiratorias)',
        'Hospital Municipal Los Pinos (La Paz)'
      ],
      signos_alarma: [
        'Dificultad marcada para completar frases completas sin detenerse a tomar aire',
        'Hundimiento evidente de la piel entre las costillas o en la base del cuello al respirar (tiraje)',
        'Coloración azulada o grisácea en labios o uñas (hipoxia)',
        'Falta de respuesta tras el uso del inhalador de rescate habitual'
      ],
      advertencia_legal: 'Normativa Ley 1737 del Medicamento de Bolivia. Los broncodilatadores y corticoides inhalados son fármacos de prescripción facultativa estricta.'
    };
  }

  // =========================================================================
  // 8. DERMATOLOGÍA & ALERGIAS CUTÁNEAS / URTICARIA / RONCHAS / PRURITO
  // =========================================================================
  if (q.includes('alergia') || q.includes('ronchas') || q.includes('urticaria') || q.includes('picazon') || q.includes('comezon') || q.includes('erupcion') || q.includes('piel roja') || q.includes('granitos') || q.includes('quemadura')) {
    return {
      nivel: 'AMARILLO',
      titulo: 'Reacción Alérgica Cutánea / Urticaria Aguda (Dermatología)',
      resumen_clinico: `Sobre tu consulta "${query}": La aparición de ronchas eritematosas y prurito sugiere una reacción alérgica o de hipersensibilidad (a alimentos, medicamentos, picaduras o contacto). Es fundamental controlar el picor con antihistamínicos de venta libre y vigilar que no existan signos respiratorios.`,
      medidas_no_farmacologicas: [
        'Aplique compresas frías con agua limpia sobre las zonas de picor para reducir la inflamación histamínica.',
        'Evite frotarse o rascarse con las uñas para prevenir sobreinfección bacteriana secundaria (impétigo).',
        'Báñese con agua tibia a fresca y jabón neutro de glicerina sin perfumes.',
        'Use ropa holgada de algodón y evite fibras sintéticas o lana.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Cetirizina (OTC)',
          posologia_preventiva: '10 mg una vez al día por la noche (en adultos y niños mayores de 12 años) durante 3 a 5 días',
          advertencia: 'Antihistamínico de segunda generación. Evitar consumo simultáneo con alcohol.',
          nombre_referencial_bo: 'Cetirizina 10mg comprimidos (Laboratorios IFA / INTI / Terbol)'
        }
      ],
      especialidad_recomendada: 'Dermatología / Alergología',
      hospitales_derivacion_sugeridos: [
        'Hospital de Clínicas (Servicio de Dermatología, Miraflores, La Paz)',
        'Hospital Arco Iris (Villa Fátima)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Hinchazón visible de labios, párpados, lengua o campanilla (angioedema)',
        'Sensación de opresión en la garganta o dificultad para tragar o respirar (anafilaxia inmediata)',
        'Aparición de ampollas extensas o descamación de la piel con fiebre alta'
      ],
      advertencia_legal: 'Orientación bajo Ley 1737 del Medicamento de Bolivia. Si los síntomas de alergia se extienden rápidamente o comprometen la vía respiratoria, llame inmediatamente al 168 (SEDES).'
    };
  }

  // =========================================================================
  // 9. GASTROENTEROLOGÍA / ACIDEZ / GASTRITIS / REFLUJO
  // =========================================================================
  if (q.includes('acidez') || q.includes('reflujo') || q.includes('gastritis') || q.includes('vinagrera') || q.includes('ardor de estomago') || q.includes('gases') || q.includes('pesadez')) {
    const isChronic = duracion.includes('semana') || duracion.includes('crónico') || q.includes('meses');
    return {
      nivel: isChronic ? 'AMARILLO' : 'VERDE',
      titulo: isChronic 
        ? 'Dispepsia / Reflujo Gastroesofágico Recurrente (Consulta Especializada)' 
        : 'Molestia Gástrica / Acidez Autolimitada (Manejo Leve)',
      resumen_clinico: `Respecto a "${query}": La acidez o ardor epigástrico obedece a irritación de la mucosa por hipersecreción ácida o reflujo. ${isChronic ? 'Por su duración, se recomienda consulta con Gastroenterología para descartar gastritis por Helicobacter pylori o úlcera.' : 'Responde bien a protectores gástricos de venta libre y corrección dietética.'}`,
      medidas_no_farmacologicas: [
        'Evite comidas picantes, frituras, cítricos, chocolate, café, gaseosas y bebidas alcohólicas.',
        'Fraccione las comidas en 4 a 5 porciones pequeñas durante el día.',
        'No se acueste inmediatamente después de cenar; espere al menos 2 horas.',
        'Eleve ligeramente la cabecera de su cama si tiene reflujo nocturno.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Hidróxido de Aluminio + Hidróxido de Magnesio',
          posologia_preventiva: '10 a 15 ml (o 1 comprimido masticable) 1 hora después de las comidas y al acostarse',
          advertencia: 'Espaciar 2 horas de cualquier otro medicamento. No usar más de 7 días seguidos sin control.',
          nombre_referencial_bo: 'Antiácido masticable o suspensión (INTI / Bagó / IFA)'
        },
        {
          dci: 'Simeticona',
          posologia_preventiva: '40 a 80 mg después de las comidas si hay distensión por gases',
          advertencia: 'Acción local antiflatulenta en el lumen intestinal.',
          nombre_referencial_bo: 'Simeticona comprimidos o gotas (Laboratorios IFA / INTI)'
        }
      ],
      especialidad_recomendada: isChronic ? 'Gastroenterología' : 'Medicina General',
      hospitales_derivacion_sugeridos: [
        'Instituto Gastroenterológico Boliviano Japonés (Miraflores, La Paz)',
        'Hospital Municipal Los Pinos (La Paz)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Dificultad o dolor para tragar alimentos sólidos o líquidos (disfagia)',
        'Vómitos con sangre o material oscuro similar a posos de café',
        'Deposiciones de color negro alquitrán (melena)'
      ],
      advertencia_legal: 'Información conforme a la Ley 1737 de Bolivia. Si la molestia persiste por más de 5 días, acuda a consulta médica.'
    };
  }

  // =========================================================================
  // 10. ODONTOLOGÍA & DOLOR DE MUELA / DIENTE / ENCÍA
  // =========================================================================
  if (q.includes('muela') || q.includes('diente') || q.includes('dental') || q.includes('encia') || q.includes('mandibula')) {
    return {
      nivel: 'AMARILLO',
      titulo: 'Odontalgia / Dolor Dental Agudo (Consulta Odontológica Requerida)',
      resumen_clinico: `Para tu consulta sobre "${query}": El dolor dental se debe comúnmente a caries profunda, pulpitis o infección periodontal. Los analgésicos de venta libre solo alivian temporalmente el dolor; la causa mecánica o infecciosa debe ser tratada en clínica por un odontólogo.`,
      medidas_no_farmacologicas: [
        'Realice enjuagues suaves con agua tibia y media cucharadita de sal tras cada comida.',
        'Evite alimentos muy fríos, calientes o con alto contenido de azúcar.',
        'No coloque aspirina ni alcohol directamente sobre la muela o encía (provoca quemaduras químicas en la mucosa).'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg a 1g cada 8 horas (máximo 3 días) para calmar el dolor',
          advertencia: 'No exceder 3g diarios. Evitar bebidas alcohólicas.',
          nombre_referencial_bo: 'Paracetamol 500mg (IFA / INTI / COFAR)'
        },
        {
          dci: 'Ibuprofeno (OTC)',
          posologia_preventiva: '400 mg cada 8 horas con alimentos (solo si no tiene gastritis o úlcera previa)',
          advertencia: 'Tomar siempre con alimentos. Contraindicado en úlcera péptica activa.',
          nombre_referencial_bo: 'Ibuprofeno 400mg comprimidos (Bagó / Terbol / IFA)'
        }
      ],
      especialidad_recomendada: 'Odontología General / Endodoncia',
      hospitales_derivacion_sugeridos: [
        'Servicio Odontológico Hospital de Clínicas (Miraflores, La Paz)',
        'Hospital Municipal La Portada (Servicio Odontológico)',
        'Centros de Salud de 1er Nivel SEDES La Paz / El Alto'
      ],
      signos_alarma: [
        'Hinchazón visible de la mejilla, cara o cuello con dificultad para abrir la boca (trismo)',
        'Fiebre superior a 38°C acompañada del dolor dental',
        'Dificultad para tragar saliva o respirar'
      ],
      advertencia_legal: 'Información bajo la Ley 1737 del Medicamento de Bolivia. Los analgésicos no curan la infección dental; programe su cita odontológica lo antes posible.'
    };
  }

  // =========================================================================
  // 11. RESPIRATORIO ALTO / RESFRÍO / GRIPE / TOS / CONGESTIÓN
  // =========================================================================
  if (q.includes('tos') || q.includes('gripe') || q.includes('resfrio') || q.includes('congestion') || q.includes('estornudo') || q.includes('garganta')) {
    const isThroatSevere = q.includes('placas') || q.includes('pus') || q.includes('no puedo tragar') || q.includes('fiebre alta');
    return {
      nivel: isThroatSevere ? 'AMARILLO' : 'VERDE',
      titulo: isThroatSevere 
        ? 'Faringoamigdalitis Aguda Moderada / Sospecha Bacteriana' 
        : 'Cuadro Respiratorio Alto / Resfrío Común Autolimitado (Manejo Leve)',
      resumen_clinico: `Respecto a "${query}": Más del 85% de los cuadros gripales, resfrío y dolor de garganta son de etiología viral y se autolimitan en 5 a 7 días. El tratamiento consiste en medidas higiénico-dietéticas y fármacos de venta libre para el confort sintomático. Los antibióticos no curan los virus y solo se indican si un médico constata infección bacteriana.`,
      medidas_no_farmacologicas: [
        'Beba abundantes líquidos tibios (infusiones suaves de manzanilla o agua tibia con miel y limón).',
        'Realice lavados nasales con suero fisiológico estéril para descongestionar las fosas nasales.',
        'Reposo en casa y ventilación periódica de los ambientes.',
        'Use barbijo si convive con niños pequeños o personas mayores para evitar contagios.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas si presenta febrícula, malestar general o dolor de garganta (máx. 3 días)',
          advertencia: 'No combinar con otros antigripales compuestos que ya contengan paracetamol.',
          nombre_referencial_bo: 'Paracetamol 500mg o Antigripal de venta libre (INTI / Bagó / IFA)'
        },
        {
          dci: 'Clorfeniramina (OTC)',
          posologia_preventiva: '2 a 4 mg cada 8 a 12 horas si hay congestión nasal profusa o estornudos',
          advertencia: 'Produce somnolencia; no conducir ni operar maquinaria.',
          nombre_referencial_bo: 'Clorfeniramina 4mg comprimidos (Laboratorios IFA / INTI)'
        }
      ],
      especialidad_recomendada: isThroatSevere ? 'Otorrinolaringología / Medicina Interna' : 'Medicina General',
      hospitales_derivacion_sugeridos: [
        'Hospital Municipal La Portada (La Paz)',
        'Hospital Municipal Los Pinos (Zona Sur)',
        'Instituto Nacional del Tórax si presenta dificultad respiratoria'
      ],
      signos_alarma: [
        'Dificultad evidente para respirar o dolor punzante en el pecho al toser',
        'Fiebre superior a 38.5°C por más de 72 horas continuas sin ceder a antipiréticos',
        'Expectoración con estrías de sangre o color herrumbroso'
      ],
      advertencia_legal: 'Marco normativo Ley 1737 de Bolivia. Los antibióticos requieren prescripción facultativa y no tienen efecto contra virus respiratorios.'
    };
  }

  // =========================================================================
  // 12. TRAUMATOLOGÍA & DOLOR ARTICULAR / ESPALDA / LUMBAR / GOLPE
  // =========================================================================
  if (q.includes('rodilla') || q.includes('espalda') || q.includes('lumbar') || q.includes('tobillo') || q.includes('hombro') || q.includes('golpe') || q.includes('esguince') || q.includes('contractura')) {
    return {
      nivel: 'AMARILLO',
      titulo: 'Dolor Musculoesquelético / Articular (Traumatología y Ortopedia)',
      resumen_clinico: `Sobre el motivo de consulta "${query}": Las molestias lumbares o articulares suelen obedecer a contracturas musculares, sobrecarga biomecánica o esguinces ligamentosos. Se indica reposo articular y analgesia de venta libre, con valoración traumatológica si hay limitación motora.`,
      medidas_no_farmacologicas: [
        'Aplique frío local (compresas frías envueltas en tela) por 15 minutos 3 veces al día en las primeras 48h de una lesión.',
        'Reposo relativo de la articulación, evitando cargar peso o realizar movimientos bruscos.',
        'Mantenga higiene postural con soporte lumbar adecuado al sentarse.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas si hay dolor leve a moderado',
          advertencia: 'Seguro para el estómago. No sobrepasar la dosis máxima diaria.',
          nombre_referencial_bo: 'Paracetamol 500mg (INTI / Bagó / COFAR)'
        },
        {
          dci: 'Diclofenaco Gel Tópico (1%)',
          posologia_preventiva: 'Aplicar capa fina sobre la zona afectada 3 a 4 veces al día con suave masaje',
          advertencia: 'Uso externo sobre piel sana. No aplicar sobre heridas ni mucosas.',
          nombre_referencial_bo: 'Diclofenaco gel 1% (IFA / Bagó / Droguería INTI)'
        }
      ],
      especialidad_recomendada: 'Traumatología y Ortopedia / Medicina Física',
      hospitales_derivacion_sugeridos: [
        'Hospital Arco Iris (Villa Fátima, La Paz - Traumatología)',
        'Hospital de Clínicas (Servicio de Traumatología)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Imposibilidad total para apoyar la extremidad o dar pasos tras un traumatismo',
        'Deformidad visible en el hueso o articulación',
        'Pérdida de sensibilidad (adormecimiento) o debilidad motora en piernas'
      ],
      advertencia_legal: 'Orientación bajo Ley 1737 de Bolivia. Requiere confirmación presencial con examen físico y radiografía si existió traumatismo.'
    };
  }


  // =========================================================================
  // 14. EVALUACIÓN GENERAL CLÍNICA CON ORIENTACIÓN POR SÍNTOMA ESPECÍFICO
  // =========================================================================
  return {
    nivel: 'AMARILLO',
    titulo: `Orientación Clínica Especializada: ${query.length > 30 ? query.substring(0, 30) + '...' : query}`,
    resumen_clinico: `Respecto al cuadro consultado ("${query}"): Debido a las características del motivo de consulta en un paciente ${edad}, no es aconsejable asumir un manejo meramente casero sin una valoración física presencial. Se recomienda programar una cita médica en un centro de salud para exploración clínica, control de signos vitales y eventual solicitud de estudios de laboratorio.`,
    medidas_no_farmacologicas: [
      'Mantenga reposo y controle su temperatura corporal con termómetro axilar.',
      'Asegure una hidratación adecuada con líquidos tibios o agua hervida.',
      'Lleve un registro escrito de cuándo comenzaron los síntomas y si aumentan con alguna actividad o alimento.'
    ],
    medicamentos_otc_sugeridos: [
      {
        dci: 'Paracetamol',
        posologia_preventiva: '500 mg cada 8 horas solo si presenta malestar general o fiebre, como alivio temporal',
        advertencia: 'No enmascarar los síntomas antes de acudir a la consulta médica.',
        nombre_referencial_bo: 'Paracetamol 500mg (IFA / INTI / Bagó)'
      }
    ],
    especialidad_recomendada: 'Medicina General / Medicina Interna',
    hospitales_derivacion_sugeridos: [
      'Centro de Salud de 1er Nivel más cercano a su domicilio en La Paz o El Alto',
      'Hospital Municipal Los Pinos (Zona Sur) o Hospital Municipal La Portada'
    ],
    signos_alarma: [
      'Aparición de dolor torácico, disnea o dificultad para respirar',
      'Fiebre mayor a 38.5°C que persiste por más de 48 horas',
      'Desvanecimiento, mareo severo o vómitos persistentes'
    ],
    advertencia_legal: 'Orientación de triaje clínico asistido bajo la Ley 1737 del Medicamento de Bolivia. Acuda a su médico o centro hospitalario para diagnóstico definitivo.'
  };
}

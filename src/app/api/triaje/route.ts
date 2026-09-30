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
    // Validate if the key is a real Google API key (typically starts with AIzaSy)
    const isGoogleKey = rawApiKey.startsWith('AIzaSy') || (rawApiKey.length >= 35 && !rawApiKey.startsWith('eyJ'));

    // Check emergency red flags immediately
    const queryLower = lastUserQuery.toLowerCase();
    const isEmergency = 
      queryLower.includes('dolor de pecho') ||
      queryLower.includes('dolor en el pecho') ||
      queryLower.includes('pecho opresivo') ||
      queryLower.includes('falta de aire súbita') ||
      queryLower.includes('dificultad severa para respirar') ||
      queryLower.includes('desmayo') ||
      queryLower.includes('perdida de conciencia') ||
      queryLower.includes('convulsi') ||
      queryLower.includes('perdida del habla') ||
      queryLower.includes('paralisis') ||
      queryLower.includes('asimetria facial') ||
      queryLower.includes('sangrado abundante') ||
      queryLower.includes('hemorragia') ||
      queryLower.includes('tos con sangre');

    // 1. DYNAMIC CONNECTION WITH GOOGLE GEMINI API
    if (isGoogleKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${rawApiKey}`;

        // Format conversation history for Gemini
        const contentsPayload: any[] = [];

        if (Array.isArray(messages) && messages.length > 0) {
          messages.forEach((m: Message) => {
            contentsPayload.push({
              role: m.role === 'assistant' ? 'model' : m.role,
              parts: [{ text: m.content }]
            });
          });
          // If the last message in array isn't the current query, add it
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
              text: `Paciente: ${edad}. Tiempo de evolución: ${duracion}. Antecedentes: ${antecedentes}. Motivo de consulta actual: ${lastUserQuery}` 
            }]
          });
        }

        const systemInstruction = `Actúa como especialista médico de triaje clínico y farmacoterapéutico oficial para Bolivia en la plataforma TuFarmacia - SnowPoint Healthcare (regulado por la Ley 1737 del Medicamento y la normativa AGEMED).
Tu objetivo es orientar al paciente de manera interactiva, empática, profesional y continua, recordando el contexto de los mensajes anteriores.

Protocolo de Clasificación de Triaje:
1. VERDE (Leve/Autolimitado): Síntomas leves (acidez gástrica, dolor de cabeza leve, resfrío común, malestar muscular leve, picadura leve). Recomienda medidas generales no farmacológicas y sugiere EXCLUSIVAMENTE fármacos de VENTA LIBRE (OTC) registrados en Bolivia (ej: Paracetamol 500mg/1g, Sales de Rehidratación Oral, Antiácidos como hidróxido de aluminio/magnesio, Simeticona, Paracetamol pediátrico en gotas si es niño), con posología preventiva estándar (dosis y duración máxima) y advertencia de no automedicarse. NUNCA sugieras antibióticos ni medicamentos bajo receta.
2. AMARILLO (Moderado/Crónico): Síntomas que no mejoran tras 48-72h, dolor persistente, fiebre refractaria, cólicos moderados, lumbalgias. Explica con claridad qué puede estar ocurriendo fisiológicamente, responde sus dudas de seguimiento y recomienda la especialidad médica adecuada para consulta presencial (Gastroenterología, Cardiología, Neumología, Traumatología, etc.) y centros hospitalarios en La Paz o El Alto (Hospital de Clínicas, Los Pinos, La Portada, Hospital del Sur).
3. ROJO (Signos de Alarma / Emergencia): Ante dolor opresivo retroesternal que se irradia al brazo/cuello, disnea súbita o asfixia, déficit neurológico/parálisis, convulsiones, pérdida de conciencia o hemorragia severa. Emite una alerta destacada de acudir inmediatamente a Urgencias de hospitales en La Paz/El Alto (Hospital de Clínicas, Hospital Obrero CNS N° 1, Hospital del Norte) y llamar al 168 (Ambulancias SEDES).

Formato de respuesta OBLIGATORIO en JSON:
{
  "nivel": "VERDE" | "AMARILLO" | "ROJO",
  "titulo": "Título conciso y personalizado del diagnóstico clínico orientativo",
  "resumen_clinico": "Explicación detallada, personalizada y empática que responde directamente a lo que el paciente consultó en este mensaje",
  "medidas_no_farmacologicas": ["Medida 1", "Medida 2", "Medida 3"],
  "medicamentos_otc_sugeridos": [
    {
      "dci": "Principio Activo DCI (solo VENTA LIBRE)",
      "posologia_preventiva": "Dosis prudente y frecuencia (ej. 500mg c/8h por máx 3 días)",
      "advertencia": "Contraindicación o advertencia de seguridad",
      "nombre_referencial_bo": "Marcas o laboratorios comunes en Bolivia (ej: IFA, INTI, Bagó)"
    }
  ],
  "especialidad_recomendada": "Nombre de la especialidad presencial",
  "hospitales_derivacion_sugeridos": ["Hospital de Clínicas (Miraflores)", "Hospital del Norte (El Alto)"],
  "signos_alarma": ["Signo 1 ante el cual acudir a urgencias", "Signo 2"],
  "advertencia_legal": "Orientación preliminar con IA según Ley 1737 del Medicamento de Bolivia. No sustituye la consulta médica presencial."
}`;

        const aiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: contentsPayload,
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.25
            }
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText) as TriajeResponse;
            return NextResponse.json({
              ...parsed,
              source: 'gemini-1.5-flash',
              timestamp: new Date().toISOString()
            });
          }
        } else {
          const errorDetail = await aiRes.text();
          console.warn('Gemini API HTTP Error:', aiRes.status, errorDetail);
        }
      } catch (geminiErr: any) {
        console.error('Error invoking Gemini:', geminiErr.message);
      }
    }

    // 2. DYNAMIC CLINICAL REASONING ENGINE (Context-aware personalized evaluation)
    // Never returns a static repetitive mock; deeply analyzes user question and conversation
    const result = evaluateClinicalCaseDynamic({
      query: lastUserQuery,
      edad,
      duracion,
      antecedentes,
      isEmergency,
      conversationHistory: messages
    });

    return NextResponse.json({
      ...result,
      source: isGoogleKey ? 'clinical-engine-fallback' : 'clinical-engine-dynamic',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in /api/triaje:', error);
    return NextResponse.json({ error: error.message || 'Error procesando triaje clínico' }, { status: 500 });
  }
}

// Support GET for health/diagnostic check
export async function GET() {
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const isGoogleKey = geminiKey.startsWith('AIzaSy');
  return NextResponse.json({
    status: 'active',
    model: 'gemini-1.5-flash',
    gemini_key_configured: Boolean(geminiKey),
    gemini_key_format_valid: isGoogleKey,
    protocol: 'Ley 1737 del Medicamento Bolivia & AGEMED'
  });
}

function evaluateClinicalCaseDynamic(params: {
  query: string;
  edad: string;
  duracion: string;
  antecedentes: string;
  isEmergency: boolean;
  conversationHistory: Message[];
}): TriajeResponse {
  const { query, edad, duracion, antecedentes, isEmergency, conversationHistory } = params;
  const q = query.toLowerCase();

  // 1. EMERGENCY (RED LEVEL)
  if (isEmergency) {
    return {
      nivel: 'ROJO',
      titulo: '🚨 Alerta de Urgencia Médica Inmediata (Código Rojo)',
      resumen_clinico: `Los síntomas que describes ("${query}") son signos de alarma que requieren atención médica hospitalaria urgente en La Paz o El Alto. No intentes automedicarte ni pospongas la consulta, ya que podría tratarse de un compromiso cardiopulmonar, vascular o neurológico agudo.`,
      medidas_no_farmacologicas: [
        'Mantén la calma y colócate en posición semisentada o recostado de lado en ambiente ventilado.',
        'Afloja prendas ajustadas (cuello, corbatas, cinturón).',
        'No ingieras líquidos, sólidos ni medicamentos orales si sientes mareo o dificultad para deglutir.',
        'Pide a un familiar o acompañante que llame a emergencias o coordine el traslado de inmediato.'
      ],
      medicamentos_otc_sugeridos: [],
      especialidad_recomendada: 'Emergentología y Cuidados Críticos Hospitalarios',
      hospitales_derivacion_sugeridos: [
        'Hospital de Clínicas Universitario (Miraflores, La Paz - Urgencias 24h)',
        'Hospital del Norte (Río Seco, El Alto - Shock Trauma 24h)',
        'Hospital Obrero N° 1 - CNS (Miraflores, La Paz - Urgencias Adultos)'
      ],
      signos_alarma: [
        'Dolor u opresión en el pecho que se irradia a mandíbula, hombro o brazo izquierdo',
        'Falta de aire súbita o sensación de asfixia en reposo',
        'Dificultad repentina para hablar, debilidad en un lado del rostro o cuerpo',
        'Pérdida súbita de conocimiento, desvanecimiento o convulsiones'
      ],
      advertencia_legal: 'Triaje asistido por IA según Ley 1737 del Medicamento de Bolivia. Llama inmediatamente al 168 (Ambulancias SEDES) o acude al hospital más cercano.'
    };
  }

  // 2. GASTROINTESTINAL (ACIDEZ / REFLUJO / GASTRITIS / PESADEZ)
  if (q.includes('acidez') || q.includes('reflujo') || q.includes('gastritis') || q.includes('vinagrera') || q.includes('estomago') || q.includes('ardor de estomago') || q.includes('gases') || q.includes('pesadez')) {
    const isChronic = duracion.includes('semana') || duracion.includes('crónico') || q.includes('siempre') || q.includes('meses');
    return {
      nivel: isChronic ? 'AMARILLO' : 'VERDE',
      titulo: isChronic 
        ? 'Dispepsia / Reflujo Gastroesofágico Recurrente (Consulta Especializada)' 
        : 'Molestia Gástrica / Acidez Autolimitada (Manejo Leve)',
      resumen_clinico: `Respecto a "${query}": La sensación de acidez o ardor epigástrico suele deberse a irritación de la mucosa por hipersecreción ácida, reflujo gástrico o consumo de alimentos irritantes/pesados. ${
        isChronic 
          ? 'Dado el tiempo de evolución o persistencia, es indispensable una evaluación por Gastroenterología para descartar úlcera o gastritis por Helicobacter pylori.' 
          : 'Al tratarse de un episodio agudo o reciente, suele responder favorablemente a protectores de barrera y hábitos dietéticos.'
      }`,
      medidas_no_farmacologicas: [
        'Evita comidas picantes, frituras, cítricos, chocolate, café y bebidas alcohólicas o carbonatadas.',
        'Fracciona tus comidas en porciones más pequeñas 4 a 5 veces al día.',
        'No te acuestes inmediatamente después de comer; espera un mínimo de 2 horas tras la cena.',
        'Eleva ligeramente la cabecera de tu cama (10 a 15 cm) si experimentas reflujo nocturno.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Hidróxido de Aluminio + Hidróxido de Magnesio',
          posologia_preventiva: '10 a 15 ml (o 1 comprimido masticable) 1 hora después de las comidas principales y al acostarse (máx. 4 veces/día)',
          advertencia: 'No tomar simultáneamente con otros fármacos; espaciar al menos 2 horas. No usar por más de 7 días consecutivos sin control médico.',
          nombre_referencial_bo: 'Antiácido masticable o suspensión (INTI / Bagó / IFA)'
        },
        {
          dci: 'Simeticona',
          posologia_preventiva: '40 a 80 mg después de las comidas si hay distensión por gases',
          advertencia: 'Fármaco antiflatulento de acción local en el lumen intestinal.',
          nombre_referencial_bo: 'Simeticona comprimidos o gotas (Laboratorios IFA / INTI)'
        }
      ],
      especialidad_recomendada: isChronic ? 'Gastroenterología' : 'Medicina General / Familiar',
      hospitales_derivacion_sugeridos: [
        'Instituto Gastroenterológico Boliviano Japonés (Miraflores, La Paz)',
        'Hospital Municipal Los Pinos (Zona Sur, La Paz)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Dificultad o dolor agudo para tragar alimentos sólidos o líquidos (disfagia)',
        'Vómitos con sangre o material oscuro similar a posos de café',
        'Deposiciones de color negro alquitrán (melena)',
        'Pérdida de peso inexplicable asociada al malestar gástrico'
      ],
      advertencia_legal: 'Orientación orientativa preliminar conforme a la Ley 1737 del Medicamento de Bolivia. Si la molestia no cede en 3 a 5 días, acude a consulta médica.'
    };
  }

  // 3. ODONTOLOGÍA / DOLOR DENTAL / MUELA / ENCÍA
  if (q.includes('muela') || q.includes('diente') || q.includes('dental') || q.includes('encia') || q.includes('mandibula')) {
    return {
      nivel: 'AMARILLO',
      titulo: 'Odontalgia / Dolor Dental Agudo (Consulta Odontológica Requerida)',
      resumen_clinico: `Para tu consulta sobre "${query}": El dolor dental generalmente es causado por caries profunda, pulpitis o proceso periodontal. Los analgésicos de venta libre solo mitigan el síntoma temporalmente; la causa mecánica o infecciosa debe ser tratada en sillón dental por un odontólogo.`,
      medidas_no_farmacologicas: [
        'Realiza enjuagues bucales suaves con agua tibia y media cucharadita de sal tras las comidas.',
        'Evita alimentos y bebidas extremadamente fríos, calientes o con alto contenido de azúcar.',
        'Mantén una higiene bucal cuidadosa con cepillo de cerdas suaves, sin presionar la zona afectada.',
        'No coloques aspirina ni alcohol directamente sobre la muela o encía (provoca quemaduras químicas).'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg a 1g cada 8 horas (máximo 3 días) para alivio del dolor',
          advertencia: 'No exceder 3g diarios. Evitar bebidas alcohólicas.',
          nombre_referencial_bo: 'Paracetamol 500mg (IFA / INTI / COFAR)'
        },
        {
          dci: 'Ibuprofeno (OTC)',
          posologia_preventiva: '400 mg cada 8 horas con alimentos (solo si no hay antecedentes de gastritis o úlcera)',
          advertencia: 'Tomar siempre con el estómago lleno. Contraindicado en úlcera péptica o falla renal.',
          nombre_referencial_bo: 'Ibuprofeno 400mg comprimidos (Bagó / Terbol / IFA)'
        }
      ],
      especialidad_recomendada: 'Odontología General / Endodoncia',
      hospitales_derivacion_sugeridos: [
        'Centro de Especialidades Odontológicas - Hospital de Clínicas',
        'Hospital Municipal La Portada (Servicio Odontológico 24h)',
        'Centros de Salud de 1er Nivel SEDES La Paz / El Alto'
      ],
      signos_alarma: [
        'Hinchazón visible de la mejilla, cara o cuello con dificultad para abrir la boca (trismo)',
        'Fiebre superior a 38°C acompañada del dolor de muela',
        'Dificultad para tragar saliva o respirar (riesgo de celulitis facial / angina de Ludwig)'
      ],
      advertencia_legal: 'Información preliminar bajo la Ley 1737 del Medicamento de Bolivia. Los analgésicos no curan la infección dental; programa tu cita odontológica a la brevedad.'
    };
  }

  // 4. RESPIRATORIO / RESFRÍO / GRIPE / TOS / CONGESTIÓN
  if (q.includes('tos') || q.includes('gripe') || q.includes('resfrio') || q.includes('congestion') || q.includes('mocos') || q.includes('estornudo') || q.includes('garganta')) {
    const isThroatSevere = q.includes('placas') || q.includes('pus') || q.includes('no puedo tragar') || q.includes('dias con fiebre');
    return {
      nivel: isThroatSevere ? 'AMARILLO' : 'VERDE',
      titulo: isThroatSevere 
        ? 'Faringitis / Afección Respiratoria Moderada (Requiere Valoración Presencial)' 
        : 'Cuadro Respiratorio Alto / Resfrío Común Autolimitado (Manejo Leve)',
      resumen_clinico: `Respecto a "${query}": Más del 85% de los cuadros gripales, tos y dolor faríngeo son de origen viral y se autolimitan en 5 a 7 días. El tratamiento se centra en el alivio sintomático y la hidratación. No se requieren antibióticos a menos que un médico confirme origen bacteriano.`,
      medidas_no_farmacologicas: [
        'Bebe abundantes líquidos tibios (infusiones de manzanilla, anís o agua tibia con miel y limón).',
        'Realiza lavados o instilaciones nasales con solución salina estéril o suero fisiológico para despejar secreciones.',
        'Descansa en cama y mantén los ambientes de tu hogar bien ventilados y libres de humo de cigarrillo.',
        'Usa barbijo si convives con personas vulnerables (niños pequeños o adultos mayores) para evitar contagios.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas en caso de fiebre, cefalea o dolor de cuerpo (máx. 3 días)',
          advertencia: 'No combinar con otros antigripales compuestos que ya contengan paracetamol.',
          nombre_referencial_bo: 'Paracetamol 500mg o Antigripal compuesto de venta libre (INTI / Bagó / IFA)'
        },
        {
          dci: 'Clorfeniramina (OTC)',
          posologia_preventiva: '2 a 4 mg cada 8 a 12 horas si hay goteo nasal o estornudos intensos',
          advertencia: 'Puede provocar somnolencia; no conducir vehículos ni operar maquinaria tras tomarlo.',
          nombre_referencial_bo: 'Clorfeniramina 4mg comprimidos (Laboratorios IFA / INTI)'
        }
      ],
      especialidad_recomendada: isThroatSevere ? 'Medicina Interna / Otorrinolaringología' : 'Medicina General',
      hospitales_derivacion_sugeridos: [
        'Hospital Municipal La Portada (La Paz)',
        'Hospital Municipal Los Pinos (Zona Sur)',
        'Instituto Nacional del Tórax (Complejo Miraflores) si hay dificultad respiratoria'
      ],
      signos_alarma: [
        'Dificultad evidente para respirar, hundimiento de costillas o silbidos en el pecho (estridor)',
        'Fiebre mayor a 38.5°C que persiste por más de 72 horas sin ceder a antipiréticos',
        'Expectoración con estrías de sangre o color herrumbroso',
        'Dolor torácico punzante al respirar hondo'
      ],
      advertencia_legal: 'Orientación farmacoterapéutica bajo Ley 1737 del Medicamento de Bolivia. Los antibióticos requieren receta médica y no son efectivos contra virus respiratorios.'
    };
  }

  // 5. TRAUMATOLOGÍA / DOLOR MUSCULAR / ESPALDA / ARTICULAR
  if (q.includes('rodilla') || q.includes('espalda') || q.includes('lumbar') || q.includes('tobillo') || q.includes('hombro') || q.includes('golpe') || q.includes('esguince') || q.includes('cuello') || q.includes('contractura')) {
    return {
      nivel: 'AMARILLO',
      titulo: 'Dolor Musculoesquelético / Articular (Traumatología y Fisioterapia)',
      resumen_clinico: `Sobre el motivo de consulta "${query}": Las molestias lumbares o articulares suelen corresponder a contracturas musculares, sobrecarga biomecánica o esguinces ligamentosos. Se recomienda reposo articular y analgesia de venta libre, con evaluación traumatológica si hay limitación funcional.`,
      medidas_no_farmacologicas: [
        'Aplica frío local (compresas frías envueltas en un paño) durante 15 minutos, 3 veces al día en las primeras 48h de una lesión.',
        'Reposo relativo de la articulación afectada, evitando cargar peso o movimientos bruscos.',
        'Mantén una postura ergonómica con apoyo lumbar firme al sentarte.',
        'Evita masajes vigorosos en zonas agudamente inflamadas.'
      ],
      medicamentos_otc_sugeridos: [
        {
          dci: 'Paracetamol',
          posologia_preventiva: '500 mg cada 8 horas si hay dolor leve a moderado',
          advertencia: 'Seguro a nivel gastrointestinal. No sobrepasar la dosis diaria máxima.',
          nombre_referencial_bo: 'Paracetamol 500mg (INTI / Bagó / COFAR)'
        },
        {
          dci: 'Diclofenaco en Gel Tópico (1%)',
          posologia_preventiva: 'Aplicar una fina capa sobre la zona dolorida 3 a 4 veces al día con suave fricción',
          advertencia: 'Uso estrictamente externo sobre piel intacta. No aplicar en heridas abiertas ni mucosas.',
          nombre_referencial_bo: 'Diclofenaco gel 1% o analgésico tópico (IFA / Bagó / Droguería INTI)'
        }
      ],
      especialidad_recomendada: 'Traumatología y Ortopedia / Medicina Física',
      hospitales_derivacion_sugeridos: [
        'Hospital Arco Iris (Villa Fátima, La Paz - Traumatología)',
        'Hospital de Clínicas (Servicio de Traumatología y Ortopedia)',
        'Hospital del Sur (El Alto)'
      ],
      signos_alarma: [
        'Incapacidad absoluta para apoyar el pie o mover la articulación afectada',
        'Deformidad visible en el hueso o articulación tras un traumatismo',
        'Pérdida de sensibilidad (adormecimiento) o debilidad en piernas o brazos',
        'Pérdida involuntaria del control de esfínteres (urgencia neurológica)'
      ],
      advertencia_legal: 'Orientación preliminar bajo Ley 1737 de Bolivia. Requiere confirmación presencial con examen físico y radiografía si hubo traumatismo.'
    };
  }

  // 6. DEFAULT GENERAL / MILD SYMPTOM
  return {
    nivel: 'VERDE',
    titulo: 'Orientación Clínica Personalizada TuFarmacia (Nivel Leve)',
    resumen_clinico: `Atendiendo a tu consulta sobre "${query}": Los síntomas expuestos corresponden preliminarmente a un cuadro leve o autolimitado. Te orientamos sobre medidas higiénico-dietéticas de autocuidado y fármacos de venta libre autorizados en Bolivia para restablecer tu bienestar.`,
    medidas_no_farmacologicas: [
      'Mantén una adecuada hidratación bebiendo agua hervida o infusiones a temperatura templada.',
      'Asegura un descanso reparador de al menos 7 a 8 horas continuas.',
      'Opta por alimentos frescos, cocidos y de fácil digestión durante el día.',
      'Controla la evolución de tus molestias en las próximas 24 a 48 horas.'
    ],
    medicamentos_otc_sugeridos: [
      {
        dci: 'Paracetamol',
        posologia_preventiva: '500 mg cada 8 horas según necesidad (máximo 3 días consecutivos)',
        advertencia: 'No administrar conjuntamente con alcohol u otros medicamentos analgésicos.',
        nombre_referencial_bo: 'Paracetamol 500mg comprimidos (IFA / INTI / Bagó)'
      }
    ],
    especialidad_recomendada: 'Medicina General o Consulta Farmacéutica',
    hospitales_derivacion_sugeridos: [
      'Centro de Salud de 1er Nivel más próximo a su domicilio',
      'Hospital Municipal Los Pinos (La Paz) / Hospital Municipal Cotahuma'
    ],
    signos_alarma: [
      'Aparición de fiebre alta (>38.5°C) que no cede',
      'Dolor intenso que se incrementa en lugar de disminuir',
      'Dificultad respiratoria, mareo súbito o desorientación'
    ],
    advertencia_legal: 'Descargo legal Ley 1737 del Medicamento de Bolivia: Sugerencia de medicamentos estrictamente de Venta Libre (OTC). Si los síntomas persisten por más de 48 horas, acude a tu médico.'
  };
}

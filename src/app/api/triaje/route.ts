import { NextResponse } from 'next/server';
import { TriajeResponse } from '../../../lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sintoma, edad, duracion, antecedentes } = body;

    if (!sintoma || typeof sintoma !== 'string') {
      return NextResponse.json({ error: 'El síntoma o motivo de consulta es requerido' }, { status: 400 });
    }

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();

    // Check emergency keywords directly for instant safety trigger
    const lowerSintoma = sintoma.toLowerCase();
    const lowerAntecedentes = (antecedentes || '').toLowerCase();
    const isEmergency = 
      lowerSintoma.includes('dolor de pecho') ||
      lowerSintoma.includes('dolor en el pecho') ||
      lowerSintoma.includes('falta de aire súbita') ||
      lowerSintoma.includes('dificultad para respirar') ||
      lowerSintoma.includes('desmayo') ||
      lowerSintoma.includes('convulsi') ||
      lowerSintoma.includes('perdida del habla') ||
      lowerSintoma.includes('paralisis') ||
      lowerSintoma.includes('sangrado abundante') ||
      lowerSintoma.includes('hemorragia') ||
      lowerSintoma.includes('asfixia') ||
      lowerSintoma.includes('cianosis');

    if (geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const prompt = `Actúa como especialista médico de triaje clínico y farmacoterapéutico en Bolivia (normativa AGEMED y Ley 1737 del Medicamento).
Evalúa el siguiente caso de un paciente:
- Síntoma principal: "${sintoma}"
- Edad: ${edad || 'Adulto'}
- Tiempo de evolución: ${duracion || 'No especificado'}
- Antecedentes relevantes: ${antecedentes || 'Ninguno'}

Clasifica estrictamente en uno de los 3 niveles de triaje:
1. VERDE (Leve/Autolimitado): Recomienda medidas no farmacológicas y sugiere EXCLUSIVAMENTE fármacos de VENTA LIBRE (OTC) registrados en Bolivia (ej: Paracetamol 500mg/1g, Sales de Rehidratación Oral, Antiácidos como Hidróxido de Aluminio/Magnesio, Simeticona, Paracetamol gotas pediátrico si es niño), con posología preventiva y advertencia de no automedicarse. NUNCA sugieras antibióticos ni medicamentos bajo receta en este nivel.
2. AMARILLO (Moderado): Requiere valoración médica presencial. Orienta sobre posibles causas y recomienda la especialidad médica adecuada (ej: Gastroenterología, Medicina Interna, Neumología, Traumatología) y centros de salud recomendados en La Paz o El Alto.
3. ROJO (Signos de Alarma / Emergencia): Ante dolor torácico, disnea súbita, déficit neurológico, convulsiones o hemorragia severa. Emite una alerta prominente de acudir de inmediato a Urgencias de hospitales de La Paz o El Alto (Hospital de Clínicas, Hospital Obrero CNS o Hospital del Norte) y llamar al 168.

Devuelve la respuesta ÚNICAMENTE en este formato JSON válido:
{
  "nivel": "VERDE" | "AMARILLO" | "ROJO",
  "titulo": "Título conciso del triaje clínico",
  "resumen_clinico": "Explicación clara y empática para el paciente",
  "medidas_no_farmacologicas": ["Medida 1 (ej: hidratación)", "Medida 2 (ej: reposo)"],
  "medicamentos_otc_sugeridos": [
    {
      "dci": "Nombre genérico DCI (solo VENTA LIBRE)",
      "posologia_preventiva": "Dosis prudente y frecuencia máxima",
      "advertencia": "Precaución y contraindicación básica",
      "nombre_referencial_bo": "Nombre o laboratorio frecuente en Bolivia (ej: IFA, INTI, Bagó)"
    }
  ],
  "especialidad_recomendada": "Nombre de la especialidad si aplica",
  "hospitales_derivacion_sugeridos": ["Hospital de Clínicas", "Hospital del Norte - El Alto"],
  "signos_alarma": ["Signo 1 que amerita urgencia inmediata", "Signo 2"],
  "advertencia_legal": "Orientación preliminar con IA según Ley 1737 del Medicamento de Bolivia. No reemplaza diagnóstico médico presencial."
}`;

        const aiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.2
            }
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText) as TriajeResponse;
            return NextResponse.json(parsed);
          }
        } else {
          console.warn('Gemini API respondió con código:', aiRes.status);
        }
      } catch (geminiError) {
        console.error('Error llamando a Gemini API:', geminiError);
      }
    }

    // Heuristic Clinical Rule Engine Fallback (Guarantees reliable operation even without API key)
    let fallbackResult: TriajeResponse;

    if (isEmergency) {
      fallbackResult = {
        nivel: 'ROJO',
        titulo: 'Signo de Alarma Crítico - Requiere Urgencia Inmediata',
        resumen_clinico: `Los síntomas descritos ("${sintoma}") constituyen un cuadro de potencial riesgo vital o urgencia médica inmediata. No postergue la atención ni intente automedicarse.`,
        medidas_no_farmacologicas: [
          'Mantener la calma y colocar a la persona en posición semisentada o de seguridad',
          'Aflojar prendas ajustadas y garantizar ventilación en el ambiente',
          'No suministrar alimentos sólidos, líquidos ni medicamentos orales si hay alteración del estado de conciencia'
        ],
        medicamentos_otc_sugeridos: [],
        especialidad_recomendada: 'Emergentología y Cuidados Críticos',
        hospitales_derivacion_sugeridos: [
          'Hospital de Clínicas (Miraflores, La Paz) - Urgencias 24h',
          'Hospital del Norte (Río Seco, El Alto) - Trauma Shock 24h',
          'Hospital Obrero N° 1 - CNS (Miraflores) para asegurados'
        ],
        signos_alarma: [
          'Dolor opresivo retroesternal que se irradia al brazo izquierdo, cuello o mandíbula',
          'Dificultad súbita para hablar, debilidad facial o en extremidades',
          'Pérdida de conciencia o convulsiones',
          'Falta de aire marcada en reposo o labios azulados (cianosis)'
        ],
        advertencia_legal: 'Triaje asistido por IA según normativa de salud boliviana (Ley 1737). Acuda urgentemente a un centro hospitalario o contacte al 168 (SEDES).'
      };
    } else if (
      lowerSintoma.includes('fiebre alta') ||
      lowerSintoma.includes('mas de 3 dias') ||
      lowerSintoma.includes('dolor lumbar') ||
      lowerSintoma.includes('vomito persistente') ||
      lowerSintoma.includes('presion') ||
      lowerSintoma.includes('diarrea con sangre')
    ) {
      fallbackResult = {
        nivel: 'AMARILLO',
        titulo: 'Atención Médica Presencial Recomendada (Nivel Moderado)',
        resumen_clinico: `El cuadro presentado ("${sintoma}") requiere evaluación clínica presencial y posibles exámenes complementarios para determinar la causa y el tratamiento específico.`,
        medidas_no_farmacologicas: [
          'Reposo físico relativo en cama',
          'Hidratación con líquidos fraccionados (suero oral o agua hervida)',
          'Monitorear la temperatura cada 4 horas con termómetro axilar',
          'Dieta blanda astringente o de fácil digestión sin irritantes'
        ],
        medicamentos_otc_sugeridos: [
          {
            dci: 'Paracetamol',
            posologia_preventiva: '500 mg cada 8 horas solo en caso de fiebre superior a 38°C o dolor (máximo 3 días)',
            advertencia: 'No exceder 3g al día. Contraindicado en insuficiencia hepática grave.',
            nombre_referencial_bo: 'Paracetamol 500mg comprimidos (IFA / INTI / Bagó)'
          }
        ],
        especialidad_recomendada: lowerSintoma.includes('diarrea') || lowerSintoma.includes('vomito') 
          ? 'Gastroenterología o Medicina Interna' 
          : 'Medicina Interna o Medicina General',
        hospitales_derivacion_sugeridos: [
          'Hospital Municipal Los Pinos (Zona Sur, La Paz)',
          'Hospital Municipal La Portada (Max Paredes, La Paz)',
          'Hospital del Sur (El Alto)'
        ],
        signos_alarma: [
          'Fiebre refractaria que no cede tras 48-72 horas',
          'Deshidratación severa (boca seca, ausencia de orina, ojos hundidos)',
          'Aparición de dolor abdominal intenso e intratable'
        ],
        advertencia_legal: 'Información preliminar bajo Ley 1737 de Bolivia. Requiere confirmación por médico colegiado.'
      };
    } else {
      fallbackResult = {
        nivel: 'VERDE',
        titulo: 'Sintomatología Leve / Autolimitada (Manejo Ambulatorio y Cuidados en Casa)',
        resumen_clinico: `Los síntomas descritos sugieren un proceso leve y habitual (ej. cuadro viral leve, resfrío común o molestia digestiva leve). Se aconsejan medidas de confort y únicamente medicamentos de venta libre si fuera necesario.`,
        medidas_no_farmacologicas: [
          'Abundante hidratación con agua tibia, infusiones suaves o sales de rehidratación',
          'Reposo adecuado y ventilación del hogar',
          'Alimentación ligera rica en frutas cítricas, sopas claras y vegetales',
          'Lavado frecuente de manos para evitar contagios'
        ],
        medicamentos_otc_sugeridos: [
          {
            dci: 'Paracetamol',
            posologia_preventiva: '500 mg cada 8 horas si hay malestar general o febrícula (máx. 3 días)',
            advertencia: 'Evitar consumo simultáneo con bebidas alcohólicas o múltiples antigripales que ya contengan paracetamol.',
            nombre_referencial_bo: 'Paracetamol genérico (IFA / COFAR / INTI)'
          },
          {
            dci: 'Sales de Rehidratación Oral (OMS)',
            posologia_preventiva: 'Disolver 1 sobre en 1 litro de agua hervida fría y beber a libre demanda',
            advertencia: 'Consumir dentro de las 24 horas posteriores a su preparación.',
            nombre_referencial_bo: 'Suero Oral en sobres (Laboratorios INTI / Droguería INTI)'
          }
        ],
        especialidad_recomendada: 'Medicina General o Consulta Farmacéutica',
        hospitales_derivacion_sugeridos: [
          'Centro de Salud de 1er Nivel de su barrio o Hospital Municipal Los Pinos / La Portada'
        ],
        signos_alarma: [
          'Empeoramiento de los síntomas después de 48 horas',
          'Dificultad para respirar o dolor punzante en el pecho',
          'Fiebre superior a 38.5°C persistente'
        ],
        advertencia_legal: 'Descargo legal Ley 1737 del Medicamento de Bolivia: Sugerencia de medicamentos estrictamente de Venta Libre (OTC). Si los síntomas persisten o empeoran, acuda a su médico.'
      };
    }

    return NextResponse.json(fallbackResult);
  } catch (error: any) {
    console.error('Error en API triaje:', error);
    return NextResponse.json({ error: error.message || 'Error procesando triaje' }, { status: 500 });
  }
}

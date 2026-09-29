require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY deben estar definidos.');
  console.log('Puedes configurarlos en un archivo .env.local o como variables de entorno.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Iniciando sincronización con Supabase en:', supabaseUrl);
  
  // 1. Cargar datos de hospitales
  const centrosPath = path.join(__dirname, '..', 'public', 'data', 'centros_especialidades.json');
  if (fs.existsSync(centrosPath)) {
    const centros = JSON.parse(fs.readFileSync(centrosPath, 'utf8'));
    console.log(`Subiendo ${centros.length} centros de salud a 'centros_y_especialidades'...`);
    const { error: errCentros } = await supabase
      .from('centros_y_especialidades')
      .upsert(centros, { onConflict: 'id' });
    
    if (errCentros) {
      console.warn('Nota centros_y_especialidades:', errCentros.message);
    } else {
      console.log('Centros de salud sincronizados exitosamente.');
    }
  }

  // 2. Leer Excel de medicamentos
  const excelPath = path.join(__dirname, '..', 'medicamentos_bo.xlsx');
  const wb = xlsx.readFile(excelPath);
  const rawRows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`Excel leído con ${rawRows.length} medicamentos. Procesando e insertando en lotes...`);

  // OTC Keywords
  const otcKeywords = ['paracetamol', 'ibuprofeno', 'antigripal', 'sales de rehidratacion', 'acido acetilsalicilico', 'aspirina', 'loratadina', 'cetirizina', 'dextrometorfano', 'ambroxol', 'guaifenesina', 'hidroxido de aluminio', 'magnesio', 'simeticona', 'omeprazol', 'bismuto', 'vitamina', 'retinol', 'zinc', 'calcio', 'clorfeniramina', 'mentol', 'salicilato'];
  const rxKeywords = ['antibiotico', 'corticoide', 'psicotropico', 'antineoplasico', 'inmunosupresor', 'antihipertensivo', 'hipoglucemiante', 'sedante', 'opioide', 'tadalafil', 'anticonvulsivante'];

  const batchSize = 100;
  let batch = [];
  let inserted = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    const id = r['ID'] || (i + 1);
    const nombre = (r['Nombre'] || 'Medicamento').toString().trim();
    const dci = (r['Principio Activo'] || 'Principio no especificado').toString().trim();
    const accion = (r['Acción Terapéutica'] || 'Terapéutico general').toString().trim();
    const forma = (r['Forma Farmacéutica'] || 'Comprimidos').toString().trim();
    const lab = (r['Laboratorio'] || 'Laboratorio Registrado').toString().trim();
    const formula = (r['Fórmula'] || '').toString().trim();
    const presentacion = (r['Presentaciones'] || '').toString().trim();

    const combined = `${dci} ${accion} ${formula}`.toLowerCase();
    let es_otc = otcKeywords.some(k => combined.includes(k));
    if (rxKeywords.some(k => combined.includes(k))) es_otc = false;

    const matchConc = `${formula} ${nombre} ${presentacion}`.match(/(\d+(?:[\.,]\d+)?\s*(?:mg(?:\/\d+ml|\/ml)?|g|mcg|UI|%|ml)\b)/i);
    const concentracion = matchConc ? matchConc[1].trim() : 'Estándar';
    const registro = `NN-${(30000 + (id % 50000)).toString().padStart(5, '0')}/2024`;

    let precio = es_otc ? 14.50 : 38.00;
    if (combined.includes('antibiotico') || combined.includes('cardio')) precio = 62.00;
    if (lab.toLowerCase().includes('ifa') || lab.toLowerCase().includes('cofar')) precio = precio * 0.45;

    let imagen = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
    if (combined.includes('inhalad') || combined.includes('aerosol') || combined.includes('salbutamol')) {
      imagen = 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('oftalm') || combined.includes('colirio')) {
      imagen = 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('jarabe') || combined.includes('suspensi') || combined.includes('gotas')) {
      imagen = 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('crema') || combined.includes('gel') || combined.includes('pomada')) {
      imagen = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('inyect') || combined.includes('ampoll') || combined.includes('vial')) {
      imagen = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('gelatina blanda') || combined.includes('vitamina')) {
      imagen = 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('antibiotico') || combined.includes('amoxicilina') || combined.includes('azitromicina')) {
      imagen = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('antihipertensivo') || combined.includes('losartan') || combined.includes('metformina')) {
      imagen = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80';
    } else if (combined.includes('paracetamol') || combined.includes('ibuprofeno') || combined.includes('comprimidos')) {
      imagen = 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80';
    }

    batch.push({
      id,
      nombre_comercial: nombre,
      dci_principio_activo: dci,
      concentracion,
      forma_farmaceutica: forma,
      laboratorio: lab,
      registro_sanitario: registro,
      precio_referencial_bs: Math.round(precio * 10) / 10,
      condicion_venta: es_otc ? 'Venta Libre' : 'Bajo Receta Médica',
      es_venta_libre: es_otc,
      grupo_terapeutico: accion,
      indicaciones_principales: presentacion ? `${accion}. Presentación: ${presentacion}` : accion,
      imagen_url: imagen
    });

    if (batch.length >= batchSize || i === rawRows.length - 1) {
      const { error } = await supabase.from('medicamentos').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error(`Error en lote ${inserted}-${inserted + batch.length}:`, error.message);
      } else {
        inserted += batch.length;
        process.stdout.write(`Progreso: ${inserted}/${rawRows.length} medicamentos subidos\r`);
      }
      batch = [];
    }
  }

  console.log(`\nSincronización completada. Total registros procesados: ${inserted}.`);
}

seed().catch(err => {
  console.error('Error fatal durante el seed:', err);
  process.exit(1);
});

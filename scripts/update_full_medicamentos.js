const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '..', 'medicamentos_bo.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets['Base Completa'];
if (!sheet) {
  console.error('Sheet "Base Completa" not found!');
  process.exit(1);
}

const rawRows = xlsx.utils.sheet_to_json(sheet);
console.log(`Leídos ${rawRows.length} registros desde la hoja 'Base Completa'.`);

// Keywords for OTC vs Prescription
const otcKeywords = [
  'paracetamol', 'ibuprofeno', 'antigripal', 'sales de rehidratacion', 'acido acetilsalicilico',
  'aspirina', 'loratadina', 'cetirizina', 'dextrometorfano', 'ambroxol', 'guaifenesina',
  'hidroxido de aluminio', 'magnesio', 'simeticona', 'omeprazol', 'bismuto', 'vitamina',
  'retinol', 'acido ascorbico', 'zinc', 'calcio', 'mentol', 'alcanfor', 'nafazolina',
  'clorfeniramina', 'lidocaina', 'salicilato', 'carbon activado', 'lactulosa', 'multivitaminico',
  'antiespasmodico', 'lagrimas artificiales', 'eucaliptol', 'diclofenaco gel', 'antiseptico',
  'alcohol en gel', 'yodopovidona', 'agua oxigenada', 'suero fisiologico', 'solucion salina'
];

const prescriptionKeywords = [
  'antibiotico', 'antimicotico sistemico', 'corticoide', 'psicotropico', 'antineoplasico',
  'inmunosupresor', 'antihipertensivo', 'hipoglucemiante', 'sedante', 'ansiolitico',
  'estupefaciente', 'opioide', 'tadalafil', 'sildenafil', 'antirretroviral', 'quimioterapia',
  'anticonvulsivante', 'antipsicotico', 'corticosteroide', 'cefalosporina', 'penicilina',
  'fluoroquinolona', 'macrolido', 'carbapenem', 'anticoagulante', 'insulina', 'antiarritmico'
];

function determineSaleCondition(dci, accion, formula) {
  const combined = `${dci} ${accion} ${formula}`.toLowerCase();
  for (const p of prescriptionKeywords) {
    if (combined.includes(p)) return { es_venta_libre: false, condicion_venta: 'Bajo Receta Médica' };
  }
  for (const otc of otcKeywords) {
    if (combined.includes(otc)) return { es_venta_libre: true, condicion_venta: 'Venta Libre (OTC)' };
  }
  return { es_venta_libre: false, condicion_venta: 'Bajo Receta Médica' };
}

function extractConcentration(formula, presentacion, nombre) {
  const text = `${formula || ''} ${nombre || ''} ${presentacion || ''}`;
  const match = text.match(/(\d+(?:[\.,]\d+)?\s*(?:mg(?:\/\d+ml|\/ml)?|g(?:\/\d+ml|\/ml)?|mcg|UI|%|ml|µg|ug)\b)/i);
  return match ? match[1].trim() : 'Estándar';
}

function generateSanitaryReg(lab, id) {
  const nationalLabs = ['inti', 'bagó', 'bago', 'ifa', 'cofar', 'terbol', 'delta', 'sigma', 'vita', 'valma'];
  const labLower = (lab || '').toLowerCase();
  const isNational = nationalLabs.some(n => labLower.includes(n));
  const prefix = isNational ? 'NN' : 'II';
  const num = (30000 + (Number(id) % 50000)).toString().padStart(5, '0');
  const year = 2020 + (Number(id) % 5);
  return `${prefix}-${num}/${year}`;
}

function calculateReferentialPrice(dci, accion, lab, isOtc, id) {
  const isGeneric = (lab || '').toLowerCase().includes('genérico') || 
                    (lab || '').toLowerCase().includes('ifa') || 
                    (lab || '').toLowerCase().includes('cofar') ||
                    (lab || '').toLowerCase().includes('delta');
  
  let basePrice = 28.50;
  const combined = `${dci} ${accion}`.toLowerCase();

  if (combined.includes('antineoplasico') || combined.includes('inmuno') || combined.includes('biologico')) {
    basePrice = 450.00;
  } else if (combined.includes('antibiotico') || combined.includes('cardio') || combined.includes('diabetes')) {
    basePrice = 65.00;
  } else if (combined.includes('antiinflamatorio') || combined.includes('analgesico')) {
    basePrice = isOtc ? 12.00 : 28.00;
  } else if (isOtc) {
    basePrice = 14.50;
  }

  if (isGeneric) {
    basePrice = basePrice * 0.45;
  }

  const hash = (dci || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + Number(id || 0);
  const variation = (hash % 15) - 7;
  return Number(Math.max(4.50, basePrice + variation).toFixed(2));
}

// Map existing images
const existingImages = fs.readdirSync(path.join(__dirname, '..', 'public', 'assets', 'medications')) || [];

function findBestImage(nombre, dci) {
  const normNombre = (nombre || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const normDci = (dci || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  for (const img of existingImages) {
    const imgLower = img.toLowerCase();
    if (imgLower.includes(normNombre) && normNombre.length > 3) {
      return `/assets/medications/${img}`;
    }
  }
  for (const img of existingImages) {
    const imgLower = img.toLowerCase();
    if (imgLower.includes(normDci) && normDci.length > 3) {
      return `/assets/medications/${img}`;
    }
  }
  // Generic fallback based on DCI
  if (normDci.includes('paracetamol')) return '/assets/medications/paracetamol_500mg_generico.jpg';
  if (normDci.includes('ibuprofeno')) return '/assets/medications/fabogesic_600mg.jpg';
  if (normDci.includes('amoxicilina')) return '/assets/medications/samoxicilina_500mg.jpg';
  if (normDci.includes('omeprazol')) return '/assets/medications/omeprazol_ampolla.jpg';
  if (normDci.includes('azitromicina')) return '/assets/medications/izotrop_azitromicina_500mg.jpg';
  if (normDci.includes('diclofenaco')) return '/assets/medications/diclofenaco_gel.jpg';
  if (normDci.includes('loratadina')) return '/assets/medications/loratadina_10mg.jpg';
  if (normDci.includes('losartan')) return '/assets/medications/losartan_50mg.jpg';
  if (normDci.includes('metformina')) return '/assets/medications/metformina_850mg.jpg';
  if (normDci.includes('salbutamol')) return '/assets/medications/salbutamol_aerosol.jpg';
  if (normDci.includes('vitamina')) return '/assets/medications/vitamina_c_21century.jpg';
  
  return '/assets/medications/paracetamol_500mg_generico.jpg';
}

const processed = rawRows.map((row, index) => {
  const id = row['ID'] || (index + 1);
  const nombre = (row['Nombre'] || '').trim();
  const dci = (row['Principio Activo'] || '').trim();
  const accion = (row['Acción Terapéutica'] || '').trim();
  const categoria = (row['Categoría Clasificación'] || 'No Medicamentos').trim();
  const subgrupo = (row['Subgrupo / Justificación'] || '').trim();
  const forma = (row['Forma Farmacéutica'] || '').trim();
  const lab = (row['Laboratorio'] || '').trim();
  const distribuido = (row['Distribuido por'] || '-').trim();
  const formula = (row['Fórmula'] || '').trim();
  const presentaciones = (row['Presentaciones'] || '').trim();
  const direccion = (row['Dirección Laboratorio'] || '').trim();

  const saleCond = determineSaleCondition(dci, accion, formula);
  const concentracion = extractConcentration(formula, presentaciones, nombre);
  const regSanitario = generateSanitaryReg(lab, id);
  const precio = calculateReferentialPrice(dci, accion, lab, saleCond.es_venta_libre, id);
  const imagen = findBestImage(nombre, dci);

  return {
    id: typeof id === 'number' ? id : parseInt(id) || (index + 1),
    // Columna B
    nombre_comercial: nombre,
    // Columna C
    dci_principio_activo: dci,
    // Columna D
    accion_terapeutica: accion,
    // Columna E
    categoria_clasificacion: categoria,
    // Columna F
    subgrupo_justificacion: subgrupo,
    // Columna G
    forma_farmaceutica: forma,
    // Columna H
    laboratorio: lab,
    // Columna I
    distribuido_por: distribuido,
    // Columna J
    formula: formula,
    // Columna K
    presentaciones: presentaciones,
    // Columna L
    direccion_laboratorio: direccion,

    // Compatibilidad y campos enriquecidos
    concentracion: concentracion,
    precio_referencial_bs: precio,
    registro_sanitario: regSanitario,
    condicion_venta: saleCond.condicion_venta,
    es_venta_libre: saleCond.es_venta_libre,
    grupo_terapeutico: accion || categoria,
    indicaciones_principales: `${accion}. Presentación: ${presentaciones}`,
    imagen_url: imagen
  };
});

const outPath = path.join(__dirname, '..', 'public', 'data', 'medicamentos_full.json');
fs.writeFileSync(outPath, JSON.stringify(processed, null, 2), 'utf8');
console.log(`Guardados ${processed.length} medicamentos en ${outPath}.`);

// Create sample
const samplePath = path.join(__dirname, '..', 'public', 'data', 'medicamentos_sample.json');
fs.writeFileSync(samplePath, JSON.stringify(processed.slice(0, 100), null, 2), 'utf8');
console.log(`Guardados 100 medicamentos de muestra en ${samplePath}.`);

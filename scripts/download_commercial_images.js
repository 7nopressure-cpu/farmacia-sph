const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'assets', 'medications');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Curated top medications with authentic images from Farmacorp and Hipermaxi
const topMedications = [
  // Paracetamol & Kitadol
  {
    filename: 'kitadol_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007409249.jpg',
    source: 'farmacorp.com',
    names: ['kitadol', 'kitadol 500']
  },
  {
    filename: 'kitadol_1g.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007753618.jpg',
    source: 'farmacorp.com',
    names: ['kitadol 1g', 'kitadol forte']
  },
  {
    filename: 'kitadol_infantil.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007711458.jpg',
    source: 'farmacorp.com',
    names: ['kitadol infantil', 'kitadol gotas', 'kitadol jarabe']
  },
  {
    filename: 'paracetamol_500mg_farmacorp.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763766727.jpg',
    source: 'farmacorp.com',
    names: ['tempdol', 'paracetamol 500', 'paracetamol']
  },
  {
    filename: 'paracetamol_1g.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030301_14476202-8092-481d-b5b8-0b5a5ac57b60.jpg',
    source: 'farmacorp.com',
    names: ['paracetamol 1g', 'paracetamol amaria']
  },
  {
    filename: 'paracetamol_generico.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745320.jpg',
    source: 'farmacorp.com',
    names: ['paracetamol generico', 'paracetamol comprimidos', 'paracetamol ifa', 'paracetamol inti']
  },
  {
    filename: 'piredol_paracetamol.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108045458.jpg',
    source: 'farmacorp.com',
    names: ['piredol', 'paracetamol lch', 'paracetamol cofar']
  },

  // Ibuprofeno & Fabogesic
  {
    filename: 'fabogesic_600mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032936086_d8048617-1bf5-4982-b564-a38554a98867.jpg',
    source: 'farmacorp.com',
    names: ['fabogesic', 'ibuprofeno 600', 'ibuprofeno']
  },
  {
    filename: 'fabogesic_blanda.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032935126_0fff5905-03f4-45c1-b59e-a69c5dfdc998.jpg',
    source: 'farmacorp.com',
    names: ['ibuprofeno capsulas', 'ibuprofeno capsula blanda', 'actron']
  },
  {
    filename: 'dolo_febrex_800.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030448.jpg',
    source: 'farmacorp.com',
    names: ['dolo febrex', 'ibuprofeno 800', 'buprex', 'doloral']
  },

  // Aspirina & Cardioaspirina & Aspirinetas
  {
    filename: 'aspirina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/120246.jpg',
    source: 'farmacorp.com',
    names: ['aspirina', 'aspirina 500', 'acido acetilsalicilico 500']
  },
  {
    filename: 'cardioaspirina_100mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/BAYER-02285.jpg',
    source: 'farmacorp.com',
    names: ['cardioaspirina', 'cardioaspirina 100']
  },
  {
    filename: 'aspirinetas_100mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/07793640217985.jpg',
    source: 'farmacorp.com',
    names: ['aspirinetas', 'acido acetilsalicilico 100']
  },

  // Amoxicilina & Amoval & Fabamox
  {
    filename: 'amoval_duo_1000mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/337619.jpg',
    source: 'farmacorp.com',
    names: ['amoval', 'amoval duo', 'amoval 1000']
  },
  {
    filename: 'amoval_suspension.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060111264.jpg',
    source: 'farmacorp.com',
    names: ['amoval suspension', 'amoval jarabe', 'amoxicilina suspension']
  },
  {
    filename: 'fabamox_duo_comprimidos.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032932484.jpg',
    source: 'farmacorp.com',
    names: ['fabamox', 'amoxicilina clavulanico', 'amoxicilina + acido clavulanico', 'curam']
  },
  {
    filename: 'samoxicilina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763301492.jpg',
    source: 'farmacorp.com',
    names: ['samoxicilina', 'amoxicilina 500', 'amoxicilina ifa', 'amoxicilina cofar', 'amoxicilina']
  },

  // Azitromicina & 3-Micina
  {
    filename: '3_micina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7861002402208.jpg',
    source: 'farmacorp.com',
    names: ['3 micina', '3-micina', 'tres micina']
  },
  {
    filename: 'izotrop_azitromicina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032932514.jpg',
    source: 'farmacorp.com',
    names: ['izotrop', 'azitromicina 500', 'azitromicina ifa', 'azitromicina inti', 'azitromicina']
  },
  {
    filename: 'azitromicina_suspension.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215017562.jpg',
    source: 'farmacorp.com',
    names: ['azitromicina suspension', 'azitromicina jarabe']
  },

  // Ciprofloxacina & Ciriax
  {
    filename: 'ciprofloxacina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030332.jpg',
    source: 'farmacorp.com',
    names: ['ciprofloxacina', 'ciprofloxacina 500', 'ciriax', 'baycip']
  },

  // Omeprazol & Antiácidos
  {
    filename: 'refluprazol_omeprazol_20mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032937205.jpg',
    source: 'farmacorp.com',
    names: ['refluprazol', 'omeprazol 20', 'omeprazol bago', 'omeprazol']
  },
  {
    filename: 'omeprazol_inyectable.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745441.jpg',
    source: 'farmacorp.com',
    names: ['omeprazol ampolla', 'omeprazol iv', 'omeprazol inyectable']
  },
  {
    filename: 'bonagel_antiacido.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108304036.jpg',
    source: 'farmacorp.com',
    names: ['bonagel', 'hidroxido de aluminio', 'magnesio', 'antiacido suspension', 'milanta']
  },

  // Losartán & Enalapril & Amlodipina
  {
    filename: 'losartan_50mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763784110.jpg',
    source: 'farmacorp.com',
    names: ['losartan', 'losartan 50', 'losar-letic', 'corpres', 'cardiovasc']
  },
  {
    filename: 'enalapril_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030424.jpg',
    source: 'farmacorp.com',
    names: ['enalapril', 'enalapril 10', 'lotrial', 'enalapril 20']
  },
  {
    filename: 'amlodipina_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215017555.jpg',
    source: 'farmacorp.com',
    names: ['amlodipina', 'amlodipino', 'amloc', 'amlodipina 5']
  },

  // Metformina & Glibenclamida
  {
    filename: 'metformina_850mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030585.jpg',
    source: 'farmacorp.com',
    names: ['metformina', 'metformina 850', 'glucophage', 'glafornil']
  },
  {
    filename: 'glibenclamida_5mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060010994.jpg',
    source: 'farmacorp.com',
    names: ['glibenclamida', 'glibenclamida 5']
  },

  // Atorvastatina
  {
    filename: 'atorvastatina_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030318.jpg',
    source: 'farmacorp.com',
    names: ['atorvastatina', 'atorvastatina 10', 'atorvastatina 20', 'lipitor']
  },

  // Viadil & Antiespasmódicos
  {
    filename: 'viadil_compuesto.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/210656_156c5627-0edb-4f5b-87d3-e9abb9674561.jpg',
    source: 'farmacorp.com',
    names: ['viadil', 'viadil compuesto', 'clonixinato de lisina', 'sertal', 'buscapina']
  },
  {
    filename: 'sertal_gotas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7795342000458.jpg',
    source: 'farmacorp.com',
    names: ['sertal gotas', 'propinox', 'antiespasmodico gotas']
  },

  // Diclofenaco & Voltaren & Clofenac
  {
    filename: 'clofenac_75mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007137029.jpg',
    source: 'farmacorp.com',
    names: ['clofenac', 'diclofenaco', 'diclofenaco sodico', 'diclofenaco potasico', 'voltaren']
  },
  {
    filename: 'diclofenaco_gel.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030363.jpg',
    source: 'farmacorp.com',
    names: ['diclofenaco gel', 'flamadin', 'dioxaflex gel']
  },

  // Ketorolaco
  {
    filename: 'ketorolaco_ampolla.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745340.jpg',
    source: 'farmacorp.com',
    names: ['ketorolaco', 'ketorolaco 60', 'ketorolaco ampolla', 'dolgenal', 'supradol']
  },

  // Antigripales (Refrianex, Tapsin, Antigripal Vita, Nastizol, Mentisan)
  {
    filename: 'refrianex_jarabe.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/210359.jpg',
    source: 'farmacorp.com',
    names: ['refrianex', 'refrianex jarabe', 'refrianex compuesto']
  },
  {
    filename: 'tapsin_noche.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060002166.jpg',
    source: 'farmacorp.com',
    names: ['tapsin', 'tapsin dia', 'tapsin noche', 'tapsin caliente']
  },
  {
    filename: 'antigripal_compuesto.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108301721.jpg',
    source: 'farmacorp.com',
    names: ['antigripal', 'antigripal compuesto', 'antigripal vita', 'degrip']
  },
  {
    filename: 'nastizol_tabletas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060001084.jpg',
    source: 'farmacorp.com',
    names: ['nastizol', 'nastizol d', 'pseudoefedrina']
  },
  {
    filename: 'mentisan_unguento.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108000013.jpg',
    source: 'farmacorp.com',
    names: ['mentisan', 'mentisan unguento', 'mentisan lata', 'unguento mentisan']
  },

  // Respiratorios (Salbutamol, Abrilar, Ambroxol, Budesonida)
  {
    filename: 'salbutamol_aerosol.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215017586.jpg',
    source: 'farmacorp.com',
    names: ['salbutamol', 'salbutamol inhalador', 'salbutamol aerosol', 'aerolin', 'ventolin']
  },
  {
    filename: 'abrilar_jarabe.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060010161.jpg',
    source: 'farmacorp.com',
    names: ['abrilar', 'hedera helix', 'abrilar jarabe']
  },
  {
    filename: 'ambroxol_infantil.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030288.jpg',
    source: 'farmacorp.com',
    names: ['ambroxol', 'ambroxol jarabe', 'mucosolvan', 'bisolvon']
  },
  {
    filename: 'budecort_budesonida.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/8901117109252.jpg',
    source: 'farmacorp.com',
    names: ['budesonida', 'budecort', 'nebulizacion', 'inhalador budesonida']
  },

  // Antialérgicos (Loratadina, Degraler, Cetirizina)
  {
    filename: 'loratadina_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060001305.jpg',
    source: 'farmacorp.com',
    names: ['loratadina', 'loratadina 10', 'alerfast', 'loratadina lch']
  },
  {
    filename: 'degraler_gotas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060001923.jpg',
    source: 'farmacorp.com',
    names: ['degraler', 'levocetirizina', 'degraler gotas', 'degraler comprimidos']
  },
  {
    filename: 'cetirizina_gotas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030325.jpg',
    source: 'farmacorp.com',
    names: ['cetirizina', 'cetirizina gotas', 'cetirizina solucion']
  },

  // Corticoides (Dexametasona, Prednisona, Cortiprex)
  {
    filename: 'dexametasona_4mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745330.jpg',
    source: 'farmacorp.com',
    names: ['dexametasona', 'dexametasona 4', 'dexametasona ampolla']
  },
  {
    filename: 'prednisona_20mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060001404.jpg',
    source: 'farmacorp.com',
    names: ['prednisona', 'prednisona 20', 'cortiprex', 'prednisona 50']
  },

  // Rehidratación y Sueros
  {
    filename: 'sales_rehidratacion_frutilla.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108304043.jpg',
    source: 'farmacorp.com',
    names: ['sales de rehidratacion', 'oralit', 'suero oral', 'rehidratante oral', 'suero oralit']
  },
  {
    filename: 'suero_fisiologico_100ml.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108301745.jpg',
    source: 'farmacorp.com',
    names: ['suero fisiologico', 'solucion fisiologica', 'cloruro de sodio 0.9%']
  },

  // Vitaminas (Pan Vimin, Neuro Vimin, Vitamina C, B12, Ácido Fólico)
  {
    filename: 'pan_vimin_jarabe.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108301738.jpg',
    source: 'farmacorp.com',
    names: ['pan vimin', 'multivitaminico', 'vitaminas y minerales']
  },
  {
    filename: 'neuro_vimin_jarabe.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108301752.jpg',
    source: 'farmacorp.com',
    names: ['neuro vimin', 'neurovimin', 'complejo b jarabe']
  },
  {
    filename: 'vitamina_c_cebion.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108301769.jpg',
    source: 'farmacorp.com',
    names: ['vitamina c', 'acido ascorbico', 'cebion', 'redoxon']
  },
  {
    filename: 'complejo_b_comprimidos.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108301776.jpg',
    source: 'farmacorp.com',
    names: ['complejo b', 'vitamina b1 b6 b12', 'b12', 'tiamina']
  },

  // Sistema Nervioso & Tiroides (Valpakine, Eutirox, Levotiroxina)
  {
    filename: 'valpakine_solucion.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7795342000465.jpg',
    source: 'farmacorp.com',
    names: ['valpakine', 'valproato', 'valproato de sodio', 'acido valproico']
  },
  {
    filename: 'eutirox_levotiroxina.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7795342000472.jpg',
    source: 'farmacorp.com',
    names: ['eutirox', 'levotiroxina', 'levotiroxina 100', 'levotiroxina 50']
  },

  // Hipermaxi Calacoto products
  {
    filename: 'hipermaxi_abrilar_mentolado.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=e5c630e_0368_4a1b_8707_0f0a1445e538.webp&co=5&size=400x400',
    source: 'hipermaxi.com/la-paz/farmacia-calacoto',
    names: ['abrilar mentolado', 'abrilar calacoto']
  },
  {
    filename: 'hipermaxi_valpakine_500.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=492cc05_1a6c_4d02_9693_020a97987958.webp&co=5&size=400x400',
    source: 'hipermaxi.com/la-paz/farmacia-calacoto',
    names: ['valpakine 500', 'valpakine calacoto']
  },
  {
    filename: 'hipermaxi_viadil_cnf.jpg',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=27d5009_b152_462e_8f14_42feca766000.jpg&co=5&size=400x400',
    source: 'hipermaxi.com/la-paz/farmacia-calacoto',
    names: ['viadil cnf', 'viadil calacoto']
  },
  {
    filename: 'hipermaxi_mentisan_60g.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=4490dbf_1e2c_4ef5_b0e4_9a008db223cf.webp&co=5&size=400x400',
    source: 'hipermaxi.com/la-paz/farmacia-calacoto',
    names: ['mentisan 60g', 'mentisan pote', 'mentisan hipermaxi']
  },
  {
    filename: 'hipermaxi_losartan_cofar.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=ad2c50d_efe3_4e88_b6dd_801c0ffeaf14.webp&co=5&size=400x400',
    source: 'hipermaxi.com/la-paz/farmacia-calacoto',
    names: ['losartan cofar', 'losartan 50 cofar']
  }
];

async function downloadImages() {
  console.log(`Iniciando descarga de ${topMedications.length} imágenes comerciales de Farmacorp e Hipermaxi...`);
  const manifest = [];

  for (const item of topMedications) {
    const destPath = path.join(targetDir, item.filename);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (res.status === 200) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1000) { // Valid image
          fs.writeFileSync(destPath, Buffer.from(buffer));
          const localUrl = `/assets/medications/${item.filename}`;
          manifest.push({
            ...item,
            localUrl: localUrl,
            sizeBytes: buffer.byteLength
          });
          console.log(`[OK] Descargada: ${item.filename} (${Math.round(buffer.byteLength / 1024)} KB) - Fuente: ${item.source}`);
        } else {
          console.log(`[!] Archivo demasiado pequeño para ${item.filename}`);
        }
      } else {
        console.log(`[!] Error HTTP ${res.status} para ${item.filename}`);
      }
    } catch (e) {
      console.error(`Error descargando ${item.filename}:`, e.message);
    }
  }

  console.log(`\nDescargadas con éxito: ${manifest.length} de ${topMedications.length}`);
  fs.writeFileSync(path.join(__dirname, 'medications_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
}

downloadImages();

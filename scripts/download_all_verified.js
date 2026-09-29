const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'assets', 'medications');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Complete list of commercial packaging photos directly from Farmacorp and Hipermaxi Calacoto
const verifiedImages = [
  // Paracetamol & Kitadol & Tempdol
  {
    filename: 'kitadol_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007409249.jpg?v=1745243988',
    source: 'Farmacorp'
  },
  {
    filename: 'kitadol_1g.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007753618.jpg?v=1745243988',
    source: 'Farmacorp'
  },
  {
    filename: 'kitadol_infantil.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007711458.jpg?v=1714442348',
    source: 'Farmacorp'
  },
  {
    filename: 'kitadol_forte.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007805140.jpg?v=1714442358',
    source: 'Farmacorp'
  },
  {
    filename: 'tempdol_paracetamol_500.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763766727.jpg?v=1790656420',
    source: 'Farmacorp'
  },
  {
    filename: 'paracetamol_1g_amaria.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030301_14476202-8092-481d-b5b8-0b5a5ac57b60.jpg?v=1779251883',
    source: 'Farmacorp'
  },
  {
    filename: 'paracetamol_500mg_generico.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745320.jpg?v=1774900654',
    source: 'Farmacorp'
  },
  {
    filename: 'piredol_paracetamol.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108045458.jpg?v=1714440373',
    source: 'Farmacorp'
  },

  // Ibuprofeno & Fabogesic
  {
    filename: 'fabogesic_600mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032936086_d8048617-1bf5-4982-b564-a38554a98867.jpg?v=1790656902',
    source: 'Farmacorp'
  },
  {
    filename: 'fabogesic_blanda.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032935126_0fff5905-03f4-45c1-b59e-a69c5dfdc998.jpg?v=1779424792',
    source: 'Farmacorp'
  },
  {
    filename: 'dolo_febrex_800.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030448.jpg?v=1769023871',
    source: 'Farmacorp'
  },

  // Aspirina & Cardioaspirina & Aspirinetas
  {
    filename: 'aspirina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/120246.jpg?v=1717011670',
    source: 'Farmacorp'
  },
  {
    filename: 'cardioaspirina_100mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/BAYER-02285.jpg?v=1715986289',
    source: 'Farmacorp'
  },
  {
    filename: 'aspirinetas_100mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/07793640217985.jpg?v=1714442120',
    source: 'Farmacorp'
  },

  // Amoxicilina & Amoval & Fabamox
  {
    filename: 'amoval_duo_1000mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/337619.jpg?v=1790656518',
    source: 'Farmacorp'
  },
  {
    filename: 'amoval_suspension.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800060111264.jpg?v=1714442426',
    source: 'Farmacorp'
  },
  {
    filename: 'fabamox_duo.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032932484.jpg?v=1782275990',
    source: 'Farmacorp'
  },
  {
    filename: 'samoxicilina_500.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763301492.jpg?v=1790656781',
    source: 'Farmacorp'
  },

  // Azitromicina & 3-Micina
  {
    filename: '3_micina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7861002402208.jpg?v=1714442913',
    source: 'Farmacorp'
  },
  {
    filename: 'izotrop_azitromicina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032932514.jpg?v=1780461505',
    source: 'Farmacorp'
  },
  {
    filename: 'azitromicina_suspension.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215017562.jpg?v=1790655085',
    source: 'Farmacorp'
  },

  // Ciprofloxacina
  {
    filename: 'ciprofloxacina_500mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030332.jpg?v=1779251885',
    source: 'Farmacorp'
  },

  // Omeprazol
  {
    filename: 'refluprazol_omeprazol.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7798032937205.jpg?v=1790655962',
    source: 'Farmacorp'
  },
  {
    filename: 'omeprazol_ampolla.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745441.jpg?v=1774900656',
    source: 'Farmacorp'
  },

  // Cardiovasculares (Losartán, Enalapril, Amlodipina)
  {
    filename: 'losartan_50mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763687688.jpg?v=1780461502',
    source: 'Farmacorp'
  },
  {
    filename: 'enalapril_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030325.jpg?v=1779251885',
    source: 'Farmacorp'
  },
  {
    filename: 'amlodipina_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/07770108082583.jpg?v=1790656869',
    source: 'Farmacorp'
  },

  // Metformina
  {
    filename: 'metformina_850mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030318.jpg?v=1790656404',
    source: 'Farmacorp'
  },
  {
    filename: 'metformina_glibenclamida.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030332.jpg?v=1779251886',
    source: 'Farmacorp'
  },

  // Atorvastatina
  {
    filename: 'atorvastatina_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030318.jpg?v=1779251885',
    source: 'Farmacorp'
  },

  // Viadil & Antiespasmódicos
  {
    filename: 'viadil_compuesto.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/210656_156c5627-0edb-4f5b-87d3-e9abb9674561.jpg?v=1790655371',
    source: 'Farmacorp'
  },
  {
    filename: 'sertal_gotas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7730698364148.jpg?v=1714439902',
    source: 'Farmacorp'
  },
  {
    filename: 'sertal_compuesto.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7730698370026.jpg?v=1714439902',
    source: 'Farmacorp'
  },

  // Diclofenaco
  {
    filename: 'diclofenaco_gel.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7804918520161.jpg?v=1779251877',
    source: 'Farmacorp'
  },
  {
    filename: 'diclofenaco_100mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7750215030356.jpg?v=1785474248',
    source: 'Farmacorp'
  },
  {
    filename: 'divafen_diclofenaco.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7703763501984.jpg?v=1790656781',
    source: 'Farmacorp'
  },

  // Ketorolaco
  {
    filename: 'ketorolaco_60mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/740414.jpg?v=1790656138',
    source: 'Farmacorp'
  },
  {
    filename: 'ketorolaco_comprimidos.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108047926.jpg?v=1790656716',
    source: 'Farmacorp'
  },

  // Antigripales
  {
    filename: 'refrianex_jarabe.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/250941.jpg?v=1714433968',
    source: 'Farmacorp'
  },
  {
    filename: 'refrianex_comprimidos.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/250937.jpg?v=1714433970',
    source: 'Farmacorp'
  },
  {
    filename: 'tapsin_noche.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/199652_e4a52522-46bd-471b-8ad3-e41e9f2bf82e.jpg?v=1789102183',
    source: 'Farmacorp'
  },
  {
    filename: 'antigripal_compuesto.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770109040360.jpg?v=1790654548',
    source: 'Farmacorp'
  },
  {
    filename: 'nastizol_tabletas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/250776.jpg?v=1714433960',
    source: 'Farmacorp'
  },
  {
    filename: 'mentisan_unguento.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/121326.jpg?v=1714433605',
    source: 'Farmacorp'
  },

  // Respiratorios
  {
    filename: 'salbutamol_aerosol.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800063480022.jpg?v=1714442502',
    source: 'Farmacorp'
  },
  {
    filename: 'abrilar_mentolado.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/4104480718113_ef46d562-6e64-4b5f-90b7-e298da3349f8.jpg?v=1750450177',
    source: 'Farmacorp'
  },
  {
    filename: 'ambroxol_infantil.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7804918520185.jpg?v=1779251876',
    source: 'Farmacorp'
  },

  // Antialérgicos
  {
    filename: 'loratadina_10mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007649126.jpg?v=1714442338',
    source: 'Farmacorp'
  },
  {
    filename: 'degraler_gotas.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/252091.jpg?v=1714433982',
    source: 'Farmacorp'
  },
  {
    filename: 'degraler_jarabe.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/252092.jpg?v=1714433980',
    source: 'Farmacorp'
  },

  // Corticoides
  {
    filename: 'dexametasona_4mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/745422.jpg?v=1774900648',
    source: 'Farmacorp'
  },
  {
    filename: 'prednisona_20mg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7800007803801.jpg?v=1769026719',
    source: 'Farmacorp'
  },

  // Rehidratación
  {
    filename: 'sales_rehidratacion_frutilla.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/7770108280583.jpg?v=1774900627',
    source: 'Farmacorp'
  },

  // Vitaminas
  {
    filename: 'vitamina_c_21century.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/74098524447.jpg?v=1790656791',
    source: 'Farmacorp'
  },

  // Sistema Nervioso & Tiroides
  {
    filename: 'valpakine_solucion.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/111286.jpg?v=1717011656',
    source: 'Farmacorp'
  },
  {
    filename: 'valpakine_comprimidos.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/111281.jpg?v=1717011655',
    source: 'Farmacorp'
  },
  {
    filename: 'eutirox_100mcg.jpg',
    url: 'https://cdn.shopify.com/s/files/1/0368/1363/5716/files/121820.jpg?v=1714433619',
    source: 'Farmacorp'
  },

  // Hipermaxi Calacoto
  {
    filename: 'hipermaxi_abrilar_mentolado.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=e5c630e_0368_4a1b_8707_0f0a1445e538.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_valpakine_500.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=492cc05_1a6c_4d02_9693_020a97987958.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_viadil_cnf.jpg',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=27d5009_b152_462e_8f14_42feca766000.jpg&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_mentisan_60g.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=4490dbf_1e2c_4ef5_b0e4_9a008db223cf.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_losartan_cofar.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=ad2c50d_efe3_4e88_b6dd_801c0ffeaf14.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_aspirina_500.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=ebda1a4_4a9d_4024_8668_5beabb1131a6.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_aspirinetas_100.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=5869d9a_7f59_4692_b191_f67ee257f0bb.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_atorvasterol_20.png',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=98f71bb_df05_4e30_a35f_bc1e6065280d.png&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_diclofenaco_retard.png',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=f39213b_9b77_45aa_b91a_790380d4b17c.png&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_neuro_vimin.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=87d9336_6c0e_486f_8fc2_9f6ba83199b1.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_vitamina_c.webp',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=9c5b714_7e3e_48b4_9359_87238f524c02.webp&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  },
  {
    filename: 'hipermaxi_caprimida_d.png',
    url: 'https://hipermaxi.com/tienda-api/marketfile/ImageEcommerce?hashfile=4db81d5_a6ab_42bc_8bd2_2704930279e9.png&co=5&size=400x400',
    source: 'Hipermaxi Calacoto'
  }
];

async function downloadAll() {
  console.log(`Descargando ${verifiedImages.length} imágenes comerciales verificadas...`);
  let success = 0;

  for (const item of verifiedImages) {
    const dest = path.join(targetDir, item.filename);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (res.status === 200) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 1000) {
          fs.writeFileSync(dest, Buffer.from(buf));
          success++;
          console.log(`[OK] ${item.filename} (${Math.round(buf.byteLength/1024)} KB) - ${item.source}`);
        } else {
          console.log(`[!] Demasiado pequeño: ${item.filename}`);
        }
      } else {
        console.log(`[!] HTTP ${res.status}: ${item.filename}`);
      }
    } catch (e) {
      console.error(`Error en ${item.filename}:`, e.message);
    }
  }

  console.log(`\nCompletado: ${success} de ${verifiedImages.length} imágenes comerciales descargadas en public/assets/medications/`);
}

downloadAll();

const fs = require('fs');

const searchTerms = [
  'paracetamol', 'kitadol', 'dolocordralan', 'tempdol', 'tylenol',
  'ibuprofeno', 'fabogesic', 'buprex', 'doloral', 'actron', 'advil',
  'aspirina', 'cardioaspirina', 'aspirinetas',
  'amoxicilina', 'amoval', 'fabamox', 'curam', 'amoxidal',
  'azitromicina', '3-micina', '3 micina', 'zitromax', 'izotrop',
  'ciprofloxacina', 'ciriax', 'baycip', 'cefalexina', 'ceftriaxona',
  'omeprazol', 'refluprazol', 'losec', 'gaseovet', 'digestomed', 'esomeprazol', 'pantoprazol',
  'losartan', 'corpres', 'cardiovasc', 'enalapril', 'lotrial', 'amlodipina',
  'metformina', 'glucophage', 'glafornil', 'dimefor', 'glibenclamida',
  'atorvastatina', 'lipitor', 'atorvasterol', 'simvastatina',
  'viadil', 'buscapina', 'sertal', 'plidex',
  'diclofenaco', 'voltaren', 'dioxaflex', 'clofenac', 'dioxadol',
  'ketorolaco', 'dolgenal', 'enantyum', 'dexketoprofeno',
  'refrianex', 'tapsin', 'antigripal', 'nastizol', 'gripectil', 'degrip',
  'salbutamol', 'ventolin', 'aerolin', 'budesonida', 'berodual',
  'dexametasona', 'prednisona', 'cortiprex', 'betametasona',
  'loratadina', 'cetirizina', 'degraler', 'alerfast', 'desloratadina',
  'ambroxol', 'mucosolvan', 'abrilar', 'bisolvon',
  'mentisan', 'vaporub',
  'sales de rehidratacion', 'oralit', 'suero',
  'vitamina c', 'cebion', 'supradyn', 'pan vimin', 'neuro vimin', 'bagovit',
  'clotrimazol', 'miconazol', 'fluconazol', 'ketoconazol',
  'complejo b', 'b12', 'acido folico', 'sulfato ferroso',
  'domperidona', 'metoclopramida', 'plasil', 'ondansetron',
  'ranitidina', 'famotidina', 'hidroxido de aluminio', 'milanta',
  'valpakine', 'eutirox', 'levotiroxina', 'carbamazepina'
];

async function collectImages() {
  const results = {};
  console.log(`Buscando ${searchTerms.length} medicamentos comerciales en Farmacorp...`);

  for (const term of searchTerms) {
    try {
      const url = `https://farmacorp.com/search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product`;
      const res = await fetch(url);
      if (res.status === 200) {
        const data = await res.json();
        const prods = data.resources?.results?.products || [];
        if (prods.length > 0) {
          const items = prods.filter(p => p.image).map(p => ({
            title: p.title,
            url: p.url,
            image: p.image.replace(/_small|_medium|_large|_compact/g, '') // get full size
          }));
          results[term] = items;
          console.log(`[OK] "${term}": ${items.length} imágenes encontradas (Ej: ${items[0]?.title})`);
        } else {
          console.log(`[--] "${term}": 0 resultados`);
        }
      }
      // Small pause to be gentle
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Error en "${term}":`, e.message);
    }
  }

  const termsFound = Object.keys(results).length;
  console.log(`\nResumen: ${termsFound} de ${searchTerms.length} términos tienen imágenes reales.`);
  fs.writeFileSync('scripts/farmacorp_scraped.json', JSON.stringify(results, null, 2), 'utf8');
}

collectImages();

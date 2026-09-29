const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'assets', 'medications');

async function downloadChavezImages() {
  try {
    const res = await fetch('https://api.github.com/repos/gsuarezgch-lang/imagenes-productos_03/contents', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.status === 200) {
      const files = await res.json();
      console.log(`Buscando medicamentos en ${files.length} archivos de Chavez...`);
      
      const medKeywords = [
        'paracetamol', 'kitadol', 'ibuprofeno', 'aspirina', 'amoxi', 'azitro', 'omepra',
        'losartan', 'enala', 'metform', 'sertal', 'viadil', 'mentisan', 'vitam', 'calcio',
        'zinc', 'complejo', 'alivio', 'grip', 'tapsin', 'refria', 'dexa', 'predni', 'salbut',
        'tos', 'jarabe', 'gel', 'crema', 'gotas', 'pediatrico', 'digest', 'b12', 'suero'
      ];

      const matched = files.filter(f => {
        const lower = f.name.toLowerCase();
        return medKeywords.some(k => lower.includes(k));
      });

      console.log(`Encontrados ${matched.length} medicamentos en Farmacias Chavez:`);
      for (const m of matched) {
        console.log(` - Chavez: ${m.name}`);
        const dest = path.join(targetDir, `chavez_${m.name.replace(/[^a-zA-Z0-9_\.]/g, '_')}`);
        const dlRes = await fetch(m.download_url);
        if (dlRes.status === 200) {
          const buf = await dlRes.arrayBuffer();
          fs.writeFileSync(dest, Buffer.from(buf));
          console.log(`   [OK] Guardado como ${path.basename(dest)} (${Math.round(buf.byteLength/1024)} KB)`);
        }
      }

      // If matched is small, download first 15 health/wellness products from Chavez
      if (matched.length < 5) {
        const others = files.filter(f => f.name.endsWith('.png') || f.name.endsWith('.jpg') || f.name.endsWith('.jpeg')).slice(0, 15);
        for (const o of others) {
          const dest = path.join(targetDir, `chavez_${o.name.replace(/[^a-zA-Z0-9_\.]/g, '_')}`);
          const dlRes = await fetch(o.download_url);
          if (dlRes.status === 200) {
            const buf = await dlRes.arrayBuffer();
            fs.writeFileSync(dest, Buffer.from(buf));
            console.log(`   [OK Extra Chavez] Guardado ${path.basename(dest)}`);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error Chavez:', e.message);
  }
}

downloadChavezImages();

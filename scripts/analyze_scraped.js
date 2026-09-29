const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/farmacorp_scraped.json', 'utf8'));
let total = 0;
const uniqueImages = new Set();
const productList = [];

for (const [term, items] of Object.entries(data)) {
  total += items.length;
  items.forEach(item => {
    if (item.image) {
      uniqueImages.add(item.image);
      productList.push({ term, title: item.title, image: item.image });
    }
  });
}

console.log(`Términos buscados: ${Object.keys(data).length}`);
console.log(`Total productos encontrados: ${total}`);
console.log(`Imágenes únicas encontradas: ${uniqueImages.size}`);
console.log('\nPrimeros 20 productos comerciales con imagen:');
productList.slice(0, 20).forEach(p => console.log(`  [${p.term}] ${p.title} -> ${p.image}`));

async function exploreFarmacorp() {
  // Test collection products
  const collections = ['medicamentos', 'salud', 'farmacia', 'medicinas', 'antigripales', 'dolor-y-fiebre'];
  for (const c of collections) {
    const res = await fetch(`https://farmacorp.com/collections/${c}/products.json?limit=50`);
    if (res.status === 200) {
      const data = await res.json();
      console.log(`Collection ${c}: ${data.products.length} products`);
      if (data.products.length > 0) {
        data.products.slice(0, 3).forEach(p => console.log('  -', p.title, p.images?.[0]?.src));
      }
    } else {
      console.log(`Collection ${c}: status ${res.status}`);
    }
  }

  // Also test suggest for various Bolivian medicines
  const testTerms = [
    'paracetamol', 'kitadol', 'ibuprofeno', 'buprex', 'aspirina', 'amoval', 'amoxicilina',
    'azitromicina', '3 micina', 'omeprazol', 'losartan', 'metformina', 'viadil', 'refrianex',
    'tapsin', 'antigripal', 'bago', 'inti', 'ifa', 'cofar', 'terbol', 'salbutamol',
    'ciprofloxacina', 'diclofenaco', 'voltaren', 'apronax', 'enantyum'
  ];

  console.log('\nTesting search suggest on Farmacorp for key Bolivian medicines:');
  for (const t of testTerms.slice(0, 10)) {
    const res = await fetch(`https://farmacorp.com/search/suggest.json?q=${encodeURIComponent(t)}&resources[type]=product`);
    if (res.status === 200) {
      const json = await res.json();
      const prods = json.resources?.results?.products || [];
      console.log(`Term "${t}": ${prods.length} products found`);
      prods.slice(0, 2).forEach(p => console.log(`   * ${p.title} -> ${p.image}`));
    }
  }
}

exploreFarmacorp();

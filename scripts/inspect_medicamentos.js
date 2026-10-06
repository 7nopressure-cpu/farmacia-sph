const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'medicamentos_bo.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet names:', workbook.SheetNames);
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

console.log('\n--- Inspecting "Base Completa" ---');
const baseCompletaSheet = workbook.Sheets['Base Completa'];
if (baseCompletaSheet) {
  const baseData = XLSX.utils.sheet_to_json(baseCompletaSheet, { header: 1 });
  console.log('Total rows in Base Completa:', baseData.length);
  console.log('Header Row (Row 0):');
  baseData[0].forEach((col, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    console.log(`Col ${colLetter} (index ${idx}): ${col}`);
  });
  console.log('\nSample Row 1:');
  console.log(baseData[1]);
  console.log('\nSample Row 2:');
  console.log(baseData[2]);
}

console.log('\n--- Inspecting "Sistema Nervioso" ---');
const sistNervSheet = workbook.Sheets['Sistema Nervioso'];
if (sistNervSheet) {
  const sistData = XLSX.utils.sheet_to_json(sistNervSheet, { header: 1 });
  console.log('Total rows in Sistema Nervioso:', sistData.length);
  console.log('Header Row (Row 0):');
  sistData[0].forEach((col, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    console.log(`Col ${colLetter} (index ${idx}): ${col}`);
  });
  console.log('\nSample Row 1:');
  console.log(sistData[1]);
}


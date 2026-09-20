<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FarmaAhorro Bolivia - Orientación y Comparador</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">

  <!-- Encabezado -->
  <header class="bg-teal-700 text-white shadow-md sticky top-0 z-50">
    <div class="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <i class="fa-solid fa-notes-medical text-2xl text-teal-300"></i>
        <div>
          <h1 class="font-bold text-lg leading-tight">FarmaAhorro Bolivia</h1>
          <p class="text-xs text-teal-200">Defensor del bolsillo del paciente</p>
        </div>
      </div>
      <span class="text-xs bg-teal-800 px-2.5 py-1 rounded-full border border-teal-600 font-mono">La Paz</span>
    </div>
  </header>

  <!-- Contenedor Principal -->
  <main class="max-w-xl mx-auto px-4 py-6 w-full flex-grow">
    
    <!-- Tarjeta de Acción: Escanear Receta -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 text-center">
      <div class="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
        <i class="fa-solid fa-camera"></i>
      </div>
      <h2 class="text-lg font-bold text-slate-900">Sube o fotografía tu receta</h2>
      <p class="text-xs text-slate-500 mt-1 mb-4">
        Nuestra IA detecta el principio activo y te muestra los genéricos aprobados por AGEMED con hasta 80% de ahorro.
      </p>

      <label class="cursor-pointer inline-flex items-center justify-center space-x-2 w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow transition">
        <i class="fa-solid fa-upload"></i>
        <span>Tomar Foto / Subir Receta</span>
        <input type="file" id="cameraInput" accept="image/*" class="hidden">
      </label>
    </div>

    <!-- Buscador manual alternativo -->
    <div class="relative mb-6">
      <input type="text" id="manualSearch" placeholder="O busca por medicamento (ej: Azitromicina)..." 
             class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
      <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400"></i>
    </div>

    <!-- Indicador de Carga -->
    <div id="loadingState" class="hidden text-center py-8">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-teal-600 mb-3"></i>
      <p class="text-sm font-medium text-slate-700">Analizando receta con Inteligencia Artificial...</p>
      <p class="text-xs text-slate-400 mt-1">Consultando vademécum y registros de AGEMED</p>
    </div>

    <!-- Panel de Orientación Médica IA -->
    <div id="aiOrientationCard" class="hidden bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
      <div class="flex items-start space-x-3">
        <i class="fa-solid fa-user-doctor text-emerald-700 text-xl mt-0.5"></i>
        <div>
          <h3 class="text-sm font-bold text-emerald-900" id="aiDetectedTitle">Fármaco Detectado</h3>
          <p class="text-xs text-emerald-800 mt-1 leading-relaxed" id="aiOrientationText"></p>
        </div>
      </div>
    </div>

    <!-- Resultados Comparativos de Precios -->
    <div id="resultsContainer" class="hidden">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-slate-900 text-sm">Opciones Disponibles en Bolivia</h3>
        <span class="text-xs text-slate-500">Ordenado de menor a mayor precio</span>
      </div>

      <div id="cardsList" class="space-y-3"></div>
    </div>

  </main>

  <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
    Cumplimiento Ley 1737 • Verificación de Registro Sanitario AGEMED
  </footer>

  <script>
    const cameraInput = document.getElementById('cameraInput');
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');
    const cardsList = document.getElementById('cardsList');
    const aiOrientationCard = document.getElementById('aiOrientationCard');
    const aiDetectedTitle = document.getElementById('aiDetectedTitle');
    const aiOrientationText = document.getElementById('aiOrientationText');
    const manualSearch = document.getElementById('manualSearch');

    // Manejar subida de foto
    cameraInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        await processRecipe({ imageBase64: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    });

    // Manejar búsqueda manual
    manualSearch.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && manualSearch.value.trim()) {
        await processRecipe({ searchDci: manualSearch.value.trim() });
      }
    });

    async function processRecipe(payload) {
      loadingState.classList.remove('hidden');
      resultsContainer.classList.add('hidden');
      aiOrientationCard.classList.add('hidden');

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        loadingState.classList.add('hidden');

        // Mostrar orientación IA si existe
        if (data.prescriptionDetails && data.prescriptionDetails.dci) {
          aiDetectedTitle.textContent = `Principio Activo: ${data.prescriptionDetails.dci} (${data.prescriptionDetails.concentracion || ''})`;
          aiOrientationText.textContent = data.prescriptionDetails.orientacion || 'Medicamento autorizado en territorio nacional.';
          aiOrientationCard.classList.remove('hidden');
        }

        // Renderizar medicamentos
        renderMedicines(data.medicamentos || []);

      } catch (err) {
        loadingState.classList.add('hidden');
        alert('Hubo un error al procesar la solicitud.');
      }
    }

    function renderMedicines(list) {
      cardsList.innerHTML = '';
      if (list.length === 0) {
        cardsList.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No se encontraron medicamentos registrados para esta búsqueda.</p>';
        resultsContainer.classList.remove('hidden');
        return;
      }

      const lowestPrice = list[0].precio_referencial_bs;
      const highestPrice = list[list.length - 1].precio_referencial_bs;

      list.forEach((med, idx) => {
        const isBestPrice = idx === 0 && list.length > 1;
        const savings = (highestPrice - med.precio_referencial_bs).toFixed(2);

        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between ${isBestPrice ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`;

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              ${isBestPrice ? '<span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full mb-1 inline-block">MÁXIMO AHORRO</span>' : ''}
              <h4 class="font-bold text-slate-900 text-sm leading-tight">${med.nombre_comercial}</h4>
              <p class="text-xs text-slate-500">${med.laboratorio}</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Reg. Sanitario: ${med.registro_sanitario || 'En trámite'}</p>
            </div>
            <div class="text-right">
              <span class="text-lg font-black text-slate-900">${med.precio_referencial_bs} Bs</span>
              <p class="text-[10px] text-slate-400">${med.forma_farmaceutica}</p>
            </div>
          </div>
          ${isBestPrice && savings > 0 ? `
            <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
              <span><i class="fa-solid fa-piggy-bank mr-1"></i> Ahorras ${savings} Bs frente a la opción más cara</span>
            </div>
          ` : ''}
          <div class="mt-3">
            <a href="https://wa.me/?text=Hola,%20deseo%20cotizar%20${encodeURIComponent(med.nombre_comercial)}" target="_blank"
               class="w-full text-center block py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold">
              Pedir este medicamento
            </a>
          </div>
        `;
        cardsList.appendChild(card);
      });

      resultsContainer.classList.remove('hidden');
    }
  </script>
</body>
</html>

# Vademécum Nacional de Bolivia & Consultor Médico de Orientación con IA
### SnowPoint Healthcare (FAR SPH) • Plataforma de Salud Digital

Plataforma web de última generación inspirada en los estándares de comercio farmacéutico y diseño clínico de **Farmacorp**, adaptada para el **Estado Plurinacional de Bolivia**.

Despliegue oficial en producción: **[https://farmacia-sph.vercel.app](https://farmacia-sph.vercel.app)**

---

## 🌟 Características Principales

### 1. Consultor Médico de Triaje Clínico con IA (Hero Section)
- Asistente clínico interactivo conectado a la API de **Google Gemini** (`GEMINI_API_KEY`) con motor heurístico de contingencia.
- **Clasificación clínica en 3 niveles reglamentarios:**
  - 🟢 **NIVEL VERDE (Leve / Autolimitado):** Recomienda medidas de autocuidado no farmacológicas y sugiere **exclusivamente fármacos de VENTA LIBRE (OTC)** registrados en Bolivia (Paracetamol, Sales de Rehidratación Oral, Antiácidos), con posología preventiva, duración máxima y advertencia contra la automedicación.
  - 🟡 **NIVEL AMARILLO (Moderado):** Orienta sobre posibles etiologías y recomienda la especialidad médica adecuada para consulta presencial, sugiriendo centros de derivación en La Paz y El Alto.
  - 🔴 **NIVEL ROJO (Signos de Alarma / Emergencia):** Ante dolor torácico, disnea súbita o déficit neurológico, emite alerta destacada de acudir inmediatamente a Urgencias de hospitales en La Paz/El Alto y enlace directo para llamar al **168 (Ambulancias SEDES)**.
- Cumplimiento explícito del marco legal según la **Ley N° 1737 del Medicamento de Bolivia**.

### 2. Vademécum Nacional de Bolivia
- Integración directa con base de datos **Supabase** (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`) con fallback local optimizado.
- Base de datos con más de **5,400 medicamentos registrados ante AGEMED**.
- Buscador predictivo en tiempo real con filtrado multicriterio:
  - Principio activo (DCI) y concentración
  - Nombre comercial y marca
  - Laboratorio fabricante (Laboratorios INTI, Laboratorios Bagó Bolivia, Laboratorios IFA, Laboratorios COFAR, Terbol, Delta, etc.)
  - Condición de dispensación: **Venta Libre (OTC)** vs. **Bajo Receta Médica**.
- **Comparativa Visual de Ahorro Bioequivalente:** Modal interactivo que compara medicamentos de marca frente a alternativas genéricas nacionales autorizadas, calculando el ahorro exacto en Bolivianos (Bs) y porcentaje (hasta 70% de ahorro).
- Enlace directo a WhatsApp para pedidos y consultas farmacéuticas pre-llenadas.

### 3. Lector de Recetas Médicas con IA (Subir Receta)
- Análisis de recetas manuscritas e imágenes de fármacos utilizando **Gemini Vision**.
- Extracción automática de DCI, concentración y presentación farmacéutica.
- Búsqueda instantánea de bioequivalentes en el catálogo con opciones de máximo ahorro.

### 4. Guía de Derivación y Hospitales: La Paz & El Alto
- Directorio conectado a la tabla `centros_y_especialidades` en Supabase.
- Información de hospitales de 3er Nivel (Hospital de Clínicas, Hospital Obrero N° 1 CNS, Hospital del Norte El Alto), hospitales municipales de 2do Nivel (Los Pinos, La Portada, Hospital del Sur) e institutos especializados (Instituto del Tórax, Hospital del Niño, Gastroenterológico).
- Teléfonos de urgencia 24/7 directos (`tel:`), cartera de especialidades y geolocalización.

---

## 🎨 Guía de Estilo Visual y UI/UX (Inspirado en Farmacorp)

- **Paleta Cromática:**
  - **Azul Marino Médico Corporativo:** `#0B2B64` y `#003876` (identidad SnowPoint Healthcare).
  - **Acento Cian / Turquesa:** `#00A3E0` (foco de búsqueda, acciones principales y estados activos).
  - **Fondo Clínico:** Blanco puro (`#FFFFFF`) y gris clínico suave (`#F4F6F8`).
  - **Verde Esmeralda de Ahorro:** `#10B981` (fármacos genéricos de ahorro y botón WhatsApp).
  - **Rojo Clínico de Urgencias:** `#EF4444` y `#DC2626` (signos de alarma y teléfonos de emergencia).
- **Componentes:**
  - Tarjetas blancas con bordes sutiles, microinteracciones y elevación en hover (`shadow-card-hover`).
  - Barra superior informativa con geolocalización La Paz/El Alto, horario 24/7 y acceso a emergencias SEDES 168.
  - Barra de categorías estilo chips desplazables.
  - Hero Section con el emblema oficial de SnowPoint Healthcare (`hero-banner.jpg`).

---

## 🗄️ Esquema de Base de Datos y Scripts de Sincronización

### Tabla: `medicamentos`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | BIGINT PK | Identificador único del fármaco |
| `nombre_comercial` | TEXT | Nombre comercial o marca de fábrica |
| `dci_principio_activo` | TEXT | Denominación Común Internacional (DCI) |
| `concentracion` | TEXT | Concentración o dosis (mg, g, UI, %) |
| `forma_farmaceutica` | TEXT | Comprimidos, jarabe, inyectable, etc. |
| `laboratorio` | TEXT | Laboratorio fabricante o titular |
| `registro_sanitario` | TEXT | Código AGEMED (NN-... / II-...) |
| `precio_referencial_bs` | NUMERIC | Precio referencial de venta en Bolivianos (Bs) |
| `condicion_venta` | TEXT | 'Venta Libre' o 'Bajo Receta Médica' |
| `es_venta_libre` | BOOLEAN | `true` si es OTC, `false` si requiere receta |
| `grupo_terapeutico` | TEXT | Clasificación terapéutica / acción farmacológica |
| `indicaciones_principales` | TEXT | Indicaciones terapéuticas y presentación |

### Tabla: `centros_y_especialidades`
Contiene la red de centros hospitalarios de referencia en La Paz y El Alto con niveles de atención (2do, 3er y 4to nivel), teléfonos de urgencias 24h y especialidades médicas.

### Scripts de Importación / Seed Disponibles:
1. **Script SQL para Supabase SQL Editor:**
   - Archivo: `scripts/seed_supabase.sql`
   - Crea las tablas con Row Level Security (RLS), índices Full-Text Search en español y realiza el insert de centros de salud y medicamentos.
2. **Script Node.js para Sincronización Automática:**
   ```bash
   npm run seed:supabase
   ```
   Lee directamente el archivo `medicamentos_bo.xlsx` y realiza inserts en lotes con barra de progreso.
3. **Generador de Datasets y Fallbacks Locales:**
   ```bash
   npm run seed:data
   ```

---

## 🚀 Despliegue e Instalación Local

### Requisitos Previos:
- Node.js 18+ (recomendado Node 20+)
- npm 9+

### Instalación:
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local

# 3. Compilar para producción
npm run build

# 4. Iniciar servidor local
npm run start
```

### Variables de Entorno (`.env.local` / Vercel Settings):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
GEMINI_API_KEY=AIzaSy...
```

---

## ⚖️ Marco Legal y Normativa Boliviana
- **Ley N° 1737 del Medicamento:** Regula la política nacional de medicamentos, garantizando el acceso a medicamentos genéricos de calidad comprobada y la dispensación responsable.
- **AGEMED (Agencia Estatal de Medicamentos y Tecnologías en Salud):** Autoridad sanitaria nacional reguladora.
- **Líneas de Emergencia:**
  - Ambulancias SEDES: **168**
  - Radio Patrulla Policía: **110**
  - Bomberos: **119**

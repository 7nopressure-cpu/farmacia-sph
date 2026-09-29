-- ============================================================
-- SCRIPT DE CREACIÓN Y SEEDING DE BASE DE DATOS SUPABASE
-- PROYECTO: Vademécum Nacional de Bolivia & Consultor Médico SPH
-- ============================================================

-- 1. Tabla de Medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
    id BIGINT PRIMARY KEY,
    nombre_comercial TEXT NOT NULL,
    dci_principio_activo TEXT NOT NULL,
    concentracion TEXT,
    forma_farmaceutica TEXT,
    laboratorio TEXT,
    registro_sanitario TEXT,
    precio_referencial_bs NUMERIC(10,2) DEFAULT 0.00,
    condicion_venta TEXT DEFAULT 'Bajo Receta Médica',
    es_venta_libre BOOLEAN DEFAULT FALSE,
    grupo_terapeutico TEXT,
    indicaciones_principales TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda predictiva ultrarrápida
CREATE INDEX IF NOT EXISTS idx_medicamentos_dci ON medicamentos USING gin (to_tsvector('spanish', dci_principio_activo));
CREATE INDEX IF NOT EXISTS idx_medicamentos_nombre ON medicamentos USING gin (to_tsvector('spanish', nombre_comercial));
CREATE INDEX IF NOT EXISTS idx_medicamentos_lab ON medicamentos(laboratorio);
CREATE INDEX IF NOT EXISTS idx_medicamentos_venta_libre ON medicamentos(es_venta_libre);
CREATE INDEX IF NOT EXISTS idx_medicamentos_precio ON medicamentos(precio_referencial_bs);

-- Habilitar RLS y lectura pública anónima
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica de medicamentos" ON medicamentos;
CREATE POLICY "Permitir lectura publica de medicamentos" ON medicamentos FOR SELECT USING (true);

-- 2. Tabla de Centros de Salud y Especialidades (La Paz & El Alto)
CREATE TABLE IF NOT EXISTS centros_y_especialidades (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    zona TEXT NOT NULL,
    direccion TEXT NOT NULL,
    telefono_urgencias TEXT NOT NULL,
    telefono_consultas TEXT,
    nivel_atencion TEXT NOT NULL,
    especialidades TEXT[] NOT NULL,
    horario_atencion TEXT,
    tipo_institucion TEXT,
    latitud NUMERIC(10,6),
    longitud NUMERIC(10,6),
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE centros_y_especialidades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica de centros" ON centros_y_especialidades;
CREATE POLICY "Permitir lectura publica de centros" ON centros_y_especialidades FOR SELECT USING (true);

-- Inserción de Centros de Salud y Hospitales
INSERT INTO centros_y_especialidades (id, nombre, ciudad, zona, direccion, telefono_urgencias, telefono_consultas, nivel_atencion, especialidades, horario_atencion, tipo_institucion, latitud, longitud, destacado)
VALUES
('hp-01', 'Hospital de Clínicas Universitario', 'La Paz', 'Miraflores (Complejo Hospitalario)', 'Av. Saavedra esq. Claudio Sanjinés, Plaza Triangular', '(+591 2) 2229200', '(+591 2) 2229202', '3er Nivel (Referencia Departamental)', ARRAY['Emergentología 24h', 'Cirugía General', 'Medicina Interna', 'Cardiología', 'Neurología', 'Traumatología', 'Urología', 'Gastroenterología', 'Nefrología'], 'Urgencias: 24/7 | Consultas Externas: Lun a Vie 07:30 - 16:00', 'Público / Sistema Único de Salud (SUS)', -16.4988, -68.1215, true),
('hp-02', 'Hospital del Norte - El Alto', 'El Alto', 'Río Seco (Distrito 4)', 'Av. Juan Pablo II, cruce Río Seco', '(+591 2) 2864070', '(+591 2) 2864075', '3er Nivel (Centro de Referencia El Alto)', ARRAY['Urgencias y Trauma Shock', 'Terapia Intensiva (UTI)', 'Pediatría de Alta Complejidad', 'Ginecología y Obstetricia', 'Cirugía Laparoscópica', 'Infectología', 'Cardiología'], 'Urgencias: 24/7 | Consultas Externas: Lun a Sáb 08:00 - 17:00', 'Público / Sistema Único de Salud (SUS)', -16.4862, -68.2045, true),
('hp-03', 'Hospital Obrero N° 1 - CNS', 'La Paz', 'Miraflores', 'Av. Brasil esq. Díaz Romero s/n', '(+591 2) 2224424', '(+591 2) 2227180', '3er Nivel (Seguro Social)', ARRAY['Urgencias Médicas y Quirúrgicas', 'Cardiología Intervencionista', 'Neurología y ACV', 'Oncología Clínica', 'Cirugía Cardiovascular', 'Endocrinología', 'Terapia Intensiva'], 'Emergencias: 24 Horas continuas', 'Seguro Social a Corto Plazo (Caja Nacional de Salud)', -16.4975, -68.1205, true),
('hp-04', 'Hospital Municipal Los Pinos', 'La Paz', 'Zona Sur (Los Pinos)', 'Calle 25 de Calacoto y Av. Muñoz Reyes', '(+591 2) 2793131', '(+591 2) 2791444', '2do Nivel (Hospital Municipal)', ARRAY['Emergencias 24h', 'Medicina General y Familiar', 'Pediatría', 'Ginecología', 'Cirugía Básica', 'Odontología', 'Laboratorio Clínico y Rayos X'], 'Urgencias 24h | Consultas: 08:00 - 20:00', 'Público / GAMLP (Atención SUS)', -16.5412, -68.0784, false),
('hp-05', 'Hospital Municipal La Portada', 'La Paz', 'Max Paredes / Portada', 'Av. Heroes del Pacífico y Calle La Florida', '(+591 2) 2450505', '(+591 2) 2450100', '2do Nivel (Hospital Centinela)', ARRAY['Emergencias Respiratorias y Generales', 'Medicina Interna', 'Pediatría', 'Gineco-Obstetricia', 'Traumatología de Urgencia', 'UTI Intermedia'], 'Emergencias 24/7', 'Público / GAMLP (Atención SUS)', -16.4889, -68.1567, false),
('hp-06', 'Instituto Nacional del Tórax', 'La Paz', 'Miraflores', 'Complejo Hospitalario de Miraflores, Av. Saavedra', '(+591 2) 2224010', '(+591 2) 2224012', 'Instituto de 4to Nivel (Especializado)', ARRAY['Neumología Pediátrica y Adultos', 'Cardiología y Cateterismo', 'Cirugía de Tórax', 'Insuficiencia Cardíaca', 'Unidad Coronaria', 'Broncoscopía'], 'Emergencias Cardiorespiratorias 24h | Citas: 08:00 - 15:00', 'Público / SUS (Especializado)', -16.4995, -68.121, true),
('hp-07', 'Hospital del Niño Dr. Ovidio Aliaga Uría', 'La Paz', 'Miraflores', 'Calle Claudio Sanjinés s/n, Plaza Triangular', '(+591 2) 2225330', '(+591 2) 2225331', '3er Nivel (Referencia Pediátrica Nacional)', ARRAY['Urgencias Pediátricas 24h', 'Cirugía Pediátrica', 'Terapia Intensiva Pediátrica', 'Cardiología Infantil', 'Neurología Pediátrica', 'Neonatología'], 'Emergencias Pediátricas 24/7', 'Público / SUS', -16.4982, -68.1221, true),
('hp-08', 'Hospital del Sur - El Alto', 'El Alto', 'Cosmos 79 (Distrito 3)', 'Av. Ladislao Cabrera, Km 7 carretera a Viacha', '(+591 2) 2839090', '(+591 2) 2839092', '3er Nivel (Especialidades El Alto)', ARRAY['Emergentología 24h', 'Cirugía General', 'Medicina Interna', 'Ginecología', 'Traumatología', 'Hemodiálisis', 'Cuidados Críticos'], 'Urgencias 24h continuas', 'Público / SUS', -16.5342, -68.2178, false),
('hp-09', 'Instituto Gastroenterológico Boliviano Japonés', 'La Paz', 'Miraflores', 'Av. Saavedra No. 2301, Complejo de Miraflores', '(+591 2) 2225881', '(+591 2) 2225882', 'Instituto de 4to Nivel (Digestivo)', ARRAY['Urgencias Digestivas y Hemorragias', 'Gastroenterología Clínica', 'Endoscopía Digestiva', 'Hepatología', 'Cirugía Gastrointestinal y Biliar'], 'Urgencias: 24h | Consultas: 08:00 - 16:00', 'Público / SUS Especializado', -16.499, -68.1208, false),
('hp-10', 'Hospital Arco Iris', 'La Paz', 'Villa Fátima', 'Plaza Maestro No. 1805, Villa Fátima', '(+591 2) 2216021', '(+591 2) 2216020', '3er Nivel (Clínica Hospitalaria de Convenio)', ARRAY['Emergencias Generales y Pediátricas 24h', 'Traumatología y Ortopedia', 'Cirugía Laparoscópica', 'Cardiología', 'Ambulancia Móvil de Rescate', 'Unidad de Terapia Intensiva'], 'Emergencias y Admisión 24 Horas', 'Privado de Obra Social / Convenio', -16.4801, -68.1142, true)
ON CONFLICT (id) DO UPDATE SET
nombre = EXCLUDED.nombre, especialidades = EXCLUDED.especialidades, telefono_urgencias = EXCLUDED.telefono_urgencias;

-- Inserción inicial de medicamentos (Muestra de referencia):
INSERT INTO medicamentos (id, nombre_comercial, dci_principio_activo, concentracion, forma_farmaceutica, laboratorio, registro_sanitario, precio_referencial_bs, condicion_venta, es_venta_libre, grupo_terapeutico, indicaciones_principales)
VALUES
(36883, '3 Micina', 'Azitromicina', '500 mg', 'Tabletas recubiertas', 'Lamosan', 'II-66883/2023', 34.5, 'Bajo Receta Médica', false, 'Antibiótico macrólido', 'Antibiótico macrólido. Presentación: Caja con 5 tabletas.'),
(40792, '36 Horas', 'Tadalafil', '10 mg', 'Comprimidos recubiertos', 'Catedral Pharmetica', 'II-70792/2022', 34.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: Caja con 20 comprimidos recubiertos.'),
(39325, 'A Mina', 'Retinol (vitamina A)', '10000 UI', 'Cápsulas de gelatina blanda', 'San Fernando', 'II-69325/2020', 7.5, 'Venta Libre', true, 'Tratamiento de la deficiencia de vitamina A', 'Tratamiento de la deficiencia de vitamina A. Presentación: Caja por 30 cápsulas de gelatina blanda contenidas en blíster AL/PVC con 10 cápsulas cada blíster.'),
(41473, 'A Vito', 'Retinol (vitamina A)', '200000 UI', 'Cápsulas de gelatina blanda', 'Asmoh Laboratories', 'II-71473/2023', 7.5, 'Venta Libre', true, 'Vitamina A', 'Vitamina A. Presentación: Caja con 100 cápsulas de gelatina blanda.'),
(36135, 'Aas', 'Ácido acetilsalicílico', '81 mg', 'Comprimidos', 'Quimfa Bolivia', 'II-66135/2020', 26, 'Bajo Receta Médica', false, 'Analgésico, antipirético, antiinflamatorio y antiagregante plaquetario', 'Analgésico, antipirético, antiinflamatorio y antiagregante plaquetario. Presentación: AAS® 81: Caja por 30 comprimidos.
AAS® 125: Caja por 30 comprimidos.'),
(41624, 'Abevmy 100', 'Bevacizumab', '4 ml', 'Solución inyectable', 'Biocon', 'II-71624/2024', 25.5, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: Caja con frasco vial por 4ml.'),
(42046, 'Abintra', '-', '27 g', 'Polvo', 'Megalabs', 'II-72046/2021', 7.5, 'Venta Libre', true, 'Alimentación enteral', 'Alimentación enteral. Presentación: Sobre con 27 g sabor naranja.'),
(38548, 'Abiratral', 'Abiraterona', '250 mg', 'Comprimidos', 'Iclos', 'II-68548/2023', 24.5, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: Caja por 120 comprimidos.'),
(36179, 'Abraxane', 'Paclitaxel', '100 mg', 'Suspensión inyectable', 'Tecnofarma', 'II-66179/2024', 32.5, 'Bajo Receta Médica', false, 'Citostático', 'Citostático. Presentación: 1 ampolla.'),
(39792, 'Abrilar Mentolado', 'Hiedra (Hedera helix)', '100 ml', 'Jarabe', 'Megalabs', 'II-69792/2022', 33.5, 'Bajo Receta Médica', false, 'Mucolítico, expectorante y antitusivo', 'Mucolítico, expectorante y antitusivo. Presentación: Caja con frasco por 100 ml.'),
(41285, 'Abxeda', 'Bevacizumab', '4 ml', 'Concentrado para solución para perfusión', 'Abbott', 'II-71285/2020', 25.5, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: ABXEDA 100: Caja con vial por 4 ml.
ABXEDA 400: Caja con vial por 16 ml.'),
(37527, 'Accesorio para bolsa de colostomia 7299iz', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67527/2022', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 1 unidad.'),
(37528, 'Accesorio para bolsa de colostomia 7300iz', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67528/2023', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 1 unidad.'),
(37538, 'Accesorio para bolsa de colostomia 7760Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67538/2023', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 50 unidades.'),
(37529, 'Accesorio para bolsa de colostomia 7805Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67529/2024', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 10 unidades.'),
(37530, 'Accesorio para bolsa de colostomia 7806Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67530/2020', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 10 unidades.'),
(37533, 'Accesorio para bolsa de colostomia 78500Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67533/2023', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 1 unidad.'),
(37534, 'Accesorio para bolsa de colostomia 78501', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67534/2024', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 50 unidades.'),
(37531, 'Accesorio para bolsa de colostomia 7906iz', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67531/2021', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 1 unidad.'),
(37536, 'Accesorio para bolsa de colostomia 7910iz', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67536/2021', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 1 unidad.'),
(37537, 'Accesorio para bolsa de colostomia 7917Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67537/2022', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 50 unidades.'),
(37535, 'Accesorio para bolsa de colostomia 79300Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67535/2020', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 1 unidad.'),
(37532, 'Accesorio para bolsa de colostomia 8770Q', '-', 'Estándar', 'Equipo médico y hospitalario', 'Hollister', 'II-67532/2022', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Caja por 20 unidades.'),
(37626, 'Accord', 'Losartán', '50 mg', 'Comprimidos', 'Indufar', 'II-67626/2021', 25.5, 'Bajo Receta Médica', false, 'Antihipertensivo', 'Antihipertensivo. Presentación: ACCORD 50: Caja por 30 comprimidos.
ACCORD 100: Caja por 30 comprimidos.'),
(39421, 'Accord H', 'Hidroclorotiazida; Losartán', 'Estándar', 'Comprimidos', 'Indufar', 'II-69421/2021', 28.5, 'Bajo Receta Médica', false, 'Tratamiento de la hipertensión arterial', 'Tratamiento de la hipertensión arterial. Presentación: Caja por 30 comprimidos.'),
(38263, 'Accu Chek Active', '-', 'Estándar', 'Glucómetro', 'Roche Diabetes Care', 'II-68263/2023', 21.5, 'Bajo Receta Médica', false, 'Equipos e insumos para la salud', 'Equipos e insumos para la salud. Presentación: Kit glucometro, 10 tiras, 10 lancetas, estuche de transporte, un lápiz digito punzor.'),
(38264, 'Accu Chek Active', '-', 'Estándar', 'Tiras reactivas', 'Roche Diabetes Care', 'II-68264/2024', 21.5, 'Bajo Receta Médica', false, 'Equipos e insumos para la salud', 'Equipos e insumos para la salud. Presentación: Caja con tubo por 10 tiras reactivas.'),
(38267, 'Accu Chek Safe T Pro Uno', '-', 'Estándar', 'Lancetas', 'Roche Diabetes Care', 'II-68267/2022', 21.5, 'Bajo Receta Médica', false, 'Equipos e insumos para la salud', 'Equipos e insumos para la salud. Presentación: Caja con 200 lancetas con bioseguridad.'),
(38268, 'Accu Chek Softclix', '-', 'Estándar', 'Lancetas', 'Roche Diabetes Care', 'II-68268/2023', 21.5, 'Bajo Receta Médica', false, 'Equipos e insumos para la salud', 'Equipos e insumos para la salud. Presentación: Caja con 200 lancetas descartables.'),
(40445, 'Acdx', 'Aluminio, hidróxido de; Magnesio, hidróxido de; Simeticona', '5 ml', 'Suspensión oral', 'FarmaShopping', 'II-70445/2020', 11.5, 'Venta Libre', true, 'Antiácido y antiflatulento', 'Antiácido y antiflatulento. Presentación: Caja con frasco por 100 ml.
Caja con frasco por 170 ml.'),
(35654, 'Aceite de Almendras', 'Almendras, aceite de', '30 ml', 'Aceite', 'Ifarbo', 'NN-65654/2024', 7.8, 'Bajo Receta Médica', false, 'Suavizante y protector de la piel', 'Suavizante y protector de la piel. Presentación: ACEITE DE ALMENDRAS frasco de 30 ml.'),
(35379, 'Aceite de Hígado de Bacalao', 'Calciferol (vitamina D); Hígado de bacalao, aceite de; Retinol (vitamina A)', '1 g', 'Emulsión', 'Minerva', 'II-65379/2024', 16.5, 'Venta Libre', true, 'Tratamiento de las deficiencias de vitamina A y D', 'Tratamiento de las deficiencias de vitamina A y D. Presentación: Caja con frasco por 150 ml.'),
(35770, 'Acelin', 'Clorfeniramina; Fenilefrina; Paracetamol (acetaminofén)', 'Estándar', 'Comprimidos', 'Indufar', 'II-65770/2020', 9.5, 'Venta Libre', true, 'Analgésico, antipirético y descongestivo', 'Analgésico, antipirético y descongestivo. Presentación: Caja por 20 comprimidos.'),
(35771, 'Acelin', 'Clorfeniramina; Fenilefrina; Paracetamol (acetaminofén)', '5 ml', 'Jarabe', 'Indufar', 'II-65771/2021', 9.5, 'Venta Libre', true, 'Analgésico, antipirético y descongestivo', 'Analgésico, antipirético y descongestivo. Presentación: Caja por un frasco de 20 ml.'),
(40337, 'Acelux', 'Iopamidol', '50 ml', 'Solución inyectable', 'AC Farma', 'II-70337/2022', 32.5, 'Bajo Receta Médica', false, 'Medio de contraste', 'Medio de contraste. Presentación: Caja con vial por 50 ml.'),
(40134, 'Acenak LC', 'Aceclofenaco', '100 mg', 'Tabletas', 'Antila Lifesciences', 'II-70134/2024', 24, 'Bajo Receta Médica', false, 'Analgésico, antiinflamatorio y antirreumático', 'Analgésico, antiinflamatorio y antirreumático. Presentación: Caja con 100 tabletas.'),
(35380, 'Acetamin', 'Paracetamol (acetaminofén)', '100 mg', 'Gotas', 'Minerva', 'II-65380/2020', 14.5, 'Venta Libre', true, 'Analgésico antipirético', 'Analgésico antipirético. Presentación: Caja con frasco gotero por 15 ml.'),
(35381, 'Acetamin', 'Paracetamol (acetaminofén)', '5 ml', 'Jarabe', 'Minerva', 'II-65381/2021', 14.5, 'Venta Libre', true, 'Analgésico antipirético', 'Analgésico antipirético. Presentación: Caja con frasco por 60 ml.
Caja con frasco por 100 ml.'),
(40995, 'Acetaminofeno', 'Paracetamol (acetaminofén)', '5 ml', 'Suspensión oral', 'Asmoh Laboratories', 'II-70995/2020', 14.5, 'Venta Libre', true, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja con frasco por 100 ml sabor frutilla.'),
(35484, 'Acetamol', 'Paracetamol (acetaminofén)', '5 ml', 'Jarabe', 'Ifarbo', 'NN-65484/2024', 6.5, 'Venta Libre', true, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja con frasco por 70 ml sabor frutilla.'),
(35482, 'Acetamol 1 g', 'Paracetamol (acetaminofén)', '1 g', 'Comprimidos', 'Ifarbo', 'NN-65482/2022', 6.5, 'Venta Libre', true, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: ACETAMOL 1 g, cajas de 150 comprimidos.'),
(35483, 'Acetamol Gotas', 'Paracetamol (acetaminofén)', '1 ml', 'Solución', 'Ifarbo', 'NN-65483/2023', 6.5, 'Venta Libre', true, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja con frasco gotero por 15 ml.'),
(35485, 'Acetamol Plus', 'Ibuprofeno; Paracetamol (acetaminofén)', 'Estándar', 'Comprimidos recubiertos', 'Ifarbo', 'NN-65485/2020', 5.4, 'Venta Libre', true, 'Analgésico, antipirético y antiinflamatorio', 'Analgésico, antipirético y antiinflamatorio. Presentación: Caja con 150 comprimidos recubiertos.'),
(35486, 'Acetamol Plus', 'Ibuprofeno; Paracetamol (acetaminofén)', '5 ml', 'Suspensión', 'Ifarbo', 'NN-65486/2021', 5.4, 'Venta Libre', true, 'Analgésico, antipirético y antiinflamatorio', 'Analgésico, antipirético y antiinflamatorio. Presentación: Caja con frasco por 100 ml sabor cereza.'),
(35487, 'Acetamol Plus Forte', 'Ibuprofeno; Paracetamol (acetaminofén)', '10 ml', 'Suspensión', 'Ifarbo', 'NN-65487/2022', 5.4, 'Venta Libre', true, 'Analgésico, antipirético y antiinflamatorio', 'Analgésico, antipirético y antiinflamatorio. Presentación: Caja con frasco por 100 ml sabor cereza.'),
(35678, 'Acetazolamida', 'Acetazolamida', '250 mg', 'Comprimidos', 'Farcos', 'II-65678/2023', 28.5, 'Bajo Receta Médica', false, 'Antiglaucomatoso y diurético', 'Antiglaucomatoso y diurético. Presentación: Caja por 30 comprimidos.'),
(39204, 'Acetazolgal', 'Acetazolamida', '250 mg', 'Comprimidos', 'Laqfagal', 'II-69204/2024', 28.5, 'Bajo Receta Médica', false, 'Tratamiento del glaucoma', 'Tratamiento del glaucoma. Presentación: Caja por 100 comprimidos.'),
(37823, 'Acetilcisteina', 'Acetilcisteína', '200 mg', 'Granulado', 'Cofar', 'NN-67823/2023', 19.8, 'Bajo Receta Médica', false, 'Mucolítico, fluidificante y antioxidante', 'Mucolítico, fluidificante y antioxidante. Presentación: Acetilcisteína 200 mg: Caja con 10 sobres por 3 g sabor naranja.
Acetilcisteína 600 mg: Caja con 10 sobres por 4 g sabor naranja.'),
(38394, 'Aciclor', 'Aciclovir', '800 mg', 'Comprimidos recubiertos', 'Alfa', 'II-68394/2024', 30.5, 'Bajo Receta Médica', false, 'Antiviral específico', 'Antiviral específico. Presentación: Caja con 30 comprimidos recubiertos.
Caja con 100 comprimidos recubiertos.'),
(36216, 'Aciclovir', 'Aciclovir', '400 mg', 'Tabletas', 'La Santé', 'II-66216/2021', 30.5, 'Bajo Receta Médica', false, 'Antiviral específico', 'Antiviral específico. Presentación: Aciclovir 400 mg: Caja con 10 tabletas.
Aciclovir 800 mg: Caja con 10 tabletas.'),
(36308, 'Aciclovir', 'Aciclovir', '400 mg', 'Comprimidos', 'Pacific Pharma Group', 'II-66308/2023', 30.5, 'Bajo Receta Médica', false, 'Antiviral específico', 'Antiviral específico. Presentación: Caja con 100 comprimidos.'),
(36476, 'Aciclovir', 'Aciclovir', '0.05 mg', 'Crema', 'Pacific Pharma Group', 'II-66476/2021', 30.5, 'Bajo Receta Médica', false, 'Antiviral tópico', 'Antiviral tópico. Presentación: Caja con tubo por 5 g.'),
(38416, 'Aciclovir', 'Aciclovir', '400 mg', 'Comprimidos recubiertos', 'Prodexa', 'II-68416/2021', 30.5, 'Bajo Receta Médica', false, 'Antiviral específico', 'Antiviral específico. Presentación: Caja con 20, 100 o 500 comprimidos recubiertos.'),
(38417, 'Aciclovir', 'Aciclovir', '5 g', 'Crema dérmica', 'Prodexa', 'II-68417/2022', 30.5, 'Bajo Receta Médica', false, 'Antiviral tópico', 'Antiviral tópico. Presentación: Caja con tubo por 5 g.'),
(39541, 'Aciclovir', 'Aciclovir', '100 g', 'Crema', 'La Santé', 'II-69541/2021', 30.5, 'Bajo Receta Médica', false, 'Antiviral tópico', 'Antiviral tópico. Presentación: Caja con tubo por 20 g.'),
(39742, 'Aciclovir', 'Aciclovir', '100 g', 'Crema', 'Opes Healthcare', 'II-69742/2022', 30.5, 'Bajo Receta Médica', false, 'Antiviral tópico', 'Antiviral tópico. Presentación: Caja con tubo por 5 g.'),
(40996, 'Aciclovir', 'Aciclovir', '5 ml', 'Suspensión', 'Asmoh Laboratories', 'II-70996/2021', 30.5, 'Bajo Receta Médica', false, 'Antiviral, antiherpético', 'Antiviral, antiherpético. Presentación: Caja con frasco por 100 ml sabor frambuesa.'),
(40997, 'Aciclovir', 'Aciclovir', '400 mg', 'Comprimidos', 'Asmoh Laboratories', 'II-70997/2022', 30.5, 'Bajo Receta Médica', false, 'Antiviral, antiherpético', 'Antiviral, antiherpético. Presentación: Aciclovir 400 mg: Caja con 100 comprimidos.
Aciclovir 600 mg: Caja con 100 comprimidos.
Aciclovir 800 mg: Caja con 100 comprimidos.'),
(41474, 'Aciclovir', 'Aciclovir', '50 mg', 'Crema', 'Asmoh Laboratories', 'II-71474/2024', 30.5, 'Bajo Receta Médica', false, 'Antiviral tópico', 'Antiviral tópico. Presentación: Caja con tubo por 10 g.'),
(38945, 'Aciclovir 400 mg', 'Aciclovir', '400 mg', 'Comprimidos', 'Sanat Pharma', 'II-68945/2020', 30.5, 'Bajo Receta Médica', false, 'Antiviral de uso sistémico', 'Antiviral de uso sistémico. Presentación: Caja por 100 comprimidos.'),
(38946, 'Aciclovir 800 mg', 'Aciclovir', '800 mg', 'Comprimidos', 'Sanat Pharma', 'II-68946/2021', 30.5, 'Bajo Receta Médica', false, 'Antiviral de uso sistémico', 'Antiviral de uso sistémico. Presentación: Caja por 100 comprimidos.'),
(35772, 'Acid', 'Ciprofloxacino', '500 mg', 'Comprimidos', 'Indufar', 'II-65772/2022', 23.5, 'Bajo Receta Médica', false, 'Antimicrobiano de amplio espectro', 'Antimicrobiano de amplio espectro. Presentación: Caja por 14 comprimidos.'),
(35773, 'Acid', 'Ciprofloxacino', '200 mg', 'Solución inyectable', 'Indufar', 'II-65773/2023', 23.5, 'Bajo Receta Médica', false, 'Antimicrobiano de amplio espectro', 'Antimicrobiano de amplio espectro. Presentación: Caja por un frasco infusor 100 ml.'),
(35067, 'Acido Acetilsalicílico 100', 'Ácido acetilsalicílico', '100 mg', 'Tabletas', 'Pharmandina', 'II-65067/2022', 26, 'Bajo Receta Médica', false, 'Analgésico, antipirético, antiinflamatorio y antiagregante plaquetario', 'Analgésico, antipirético, antiinflamatorio y antiagregante plaquetario. Presentación: Caja con 240 tabletas.'),
(35066, 'Acido Acetilsalicílico 500', 'Ácido acetilsalicílico', '500 mg', 'Tabletas', 'Pharmandina', 'II-65066/2021', 26, 'Bajo Receta Médica', false, 'Analgésico, antipirético, antiinflamatorio y antiagregante plaquetario', 'Analgésico, antipirético, antiinflamatorio y antiagregante plaquetario. Presentación: Caja de 100 tabletas.'),
(39207, 'Acido Ascórbico', 'Ácido ascórbico (vitamina C)', '2 ml', 'Solución inyectable', 'Cisen Pharmaceutical', 'II-69207/2022', 7.5, 'Venta Libre', true, 'Para la deficiencia de la vitamina C', 'Para la deficiencia de la vitamina C. Presentación: Ampolla por 2 ml.
Caja por 100 ampollas.'),
(40660, 'Ácido Ascórbico', 'Ácido ascórbico (vitamina C)', '5 ml', 'Solución inyectable', 'Opes Healthcare', 'II-70660/2020', 7.5, 'Venta Libre', true, 'Tratamiento de las deficiencias de la vitamina C', 'Tratamiento de las deficiencias de la vitamina C. Presentación: Caja con 100 ampollas por 5 ml.'),
(40998, 'Ácido Ascórbico', 'Ácido ascórbico (vitamina C)', '500 mg', 'Solución inyectable', 'Asmoh Laboratories', 'II-70998/2023', 7.5, 'Venta Libre', true, 'Tratamiento de las deficiencias de la vitamina C', 'Tratamiento de las deficiencias de la vitamina C. Presentación: Caja con 5 ampollas por 2 ml en bandeja de 10 unidades.'),
(35614, 'Acido Bórico', 'Ácido bórico', '10 g', 'Polvo', 'Ifarbo', 'NN-65614/2024', 5.8, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Paquete de 50 sobres por 10 g.'),
(41927, 'Acido Cítrico', 'Ácido cítrico', '100 ml', 'Solución', 'Droguería INTI', 'NN-71927/2022', 27.5, 'Bajo Receta Médica', false, 'Desinfectante', 'Desinfectante. Presentación: Bidón con 5 litros.'),
(37068, 'Acido Fólico', 'Ácido fólico (vitamina B9)', '5 mg', 'Comprimidos', 'IDA', 'II-67068/2023', 20.5, 'Venta Libre', true, 'Suplemento de ácido fólico', 'Suplemento de ácido fólico. Presentación: Caja por 100 blister con 10 comprimidos cada una.'),
(39715, 'Ácido Fólico', 'Ácido fólico (vitamina B9)', '1 mg', 'Tabletas', 'Ecar Cormesa', 'II-69715/2020', 20.5, 'Venta Libre', true, 'Tratamiento de las deficiencias de ácido fólico', 'Tratamiento de las deficiencias de ácido fólico. Presentación: Ácido Fólico 1 mg: Caja por 60 tabletas.
Ácido Fólico 5 mg: Caja por 20, 100 y 250 tabletas.'),
(40661, 'Ácido Fólico', 'Ácido fólico (vitamina B9)', '5 mg', 'Comprimidos recubiertos', 'Opes Healthcare', 'II-70661/2021', 20.5, 'Venta Libre', true, 'Tratamiento de las deficiencias de ácido fólico', 'Tratamiento de las deficiencias de ácido fólico. Presentación: Caja con 100 comprimidos recubiertos.'),
(40999, 'Ácido Fólico', 'Ácido fólico (vitamina B9)', '5 mg', 'Tabletas', 'Asmoh Laboratories', 'II-70999/2024', 20.5, 'Venta Libre', true, 'Tratamiento de las deficiencias de ácido fólico', 'Tratamiento de las deficiencias de ácido fólico. Presentación: Caja con 100 tabletas.'),
(39716, 'Ácido Ibandrónico', 'Ácido ibandrónico', '150 mg', 'Tabletas recubiertas', 'Ecar Cormesa', 'II-69716/2021', 33.5, 'Bajo Receta Médica', false, 'Tratamiento y prevención de la osteoporosis', 'Tratamiento y prevención de la osteoporosis. Presentación: Caja por 1, 2, 3, 4, 5, 6, 15, 20, 30, 50, 60 y 100 tabletas recubiertas.'),
(41205, 'Acido ibandronico', 'Ácido ibandrónico', '150 mg', 'Comprimidos recubiertos', 'Cofar', 'NN-71205/2020', 17.8, 'Bajo Receta Médica', false, 'Tratamiento y prevención de la osteoporosis', 'Tratamiento y prevención de la osteoporosis. Presentación: Caja con 2 comprimidos recubiertos.'),
(35342, 'Acido Nalidixico', 'Ácido nalidíxico', '500 mg', 'Comprimidos ranurados', 'Lafar', 'II-65342/2022', 23.5, 'Bajo Receta Médica', false, 'Antibacteriano', 'Antibacteriano. Presentación: Disponible únicamente para el mercado INSTITUCIONAL:
Caja con 2, 4, 10, 20, 30, 50, 100, 150 ó 500 comprimidos.'),
(41622, 'Acido Nalidixico', 'Ácido nalidíxico', '5 ml', 'Suspensión', 'Prodexa', 'II-71622/2022', 23.5, 'Bajo Receta Médica', false, 'Antibacteriano sistémico', 'Antibacteriano sistémico. Presentación: Caja con frasco por 120 ml sabor durazno + vaso dosificador.'),
(41623, 'Acido Nalidixico', 'Ácido nalidíxico', '500 mg', 'Comprimidos', 'Prodexa', 'II-71623/2023', 23.5, 'Bajo Receta Médica', false, 'Antibacteriano sistémico', 'Antibacteriano sistémico. Presentación: Caja con 100 o 500 comprimidos.'),
(41652, 'Acido Peracético', '-', 'Estándar', 'Equipo médico y hospitalario', 'Diasol', 'II-71652/2022', 21.5, 'Bajo Receta Médica', false, 'Germicida, desinfectante y sanitizante multiusos', 'Germicida, desinfectante y sanitizante multiusos. Presentación: Envase con 5 litros.'),
(41000, 'Ácido Valproico', 'Ácido valproico', '5 ml', 'Solución', 'Asmoh Laboratories', 'II-71000/2020', 31.5, 'Bajo Receta Médica', false, 'Antiepiléptico y anticonvulsivo', 'Antiepiléptico y anticonvulsivo. Presentación: Caja con frasco por 100 ml.'),
(35399, 'Acido Zoledrónico', 'Ácido zoledrónico', '5 ml', 'Polvo liofilizado para solución inyectable', 'IMA', 'II-65399/2024', 35.5, 'Bajo Receta Médica', false, 'Regulador del metabolismo óseo', 'Regulador del metabolismo óseo. Presentación: Caja por 1 Vial + Disolvente.'),
(38238, 'Acido Zoledronico', 'Ácido zoledrónico', '4 mg', 'Polvo liofilizado para inyección', 'Perulab', 'II-68238/2023', 35.5, 'Bajo Receta Médica', false, 'Regulador del metabolismo óseo', 'Regulador del metabolismo óseo. Presentación: Caja con 1, 5, 10, 50, 100, 500, 1000 frascos ampolla por 5 ml.'),
(40534, 'Acido Zoledrónico', 'Ácido zoledrónico', '4 mg', 'Polvo liofilizado para inyección', 'Microsules', 'II-70534/2024', 35.5, 'Bajo Receta Médica', false, 'Regulador del metabolismo óseo', 'Regulador del metabolismo óseo. Presentación: Caja con frasco ampolla.'),
(41770, 'Acidom Gel', 'Aluminio, hidróxido de; Magnesio, hidróxido de; Simeticona', '5 ml', 'Suspensión oral', 'Galenmarsfarma', 'II-71770/2020', 11.5, 'Venta Libre', true, 'Tratamiento de los trastornos digestivos', 'Tratamiento de los trastornos digestivos. Presentación: Caja con frasco por 170 ml sabor menta.'),
(36136, 'Acifol', 'Ácido fólico (vitamina B9)', 'Estándar', 'Comprimidos recubiertos', 'Quimfa Bolivia', 'II-66136/2021', 20.5, 'Venta Libre', true, 'Antianémico', 'Antianémico. Presentación: ACIFOL® 5 y ACIFOL® 10, envase conteniendo 30 comprimidos recubiertos.'),
(42075, 'Acitoprazol', 'Lansoprazol', '30 mg', 'Cápsulas de liberación retardada', 'CAMSA Industria y Comercio', 'II-72075/2020', 24.5, 'Bajo Receta Médica', false, 'Antiulceroso inhibidor de la bomba de protones', 'Antiulceroso inhibidor de la bomba de protones. Presentación: Caja con 28 cápsulas de liberación retardada.'),
(42076, 'Acitran', 'Ácido tranexámico', '500 mg', 'Comprimidos recubiertos', 'CAMSA Industria y Comercio', 'II-72076/2021', 33.5, 'Bajo Receta Médica', false, 'Antifibrinolítico', 'Antifibrinolítico. Presentación: Caja con 30 comprimidos recubiertos.'),
(40825, 'Acleria Hidratante Facial', '-', '50 g', 'Gel', 'Medihealth', 'II-70825/2020', 21.5, 'Bajo Receta Médica', false, 'Hidratante', 'Hidratante. Presentación: Caja con tubo por 50 g.'),
(40826, 'Acleria Mascarilla Limpiador Facial', '-', '150 g', 'Gel', 'Medihealth', 'II-70826/2021', 21.5, 'Bajo Receta Médica', false, 'Limpiador facial para piel sensible', 'Limpiador facial para piel sensible. Presentación: Caja con tubo por 150 g.'),
(39863, 'Acrylarm', 'Ácido poliacrílico', '2.00 mg', 'Gel oftálmico', 'Poen', 'II-69863/2023', 27.5, 'Bajo Receta Médica', false, 'Lágrimas artificiales', 'Lágrimas artificiales. Presentación: Caja con tubo por 10 g.'),
(35774, 'Acteril', 'Salbutamol', '5 ml', 'Jarabe', 'Indufar', 'II-65774/2024', 30.5, 'Bajo Receta Médica', false, 'Broncodilatador', 'Broncodilatador. Presentación: Caja por un frasco de 120 ml.'),
(37627, 'Acteril', 'Salbutamol', '5 mg', 'Solución para nebulizar', 'Indufar', 'II-67627/2022', 30.5, 'Bajo Receta Médica', false, 'Broncodilatador', 'Broncodilatador. Presentación: Caja con frasco por 15 ml.'),
(41864, 'Acticap', 'Ibuprofeno', '400 mg', 'Cápsulas blandas', 'Cofar', 'NN-71864/2024', 12.4, 'Venta Libre', true, 'Analgésico, antiinflamatorio y antipirético', 'Analgésico, antiinflamatorio y antipirético. Presentación: Caja con 50 cápsulas blandas.'),
(41865, 'Acticap 600', 'Ibuprofeno', '600 mg', 'Cápsulas blandas', 'Cofar', 'NN-71865/2020', 12.4, 'Venta Libre', true, 'Analgésico, antiinflamatorio y antipirético', 'Analgésico, antiinflamatorio y antipirético. Presentación: Caja con 50 cápsulas blandas.'),
(36445, 'Actifem', 'Cafeína; Ibuprofeno; Paracetamol (acetaminofén)', 'Estándar', 'Cápsulas blandas', 'Pacific Pharma Group', 'II-66445/2020', 16.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja por 100 cápsulas.'),
(35079, 'Actiforte B', 'Zinc (Zn)', '5 ml', 'Jarabe', 'Industrias Torrico Antelo (ITA)', 'II-65079/2024', 19.5, 'Venta Libre', true, 'Para la deficiencia de los componentes de la fórmula', 'Para la deficiencia de los componentes de la fórmula. Presentación: Frascos PET por 120 ml, con tapa rosca y precinto de seguridad, con caja individual y vaso dosificador.'),
(40760, 'Actigin Fer', 'Cianocobalamina (vitamina B12); Coenzima Q10; Hierro...', '214%', 'Cápsulas de gelatina blanda', 'SAE', 'II-70760/2020', 14.5, 'Venta Libre', true, 'Complemento alimenticio', 'Complemento alimenticio. Presentación: Caja con 30 cápsulas de gelatina blanda.'),
(35081, 'Actimilk', 'Magnesio, hidróxido de', '100,0 ml', 'Suspensión', 'Industrias Torrico Antelo (ITA)', 'II-65081/2021', 17.5, 'Venta Libre', true, 'Antiácido gástrico y laxante', 'Antiácido gástrico y laxante. Presentación: Frascos PET por 120 ml, con tapa rosca y precinto de seguridad.'),
(35082, 'Actimol', 'Paracetamol (acetaminofén)', '100 mg', 'Gotas|Jarabe', 'Industrias Torrico Antelo (ITA)', 'II-65082/2022', 14.5, 'Venta Libre', true, 'Analgésico', 'Analgésico. Presentación: ACTIMOL® Gotas: Caja con frasco gotero por 10, 15 ó 20 ml.
ACTIMOL® Jarabe: Caja con frasco por 60 ml.'),
(37827, 'Activa 21', 'Etinilestradiol; Levonorgestrel', 'Estándar', 'Grageas', 'Optel Corp', 'II-67827/2022', 26.5, 'Bajo Receta Médica', false, 'Anticonceptivo oral', 'Anticonceptivo oral. Presentación: Caja con 21 grageas.'),
(35083, 'Active', '-', '100 ml', 'Gel', 'Industrias Torrico Antelo (ITA)', 'II-65083/2023', 21.5, 'Bajo Receta Médica', false, 'Hipoalergénica', 'Hipoalergénica. Presentación: Frasco con 320 y 1000 g.
Envase con 5 kg.'),
(37675, 'Actron', 'Ibuprofeno', '400 mg', 'Cápsulas de gelatina blanda', 'Bayer Consumo', 'II-67675/2020', 19, 'Venta Libre', true, 'Analgésico y antiinflamatorio no esteroideo', 'Analgésico y antiinflamatorio no esteroideo. Presentación: ACTRON® 400: Caja por 10 cápsulas blandas de gelatina.
ACTRON® 600: Caja por 10 cápsulas blandas de gelatina.'),
(39652, 'Actron Pediátrico 4%', 'Ibuprofeno', '5 ml', 'Suspensión oral', 'Bayer Consumo', 'II-69652/2022', 19, 'Venta Libre', true, 'Analgésico, antiinflamatorio y antipirético', 'Analgésico, antiinflamatorio y antipirético. Presentación: Caja con frasco por 100 ml y jeringa dosificadora.'),
(40966, 'Acucip', 'Ciprofloxacino', '100 ml', 'Solución inyectable', 'Aculife', 'II-70966/2021', 23.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con frasco por 100 ml.'),
(40967, 'Acumet', 'Metronidazol', '100 ml', 'Solución inyectable', 'Aculife', 'II-70967/2022', 33.5, 'Bajo Receta Médica', false, 'Anaerobicida y bactericida', 'Anaerobicida y bactericida. Presentación: Caja con frasco por 100 ml.'),
(40003, 'Acupan', 'Nefopam', '2 ml', 'Solución inyectable', 'Biocodex', 'II-70003/2023', 26.5, 'Bajo Receta Médica', false, 'Tratamiento del dolor moderado a severo', 'Tratamiento del dolor moderado a severo. Presentación: Caja con 5 ampollas por 2 ml cada una.'),
(36309, 'Acutram', 'Cabergolina', '0.5 mg', 'Comprimidos', 'Pacific Pharma Group', 'II-66309/2024', 22.5, 'Bajo Receta Médica', false, 'Tratamiento de la hiperprolactinemia', 'Tratamiento de la hiperprolactinemia. Presentación: ACUTRAM 0.5 mg envase con 4 comprimidos.
Muestra médica: ACUTRAM 0.5 mg envase con 2 comprimidos.'),
(36772, 'Acyclo', 'Aciclovir', 'Estándar', 'Comprimidos', 'Vardhman Exports', 'II-66772/2022', 30.5, 'Bajo Receta Médica', false, 'Antiviral de amplio espectro', 'Antiviral de amplio espectro. Presentación: ACYCLO - 200: Caja por 100 comprimidos.
ACYCLO - 400: Caja por 100 comprimidos.
ACYCLO - 800: Caja por 100 comprimidos.'),
(36773, 'Acyclo Dermal', 'Aciclovir', '100 g', 'Crema', 'Vardhman Exports', 'II-66773/2023', 30.5, 'Bajo Receta Médica', false, 'Antiviral tópico', 'Antiviral tópico. Presentación: Tubo por 5 g.'),
(39205, 'Acyclogal', 'Aciclovir', '200 mg', 'Suspensión pediátrica', 'West Coast', 'II-69205/2020', 30.5, 'Bajo Receta Médica', false, 'Antiviral y antiherpético', 'Antiviral y antiherpético. Presentación: Caja con frasco por 125 ml.'),
(41394, 'Adapclin', 'Adapalene; Clindamicina', '100 g', 'Gel', 'Suiphar', 'II-71394/2024', 25.5, 'Bajo Receta Médica', false, 'Antiacneico', 'Antiacneico. Presentación: Caja con tubo por 30 g.'),
(37431, 'Adecuan', 'Metoclopramida', '100 ml', 'Solución gotas', 'Sigma Corp', 'NN-67431/2021', 23.5, 'Bajo Receta Médica', false, 'Antiemético', 'Antiemético. Presentación: Frasco gotero por 15 ml.'),
(37432, 'Adecuan', 'Metoclopramida', '2 ml', 'Solución inyectable', 'Sigma Corp', 'NN-67432/2022', 23.5, 'Bajo Receta Médica', false, 'Antiemético', 'Antiemético. Presentación: Caja por 5 ampollas.'),
(39653, 'Adenosina BIOL', 'Adenosina', '1 ml', 'Solución inyectable', 'BIOL', 'II-69653/2023', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja con 10 ampollas por 2 ml cada una.'),
(40190, 'Adolecin Pro', 'Adapalene; Clindamicina', '35 g', 'Gel', 'Lafar', 'II-70190/2020', 25.5, 'Bajo Receta Médica', false, 'Antiacneico', 'Antiacneico. Presentación: Caja con tubo por 35 g.'),
(40338, 'Adrenalina', 'Adrenalina', '1 mg', 'Solución inyectable', 'Ecar Cormesa', 'II-70338/2023', 23.5, 'Bajo Receta Médica', false, 'Simpaticomimético', 'Simpaticomimético. Presentación: Caja con 25 ampollas por 1 ml cada una.'),
(39654, 'Adrenalina BIOL', 'Adrenalina', '1 ml', 'Solución inyectable', 'BIOL', 'II-69654/2024', 23.5, 'Bajo Receta Médica', false, 'Simpaticomimético', 'Simpaticomimético. Presentación: Caja con 100 ampollas por 1 ml.'),
(39210, 'Adrenil', 'Adrenalina', '1 ml', 'Solución inyectable', 'Sakar Healthcare', 'II-69210/2020', 23.5, 'Bajo Receta Médica', false, 'Catecolamina simpaticomimética', 'Catecolamina simpaticomimética. Presentación: Caja con una ampolla por 1 ml.
Caja por 5 ampollas.'),
(40276, 'AE Mina', 'Retinol (vitamina A); Tocoferol (vitamina E)', 'Estándar', 'Cápsulas de gelatina blanda', 'Briyosis Soft Caps', 'II-70276/2021', 10.5, 'Venta Libre', true, 'Deficiencias de vitamina A y E', 'Deficiencias de vitamina A y E. Presentación: Caja con 30 cápsulas de gelatina blanda.'),
(39496, 'Aerolizer', '-', 'Estándar', 'Dispositivo', 'SAE', 'II-69496/2021', 21.5, 'Bajo Receta Médica', false, 'Inhalador de polvo seco', 'Inhalador de polvo seco. Presentación: Caja con 1 unidad.'),
(37842, 'Aerosal Adulto', '-', 'Estándar', 'Dispositivo', 'SAE', 'II-67842/2022', 21.5, 'Bajo Receta Médica', false, 'Dispositivo', 'Dispositivo. Presentación: Caja con dispositivo.'),
(37988, 'Aerosal Infantil', '-', 'Estándar', 'Dispositivo', 'SAE', 'II-67988/2023', 21.5, 'Bajo Receta Médica', false, 'Dispositivo', 'Dispositivo. Presentación: Caja con dispositivo.'),
(37058, 'Aforex', 'Albendazol', '10 ml', 'Suspensión', 'Grupo ALCOS', 'II-67058/2023', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico de amplio espectro', 'Antihelmíntico de amplio espectro. Presentación: Caja por 3 frascos bebibles de 10 ml cada uno.'),
(35489, 'Aftisan Plus', 'Clorhexidina; Fluocinolona; Lidocaína', '100 g', 'Gel', 'Ifarbo', 'NN-65489/2024', 13.8, 'Bajo Receta Médica', false, 'Tratamiento de la estomatitis o aftas', 'Tratamiento de la estomatitis o aftas. Presentación: Caja con tubo por 5 g.'),
(39324, 'Aftrel', 'Levonorgestrel', '1.5 mg', 'Comprimidos', 'Synmedic', 'II-69324/2024', 35.5, 'Bajo Receta Médica', false, 'Anticonceptivo', 'Anticonceptivo. Presentación: Caja por 1 comprimido.
Dispenser con 20 cajas por 1 comprimido cada uno.'),
(37437, 'Afungil', 'Itraconazol; Secnidazol', 'Estándar', 'Cápsulas', 'IFA Laboratorios', 'NN-67437/2022', 10.8, 'Bajo Receta Médica', false, 'Antiinfeccioso ginecológico', 'Antiinfeccioso ginecológico. Presentación: Caja con 12 cápsulas.'),
(41603, 'Afungil FD', 'Itraconazol; Secnidazol', 'Estándar', 'Comprimidos recubiertos', 'IFA Laboratorios', 'NN-71603/2023', 10.8, 'Bajo Receta Médica', false, 'Antimicótico y tricomonicida', 'Antimicótico y tricomonicida. Presentación: Caja con 6 comprimidos recubiertos.'),
(35886, 'Agex Soy', 'Lecitina; Soya; Tocoferol (vitamina E)...', '30 ml', 'Emulsión', 'Pharcos', 'II-65886/2021', 20.5, 'Venta Libre', true, 'Antioxidante', 'Antioxidante. Presentación: Caja con frasco por 30 ml.'),
(35885, 'Agex Soy', 'Soya; Tocoferol (vitamina E); Zinc, óxido de...', '500 mg', 'Cápsulas', 'Pharcos', 'II-65885/2020', 18.5, 'Venta Libre', true, 'Antioxidante', 'Antioxidante. Presentación: Caja de 60 cápsulas por 500 mg.'),
(38821, 'Agitador de Tubo 251', '-', 'Estándar', 'Equipo médico y hospitalario', 'HP Medical', 'II-68821/2021', 21.5, 'Bajo Receta Médica', false, 'Laboratorio', 'Laboratorio. Presentación: Un agitador.'),
(38822, 'Agitador Orbital Kline 255 B', '-', 'Estándar', 'Equipo médico y hospitalario', 'HP Medical', 'II-68822/2022', 21.5, 'Bajo Receta Médica', false, 'Laboratorio', 'Laboratorio. Presentación: Un agitador.'),
(36446, 'Agnus', 'Isotretinoína', '10 mg', 'Cápsulas blandas', 'Pacific Pharma Group', 'II-66446/2021', 22.5, 'Bajo Receta Médica', false, 'Retinoide para el tratamiento sistémico del acné', 'Retinoide para el tratamiento sistémico del acné. Presentación: AGNUS® 10: Caja con 30 cápsulas blandas.
AGNUS® 20: Caja con 30 cápsulas blandas.'),
(41815, 'Agofenac LC', 'Diclofenaco sódico', '3 ml', 'Solución inyectable', 'Sheen', 'II-71815/2020', 32, 'Bajo Receta Médica', false, 'Antiinflamatorio, analgésico, antipirético y antirreumático', 'Antiinflamatorio, analgésico, antipirético y antirreumático. Presentación: Caja con 10 ampollas por 3 ml cada una.'),
(40836, 'Agrafil', 'Sildenafil', '100 mg', 'Tabletas recubiertas', 'Vita Pharma', 'NN-70836/2021', 35.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: Caja con 2 tabletas recubiertas.'),
(37585, 'Agua Anestésica 1%', 'Lidocaína', '100 ml', 'Solución inyectable', 'IFA Laboratorios', 'NN-67585/2020', 17.8, 'Bajo Receta Médica', false, 'Anestésico', 'Anestésico. Presentación: Caja con 25 ampollas por 5 ml cada una.'),
(39422, 'Agua Destilada', 'Agua destilada', '10 ml', 'Solución inyectable', 'Indufar', 'II-69422/2022', 24.5, 'Bajo Receta Médica', false, 'Agua inyectable. Diluyente y disolvente de medicamentos', 'Agua inyectable. Diluyente y disolvente de medicamentos. Presentación: Caja con ampolla de vidrio incoloro.'),
(42008, 'Agua Destilada', 'Agua destilada', 'Estándar', 'Líquido', 'Pharmandina', 'II-72008/2023', 24.5, 'Bajo Receta Médica', false, 'Equipos e insumos para la salud', 'Equipos e insumos para la salud. Presentación: Bidón con 10 litros.'),
(37760, 'Agua Esteril para Inyectables', '-', '5 ml', 'Solución inyectable', 'Mhedical Pharma', 'II-67760/2020', 21.5, 'Bajo Receta Médica', false, 'Agua inyectable. Diluyente y disolvente de medicamentos', 'Agua inyectable. Diluyente y disolvente de medicamentos. Presentación: Caja por 100 ampollas de 5 ml.'),
(35656, 'Agua Florida', '-', '25 ml', 'Solución', 'Ifarbo', 'NN-65656/2021', 5.8, 'Bajo Receta Médica', false, 'Cosmético aromatizante', 'Cosmético aromatizante. Presentación: Frasco con 25 ml.'),
(37586, 'Agua Inyectable', 'Agua inyectable', '10 ml', 'Solución inyectable', 'IFA Laboratorios', 'NN-67586/2021', 5.8, 'Bajo Receta Médica', false, 'Diluyente', 'Diluyente. Presentación: Ampolla con 5 ml.
Ampolla con 10 ml.
Caja con 25 ampollas por 5 ml cada una.
Caja con 25 ampollas por 10 ml cada una.'),
(35616, 'Agua Oxigenada 3%', 'Hidrógeno, peróxido de', '3 ml', 'Solución', 'Ifarbo', 'NN-65616/2021', 9.8, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Frascos de 60, 125, 500 y 1000 ml.'),
(40500, 'Agua para Inyección', 'Agua inyectable', '5 ml', 'Solución inyectable', 'Kadila Pharmaceuticals', 'II-70500/2020', 21.5, 'Bajo Receta Médica', false, 'Agua inyectable. Diluyente y disolvente de medicamentos', 'Agua inyectable. Diluyente y disolvente de medicamentos. Presentación: Caja con 100 ampollas por 5 ml cada una.'),
(41001, 'Agua Para Inyección', 'Agua inyectable', '5 ml', 'Solución inyectable', 'Asmoh Laboratories', 'II-71001/2021', 21.5, 'Bajo Receta Médica', false, 'Agua inyectable. Diluyente y disolvente de medicamentos', 'Agua inyectable. Diluyente y disolvente de medicamentos. Presentación: Caja con 50 viales por 5 ml cada uno.'),
(41942, 'Agua para Inyección', 'Agua inyectable', '10 ml', 'Solución inyectable', 'Pharmandina', 'II-71942/2022', 21.5, 'Bajo Receta Médica', false, 'Agua inyectable. Diluyente y disolvente de medicamentos', 'Agua inyectable. Diluyente y disolvente de medicamentos. Presentación: Caja con 50 ampollas por 5 ml.
Caja con 50 ampollas por 10 ml.'),
(39328, 'Agua para Inyección Flex', 'Agua inyectable', '5 ml', 'Solución inyectable', 'ABD', 'II-69328/2023', 21.5, 'Bajo Receta Médica', false, 'Agua inyectable. Diluyente y disolvente de medicamentos', 'Agua inyectable. Diluyente y disolvente de medicamentos. Presentación: Frasco ampolla por 5 ml.
Frasco ampolla por 10 ml.'),
(37608, 'Aguja de Biopsia Quick Core', '-', 'Estándar', 'Equipo médico y hospitalario', 'Cook', 'II-67608/2023', 21.5, 'Bajo Receta Médica', false, 'Urología', 'Urología. Presentación: Aguja de biopsia.'),
(37128, 'Aguja para esclerosis VIN 25', '-', 'Estándar', 'Equipo médico y hospitalario', 'Cook', 'II-67128/2023', 21.5, 'Bajo Receta Médica', false, 'Gastroenterología', 'Gastroenterología. Presentación: -'),
(37129, 'Aguja para esclerosis VINF 23', '-', 'Estándar', 'Equipo médico y hospitalario', 'Cook', 'II-67129/2024', 21.5, 'Bajo Receta Médica', false, 'Gastroenterología', 'Gastroenterología. Presentación: -'),
(41655, 'Agujas Dora para Hemodiálisis', '-', 'Estándar', 'Equipo médico y hospitalario', 'Bain Medical', 'II-71655/2020', 21.5, 'Bajo Receta Médica', false, 'Insumos para diálisis', 'Insumos para diálisis. Presentación: Agujas.'),
(37738, 'Airgel TM380', '-', 'Estándar', 'Equipo médico y hospitalario', 'Theramart', 'II-67738/2023', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: Un cojín.'),
(36373, 'Airmax', 'Levosalbutamol', '50 mcg', 'Aerosol', 'Pacific Pharma Group', 'II-66373/2023', 33.5, 'Bajo Receta Médica', false, 'Mucolítico y broncodilatador beta2-adrenérgico', 'Mucolítico y broncodilatador beta2-adrenérgico. Presentación: AIRMAX frasco inhalador aerosol con 200 dosis medidas.'),
(39789, 'Airmax 0.63', 'Levosalbutamol', '2.5 ml', 'Solución para nebulizar', 'SAE', 'II-69789/2024', 33.5, 'Bajo Receta Médica', false, 'Antiasmático, broncodilatador', 'Antiasmático, broncodilatador. Presentación: Caja con 20 ampollas de nebulización por 2.5 ml cada una.'),
(41587, 'Akan', 'Montelukast', '10 mg', 'Comprimidos recubiertos', 'Raíces', 'II-71587/2022', 26.5, 'Bajo Receta Médica', false, 'Antiasmático', 'Antiasmático. Presentación: Caja con 10 comprimidos recubiertos.'),
(39468, 'Al Codion', 'Codeína', '5 ml', 'Jarabe infantil', 'Grupo ALCOS', 'II-69468/2023', 34.5, 'Bajo Receta Médica', false, 'Antitusivo', 'Antitusivo. Presentación: Caja con frasco por 125 ml.'),
(39469, 'Al Codion', 'Codeína', '5 ml', 'Jarabe adulto', 'Grupo ALCOS', 'II-69469/2024', 34.5, 'Bajo Receta Médica', false, 'Antitusivo', 'Antitusivo. Presentación: Caja con frasco por 180 ml.'),
(39470, 'Al Codion', 'Codeína', 'Estándar', 'Comprimidos recubiertos', 'Grupo ALCOS', 'II-69470/2020', 34.5, 'Bajo Receta Médica', false, 'Antitusivo', 'Antitusivo. Presentación: Caja por 20 comprimidos recubiertos.'),
(41569, 'Al Codion Zero', 'Clorfeniramina; Codeína, fosfato de; Pseudoefedrina', '5 ml', 'Jarabe', 'Grupo ALCOS', 'II-71569/2024', 14.5, 'Venta Libre', true, 'Antitusivo, antihistamínico y descongestionante', 'Antitusivo, antihistamínico y descongestionante. Presentación: Caja con frasco por 100 ml.'),
(40710, 'Albaglob', 'Albendazol', '400 mg', 'Tabletas masticables', 'Globela Pharma', 'II-70710/2020', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico', 'Antihelmíntico. Presentación: Caja con 10 tabletas masticables.
Caja con 100 tabletas masticables.'),
(36310, 'Albendazol', 'Albendazol', '400 mg', 'Comprimidos masticables', 'Pacific Pharma Group', 'II-66310/2020', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico', 'Antihelmíntico. Presentación: Caja con 20 comprimidos masticables.'),
(38420, 'Albendazol', 'Albendazol', '200 mg', 'Comprimidos masticables', 'Prodexa', 'II-68420/2020', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico', 'Antihelmíntico. Presentación: Caja con 10, 50 o 100 comprimidos masticables.'),
(38421, 'Albendazol', 'Albendazol', '10 ml', 'Suspensión', 'Prodexa', 'II-68421/2021', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico', 'Antihelmíntico. Presentación: Caja con frasco por 10 ml sabor tutti frutti.'),
(41771, 'Albendazol', 'Albendazol', '400 mg', 'Tabletas masticables', 'Galenmarsfarma', 'II-71771/2021', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico', 'Antihelmíntico. Presentación: Caja con 20 tabletas masticables.'),
(38947, 'Albendazol 400 mg', 'Albendazol', '400 mg', 'Comprimidos masticables', 'Sanat Pharma', 'II-68947/2022', 21.5, 'Bajo Receta Médica', false, 'Antihelmíntico', 'Antihelmíntico. Presentación: Caja por 1 comprimido masticable sabor fresa.'),
(38635, 'Albisec One', 'Itraconazol; Secnidazol', 'Estándar', 'Tabletas recubiertas', 'Procaps', 'II-68635/2020', 26.5, 'Bajo Receta Médica', false, 'Antiinfeccioso vaginal', 'Antiinfeccioso vaginal. Presentación: Caja por 6 tabletas recubiertas (G-tabs).'),
(35283, 'Albistatin', 'Nistatina', '100.000 UI', 'Crema dérmica', 'Lafar', 'II-65283/2023', 30.5, 'Bajo Receta Médica', false, 'Antimicótico', 'Antimicótico. Presentación: Disponible únicamente para el mercado INSTITUCIONAL:
Caja con tubo por 10 g.'),
(35111, 'Albumina Farmedical', 'Albúmina humana', '100 ml', 'Solución inyectable', 'Farmedical', 'II-65111/2021', 24.5, 'Bajo Receta Médica', false, 'Expansor plasmático', 'Expansor plasmático. Presentación: Vial por 50 mL de Albúmina Humana al 20%.'),
(39793, 'AlbuRx', 'Albúmina humana', '1000 g', 'Solución para infusión', 'Megalabs', 'II-69793/2023', 24.5, 'Bajo Receta Médica', false, 'Expansor plasmático', 'Expansor plasmático. Presentación: Caja con vial por 50 ml.'),
(38584, 'Alcachofa Nature’s Garden', '-', '100 ml', 'Solución', 'Carvagu', 'II-68584/2024', 21.5, 'Bajo Receta Médica', false, 'Colagogo y colerético', 'Colagogo y colerético. Presentación: Caja con frasco por 750 ml.'),
(39411, 'Alclimax', 'Sildenafil', '50 mg', 'Comprimidos recubiertos', 'Quilab', 'II-69411/2021', 35.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: Caja con 10 comprimidos recubiertos.'),
(38362, 'Alcodic Nasal', 'Sodio, cloruro de', '100 ml', 'Solución spray', 'Grupo ALCOS', 'II-68362/2022', 24.5, 'Bajo Receta Médica', false, 'Humectante y lubricante nasal', 'Humectante y lubricante nasal. Presentación: Caja con frasco por 10 ml.'),
(35084, 'Alcodito', 'Yodo', '100 ml', 'Solución', 'Industrias Torrico Antelo (ITA)', 'II-65084/2024', 27.5, 'Bajo Receta Médica', false, 'Antiséptico y germicida', 'Antiséptico y germicida. Presentación: Frascos PET con tapa rosca y precinto de seguridad por 60, 125, 500 y 1000 ml.'),
(38046, 'Alcodito 2%', 'Yodo', '2,0 g', 'Solución', 'Industrias Torrico Antelo (ITA)', 'II-68046/2021', 27.5, 'Bajo Receta Médica', false, 'Antiséptico y germicida', 'Antiséptico y germicida. Presentación: Frascos PET por 60 y 125 ml.
Frascos polietileno por 500 y 1000 ml.'),
(39474, 'Alcofaz', '-', '250 ml', 'Gel', 'Grupo ALCOS', 'II-69474/2024', 21.5, 'Bajo Receta Médica', false, 'Conductor para ultrasonido', 'Conductor para ultrasonido. Presentación: Envase plástico por 100 y 250 ml.
Envase plástico por 1, 2 y 5 litros.'),
(36960, 'Alcofen', 'Paracetamol (acetaminofén)', '500 mg', 'Comprimidos', 'Grupo ALCOS', 'II-66960/2020', 14.5, 'Venta Libre', true, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja por 72 comprimidos en blister.'),
(36961, 'Alcofen Femenino', 'Cafeína; Paracetamol (acetaminofén)', 'Estándar', 'Comprimidos', 'Grupo ALCOS', 'II-66961/2021', 16.5, 'Venta Libre', true, 'Tratamiento de los trastornos menstruales', 'Tratamiento de los trastornos menstruales. Presentación: Caja por 40 comprimidos en blister al y pvc, en sobres por 4 c/u.'),
(39467, 'Alcofen Femenino NF', 'Cafeína; Ibuprofeno; Paracetamol (acetaminofén)', 'Estándar', 'Comprimidos', 'Grupo ALCOS', 'II-69467/2022', 14, 'Venta Libre', true, 'Analgésico y antiinflamatorio', 'Analgésico y antiinflamatorio. Presentación: Caja con 40 comprimidos en sobres por 4 cada uno.'),
(37565, 'Alcoflex Ringer Lactato', 'Calcio, cloruro de; Potasio, cloruro de; Sodio, cloruro de...', '1000 ml', 'Solución', 'Grupo ALCOS', 'II-67565/2020', 8.5, 'Venta Libre', true, 'Solución energética e hidroelectrolíca', 'Solución energética e hidroelectrolíca. Presentación: Caja con 12 infusores por 1000 ml con sobrebolsa.
Caja con 24 infusores por 500 ml con sobrebolsa.'),
(37566, 'Alcoflex Ringer Normal', 'Calcio, cloruro de; Potasio, cloruro de; Sodio, cloruro de', '1000 ml', 'Solución', 'Grupo ALCOS', 'II-67566/2021', 20.5, 'Venta Libre', true, 'Solución rehidratante y electrolítica', 'Solución rehidratante y electrolítica. Presentación: Caja con 12 infusores por 1000 ml con sobrebolsa.'),
(40606, 'Alcohol Gel', 'Alcohol etílico', '1000 ml', 'Gel', 'IFA Laboratorios', 'NN-70606/2021', 15.8, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Frasco con 250, 500 o 1000 ml.'),
(41356, 'Alcohol Gel', 'Alcohol etílico', '100 ml', 'Gel', 'Vita Laboratorios', 'NN-71356/2021', 31.5, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Frasco con 100 ml.'),
(35661, 'Alcohol Gel Vivian', 'Glicerina; Hidroxipropilcelulosa; Sodio, benzoato de', '400 g', 'Gel', 'Ifarbo', 'NN-65661/2021', 17.8, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Frasco con 100 o 400 g.
Frasco con 5 kg.'),
(35085, 'Alcohol Medicinal', 'Alcohol etílico', '100,0 ml', 'Solución', 'Industrias Torrico Antelo (ITA)', 'II-65085/2020', 31.5, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Frascos PET por 60, 125, 500 y 1000 mL con tapa rosca y precinto de seguridad. Bidones plásticos por 4,5 litros con tapa rosca y precinto seguridad.'),
(35391, 'Alcohol Medicinal 70%', 'Alcohol etílico', '100 ml', 'Solución', 'Minerva', 'II-65391/2021', 31.5, 'Bajo Receta Médica', false, 'Antiséptico y desinfectante de uso tópico', 'Antiséptico y desinfectante de uso tópico. Presentación: Frasco con 60 ml.
Frasco con 100 ml.
Frasco con 1000 ml.'),
(41170, 'Alcoseptol', 'Abeja, miel de; Manzanilla, extracto de; Propoleo, extracto fluido de', '100 ml', 'Solución spray', 'Grupo ALCOS', 'II-71170/2020', 22.5, 'Bajo Receta Médica', false, 'Auxiliar en las molestias bucales y de la garganta', 'Auxiliar en las molestias bucales y de la garganta. Presentación: Caja con frasco aspersor por 30 ml sabor limón.'),
(41166, 'Alcosertan', 'Losartán', '50 mg', 'Comprimidos recubiertos', 'Grupo ALCOS', 'II-71166/2021', 25.5, 'Bajo Receta Médica', false, 'Antihipertensivo', 'Antihipertensivo. Presentación: Caja con 30 comprimidos recubiertos.'),
(41167, 'Alcosertan H', 'Hidroclorotiazida; Losartán', 'Estándar', 'Comprimidos recubiertos', 'Grupo ALCOS', 'II-71167/2022', 28.5, 'Bajo Receta Médica', false, 'Antihipertensivo y diurético', 'Antihipertensivo y diurético. Presentación: Caja con 30 comprimidos recubiertos.'),
(41273, 'Aldana', 'Carbidopa; Levodopa', 'Estándar', 'Comprimidos ranurados', 'Farmedical', 'II-71273/2023', 24.5, 'Bajo Receta Médica', false, 'Antiparkinsoniano', 'Antiparkinsoniano. Presentación: Caja con 30 comprimidos ranurados.'),
(40027, 'Aldana XR', 'Carbidopa; Levodopa', 'Estándar', 'Comprimidos', 'Farmedical', 'II-70027/2022', 24.5, 'Bajo Receta Médica', false, 'Antiparkinsoniano', 'Antiparkinsoniano. Presentación: Caja con 30 comprimidos de liberación sostenida.'),
(36774, 'Aldrovard', 'Ácido alendrónico', '70 mg', 'Comprimidos', 'Vardhman Exports', 'II-66774/2024', 24.5, 'Bajo Receta Médica', false, 'Tratamiento y prevención de la osteoporosis', 'Tratamiento y prevención de la osteoporosis. Presentación: Caja por 40 comprimidos.
Blister por 4 comprimidos.'),
(41302, 'Alecensa', 'Alectinib', '150 mg', 'Cápsulas', 'Roche Bolivia', 'II-71302/2022', 28.5, 'Bajo Receta Médica', false, 'Tratamiento del cáncer pulmonar de células no pequeñas', 'Tratamiento del cáncer pulmonar de células no pequeñas. Presentación: Caja con 224 cápsulas duras.'),
(38422, 'Alendronato', 'Alendronato', '70 mg', 'Comprimidos', 'Prodexa', 'II-68422/2022', 24.5, 'Bajo Receta Médica', false, 'Tratamiento de la osteoporosis', 'Tratamiento de la osteoporosis. Presentación: Caja con 4, 100, 200 o 500 comprimidos.'),
(36217, 'Alendronato Sódico', 'Alendronato', '70 mg', 'Tabletas', 'La Santé', 'II-66217/2022', 24.5, 'Bajo Receta Médica', false, 'Tratamiento de la osteoporosis', 'Tratamiento de la osteoporosis. Presentación: Caja por 4 tabletas.'),
(36963, 'Alergin', 'Clorfenamina', '5 ml', 'Jarabe', 'Grupo ALCOS', 'II-66963/2023', 8.5, 'Venta Libre', true, 'Antihistamínico', 'Antihistamínico. Presentación: Caja con frasco por 60 ml.'),
(36964, 'Alergin', 'Clorfenamina', '4 mg', 'Comprimidos', 'Grupo ALCOS', 'II-66964/2024', 8.5, 'Venta Libre', true, 'Antihistamínico', 'Antihistamínico. Presentación: Caja por 48 comprimidos.'),
(35776, 'Alergina', 'Cetirizina', '10 mg', 'Comprimidos', 'Indufar', 'II-65776/2021', 14.5, 'Venta Libre', true, 'Antihistamínico', 'Antihistamínico. Presentación: Caja por 12 comprimidos.'),
(37628, 'Alergina', 'Cetirizina', '5 ml', 'Jarabe', 'Indufar', 'II-67628/2023', 14.5, 'Venta Libre', true, 'Antihistamínico y antialérgico', 'Antihistamínico y antialérgico. Presentación: Caja con frasco por 100 ml.'),
(38120, 'Alergipat', 'Olopatadina', '2,0 mg', 'Solución oftálmica', 'Roster', 'II-68120/2020', 28.5, 'Bajo Receta Médica', false, 'Antihistamínico y descongestivo ocular', 'Antihistamínico y descongestivo ocular. Presentación: Caja con un frasco gotero por 5 ml.'),
(36400, 'Alernova', 'Levocetirizina', '5 mg', 'Comprimidos dispersables', 'Pacific Pharma Group', 'II-66400/2020', 17.5, 'Venta Libre', true, 'Antihistamínico y antialérgico', 'Antihistamínico y antialérgico. Presentación: Caja con 30 comprimidos bucodispersables.'),
(42051, 'Alfa Tossin Infantil', 'Codeína', '5 ml', 'Solución oral', 'Alfa', 'II-72051/2021', 34.5, 'Bajo Receta Médica', false, 'Antitusígeno', 'Antitusígeno. Presentación: Caja con frasco por 100 ml sabor a frutas.'),
(36459, 'Alfadoxin', 'Doxazosina', '4 mg', 'Comprimidos recubiertos', 'LCH Laboratorio Chile', 'II-66459/2024', 27.5, 'Bajo Receta Médica', false, 'Antihipertensivo', 'Antihipertensivo. Presentación: Caja con 30 comprimidos recubiertos.'),
(39787, 'Algho Día', 'Cetirizina; Fenilefrina; Paracetamol (acetaminofén)', '5 g', 'Polvo granulado', 'Suiphar', 'II-69787/2022', 21.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja con 50 sobres por 5 g cada uno sabor naranja.'),
(39788, 'Algho Noche', 'Fenilefrina; Loratadina; Paracetamol (acetaminofén)', '5 g', 'Polvo granulado', 'Suiphar', 'II-69788/2023', 17.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja con 50 sobres por 5 g cada uno sabor miel y limón.
Muestra médica: Caja con 3 sobres.'),
(39359, 'Algicler', 'Diclofenaco', '100 g', 'Gel', 'Monserrat y Eclair', 'II-69359/2024', 22, 'Bajo Receta Médica', false, 'Antiinflamatorio y analgésico tópico', 'Antiinflamatorio y analgésico tópico. Presentación: Caja con tubo por 50 g.'),
(36754, 'Algipal', 'Guayacol; Mentol; Metilo, salicilato de', '100 g', 'Ungüento', 'Laqfagal', 'II-66754/2024', 21.5, 'Venta Libre', true, 'Antirreumático y analgésico', 'Antirreumático y analgésico. Presentación: Pomo de aluminio por 22 g.
Caja con tubo de aluminio por 15 o 30 g.'),
(36755, 'Algipal Relispray', 'Alcanfor; Mentol; Metilo, salicilato de...', '100 ml', 'Spray', 'Laqfagal', 'II-66755/2020', 9.5, 'Venta Libre', true, 'Antirreumático y analgésico', 'Antirreumático y analgésico. Presentación: Canister de 150 ml.'),
(40649, 'Alglutamin', 'Glutamina, N (2)-L-alanil-L-', '50 ml', 'Solución inyectable', 'P.L Rivero y Cia', 'II-70649/2024', 35.5, 'Bajo Receta Médica', false, 'Aminoácidos para nutrición parenteral', 'Aminoácidos para nutrición parenteral. Presentación: Frasco con 50 ml.'),
(41389, 'Alia2', 'Sodio, bicarbonato de; Sodio, carbonato de', '5 g', 'Polvo efervescente', 'Vita Laboratorios', 'NN-71389/2024', 34.5, 'Bajo Receta Médica', false, 'Antiácido', 'Antiácido. Presentación: Caja con 30 sobres por 5 g. Cada sobre contiene 1 comprimido + 5 g de polvo efervescente.'),
(41597, 'Alimento Complementario Nutri Mamá', '-', '800 g', 'Polvo', 'Industrias Torrico Antelo (ITA)', 'II-71597/2022', 21.5, 'Bajo Receta Médica', false, 'Suplemento alimenticio', 'Suplemento alimenticio. Presentación: Bolsa trilaminada con 800 g.'),
(40614, 'Alin Oftalmico', 'Dexametasona; Neomicina', '5 ml', 'Solución oftálmica', 'Chinoin', 'II-70614/2024', 34.5, 'Bajo Receta Médica', false, 'Antibiótico oftálmico', 'Antibiótico oftálmico. Presentación: Caja con frasco gotero por 5 ml.'),
(40890, 'Aliprost', 'Tamsulosina', '0.4 mg', 'Cápsulas de gelatina dura', 'San Fernando', 'II-70890/2020', 34.5, 'Bajo Receta Médica', false, 'Tratamiento de hiperplasia prostática benigna (HPB)', 'Tratamiento de hiperplasia prostática benigna (HPB). Presentación: Caja con 30 capsulas de gelatina dura.'),
(40883, 'Aliprost Duo', 'Dutasterida; Tamsulosina', 'Estándar', 'Cápsulas de gelatina dura', 'San Fernando', 'II-70883/2023', 26.5, 'Bajo Receta Médica', false, 'Tratamiento de la hiperplasia prostática benigna', 'Tratamiento de la hiperplasia prostática benigna. Presentación: Caja con 30 cápsulas de gelatina dura.'),
(41524, 'Aliviax', 'Magaldrato; Simeticona', '10 ml', 'Suspensión oral', 'Fortier', 'II-71524/2024', 9.5, 'Venta Libre', true, 'Antiácido y antiflatulento', 'Antiácido y antiflatulento. Presentación: Caja con frasco por 200 ml sabor vainilla.'),
(41435, 'Aliviax Flux', 'Magaldrato; Simeticona', '10 ml', 'Suspensión', 'Fortier', 'II-71435/2020', 9.5, 'Venta Libre', true, 'Antiácido y antiflatulento', 'Antiácido y antiflatulento. Presentación: Caja con frasco por 200 ml sabor vainilla.'),
(39384, 'Aliviol', 'Diclofenaco dietilamina; Metilsalicilato', '100 ml', 'Spray', 'Farmedical', 'II-69384/2024', 15, 'Venta Libre', true, 'Antiinflamatorio y analgésico', 'Antiinflamatorio y analgésico. Presentación: Caja con frasco por 100 ml.'),
(40842, 'Aliviol', 'Diclofenaco sódico', '1 ml', 'Solución inyectable', 'Farmedical', 'II-70842/2022', 32, 'Bajo Receta Médica', false, 'Analgésico, antiinflamatorio y antirreumático', 'Analgésico, antiinflamatorio y antirreumático. Presentación: Caja con 10 ampollas por 1 ml.'),
(35110, 'Aliviol', 'Diclofenaco; Mentol; Metilsalicilato', '100 g', 'Gel', 'Farmedical', 'II-65110/2020', 9, 'Venta Libre', true, 'Analgésico y antiinflamatorio', 'Analgésico y antiinflamatorio. Presentación: Caja con tubo por 30 g.
Caja con tubo por 50 g.'),
(39036, 'Aliviol Antigripal', 'Clorfenamina; Dextrometorfano; Fenilefrina...', 'Estándar', 'Cápsulas', 'Farmedical', 'II-69036/2021', 7.5, 'Venta Libre', true, 'Analgésico, antipirético y antihistamínico', 'Analgésico, antipirético y antihistamínico. Presentación: Caja por 100 cápsulas + prospecto.'),
(41274, 'Aliviol Antigripal', 'Clorfenamina; Dextrometorfano; Fenilefrina...', '325 mg', 'Cápsulas blandas', 'Farmedical', 'II-71274/2024', 7.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja con 100 cápsulas blandas.'),
(37668, 'Aliviol Plus', 'Diclofenaco; Paracetamol (acetaminofén)', '50 mg', 'Comprimidos', 'Farmedical', 'II-67668/2023', 14, 'Venta Libre', true, 'Antiinflamatorio no esteroideo con acción analgésica', 'Antiinflamatorio no esteroideo con acción analgésica. Presentación: Caja con 100 comprimidos recubiertos.'),
(41245, 'Aliviol Plus Forte', 'Diclofenaco; Paracetamol (acetaminofén)', 'Estándar', 'Comprimidos recubiertos', 'Farmedical', 'II-71245/2020', 14, 'Venta Libre', true, 'Analgésico, antiinflamatorio', 'Analgésico, antiinflamatorio. Presentación: Caja con 30 comprimidos recubiertos.'),
(41571, 'Alleance Ofteno', 'Atropina', '0.100 mg', 'Solución oftálmica estéril', 'Sophia', 'II-71571/2021', 26.5, 'Bajo Receta Médica', false, 'Tratamiento de la miopía progresiva infantil', 'Tratamiento de la miopía progresiva infantil. Presentación: Caja con frasco gotero por 5 ml.'),
(37420, 'Allegra', 'Fexofenadina', '5 ml', 'Suspensión', 'Sanofi', 'II-67420/2020', 30.5, 'Bajo Receta Médica', false, 'Antihistamínico no sedante', 'Antihistamínico no sedante. Presentación: Frasco plástico ámbar conteniendo 150 ml.'),
(36657, 'Almaximo', 'Sildenafil', '50 mg', 'Comprimidos recubiertos', 'Savant Pharm', 'II-66657/2022', 35.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: ALMÁXIMO 50: Caja por 10 comprimidos recubiertos.
ALMÁXIMO 100: Caja por 10 comprimidos recubiertos.'),
(39699, 'Almaximo', 'Sildenafil', '50 mg', 'Comprimidos masticables', 'Savant Pharm', 'II-69699/2024', 35.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: Caja por 2 comprimidos masticables.'),
(39698, 'Almaximo 36', 'Tadalafil', '20 mg', 'Comprimidos recubiertos', 'Savant Pharm', 'II-69698/2023', 34.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: Caja por 8 comprimidos recubiertos.'),
(37015, 'Almohada Masajeadora HM 340', '-', 'Estándar', 'Equipo médico y hospitalario', 'Omron', 'II-67015/2020', 21.5, 'Bajo Receta Médica', false, 'Cuidado de la salud en el hogar', 'Cuidado de la salud en el hogar. Presentación: -'),
(39744, 'Almont', 'Montelukast', '10 mg', 'Tabletas recubiertas', 'Unicure Remedies', 'II-69744/2024', 26.5, 'Bajo Receta Médica', false, 'Tratamiento del asma y la rinitis alérgica', 'Tratamiento del asma y la rinitis alérgica. Presentación: Caja por 100 tabletas.'),
(35088, 'Almoval', 'Vaselina líquida', '100 ml', 'Solución', 'Industrias Torrico Antelo (ITA)', 'II-65088/2023', 24.5, 'Bajo Receta Médica', false, 'Lubricante', 'Lubricante. Presentación: Frascos PET con tapa rosca y aro de seguridad por 30, 125, 500 y 1000 mL.'),
(35087, 'Almoval', 'Vaselina sólida', '100 g', 'Pomada', 'Industrias Torrico Antelo (ITA)', 'II-65087/2022', 35.5, 'Bajo Receta Médica', false, 'Lubricante y humectante', 'Lubricante y humectante. Presentación: Hojalatas metálicas por 7, 10 y 15 g.
Potes plásticos por 250, 450 y 950 g.'),
(38047, 'Almoval Chanel', 'Vaselina sólida', '100,0 g', 'Pomada', 'Industrias Torrico Antelo (ITA)', 'II-68047/2022', 35.5, 'Bajo Receta Médica', false, 'Lubricante y humectante', 'Lubricante y humectante. Presentación: Hojalatas metálicas por 15 g.'),
(38048, 'Almoval Rosa', 'Vaselina sólida', '100,0 g', 'Pomada', 'Industrias Torrico Antelo (ITA)', 'II-68048/2023', 35.5, 'Bajo Receta Médica', false, 'Lubricante y humectante', 'Lubricante y humectante. Presentación: Hojalatas metálicas por 15 g.'),
(36120, 'Aloe Valencia', '-', 'Estándar', 'Solución oral', 'Valencia', 'II-66120/2020', 7.5, 'Venta Libre', true, 'Suplemento alimenticio', 'Suplemento alimenticio. Presentación: Frasco con 1 litro con azúcar.
Frasco con 1 litro con stevia.'),
(38234, 'Alopel', '-', '100 ml', 'Spray', 'Catalysis', 'II-68234/2024', 21.5, 'Bajo Receta Médica', false, 'Tratamiento de la alopecia', 'Tratamiento de la alopecia. Presentación: Envase plástico por 100 ml.'),
(35998, 'Alopurinol', 'Alopurinol', '300 mg', 'Comprimidos', 'Hahnemann', 'II-65998/2023', 32.5, 'Bajo Receta Médica', false, 'Antihiperuricémico y antigotoso', 'Antihiperuricémico y antigotoso. Presentación: Caja con 250 comprimidos.'),
(38423, 'Alopurinol', 'Alopurinol', '300 mg', 'Comprimidos recubiertos', 'Prodexa', 'II-68423/2023', 32.5, 'Bajo Receta Médica', false, 'Antihiperuricémico y antigotoso', 'Antihiperuricémico y antigotoso. Presentación: Caja con 20, 100 o 500 comprimidos recubiertos.'),
(41475, 'Alopurinol', 'Alopurinol', '300 mg', 'Tabletas', 'Asmoh Laboratories', 'II-71475/2020', 32.5, 'Bajo Receta Médica', false, 'Antihiperuricémico y antigotoso', 'Antihiperuricémico y antigotoso. Presentación: Caja con 100 tabletas.'),
(36569, 'Alplax', 'Alprazolam', '0.5 mg', 'Comprimidos', 'Gador', 'II-66569/2024', 29.5, 'Bajo Receta Médica', false, 'Ansiolítico', 'Ansiolítico. Presentación: ALPLAX® 0.5:
Caja con 30 comprimidos.
Caja con 60 comprimidos.
ALPLAX® 1: Caja con 30 comprimidos.
ALPLAX® 2: Caja con 30 comprimidos.'),
(36570, 'Alplax XR', 'Alprazolam', '0.5 mg', 'Comprimidos de liberación controlada', 'Gador', 'II-66570/2020', 29.5, 'Bajo Receta Médica', false, 'Ansiolítico', 'Ansiolítico. Presentación: Caja con 20 comprimidos de liberación controlada'),
(38395, 'Alpranest', 'Alprazolam', '0,5 mg', 'Comprimidos', 'Alfa', 'II-68395/2020', 29.5, 'Bajo Receta Médica', false, 'Ansiolítico', 'Ansiolítico. Presentación: Caja con 30 comprimidos.'),
(39851, 'Alsucral', 'Sucralfato', '1 g', 'Tabletas', 'Ropsohn', 'II-69851/2021', 30.5, 'Bajo Receta Médica', false, 'Antiulceroso', 'Antiulceroso. Presentación: Caja con 20 tabletas.'),
(40709, 'AltaD Caps', 'Colecalciferol (vitamina D3)', '1000 UI', 'Cápsulas blandas', 'Eurofarma', 'II-70709/2024', 9.5, 'Venta Libre', true, 'Suplemento alimenticio de vitamina D3', 'Suplemento alimenticio de vitamina D3. Presentación: ALTAD CAPS 1000 UI: Caja con 30 cápsulas blandas.
ALTAD CAPS 15000 UI: Caja con 4 cápsulas blandas.
ALTAD CAPS 50000 UI: Caja con 4 cápsulas blandas.'),
(41694, 'Althea + Ferro', 'Etinilestradiol; Fumarato ferroso; Levonorgestrel', 'Estándar', 'Comprimidos', 'DKT Bolivia', 'II-71694/2024', 23.5, 'Bajo Receta Médica', false, 'Anticonceptivo oral', 'Anticonceptivo oral. Presentación: Caja con 21 comprimidos.'),
(35913, 'Altodor NF', 'Codeína; Paracetamol (acetaminofén)', 'Estándar', 'Tabletas', 'Droguería INTI', 'NN-65913/2023', 13.5, 'Venta Libre', true, 'Analgésico', 'Analgésico. Presentación: ALTODOR® NF, estuche x 10 tabletas.'),
(41602, 'Aluminio; Magnesio', 'Aluminio, hidróxido de; Magnesio, hidróxido de', '100 ml', 'Suspensión', 'Industrias Torrico Antelo (ITA)', 'II-71602/2022', 9.5, 'Venta Libre', true, 'Antiácido', 'Antiácido. Presentación: Caja con frasco PET con 120 ml.'),
(41002, 'Aluminio; Magnesio; Simeticona', 'Aluminio, hidróxido de; Magnesio, hidróxido de; Simeticona', '5 ml', 'Suspensión', 'Asmoh Laboratories', 'II-71002/2022', 11.5, 'Venta Libre', true, 'Antiácido y antiflatulento', 'Antiácido y antiflatulento. Presentación: Caja con frasco por 120 ml.
Caja con frasco por 200 ml.'),
(38198, 'Alysia', 'Clotrimazol; Metronidazol; Neomicina', 'Estándar', 'Óvulos vaginales', 'IFA Laboratorios', 'NN-68198/2023', 17.8, 'Bajo Receta Médica', false, 'Antimicótico y bactericida', 'Antimicótico y bactericida. Presentación: Caja con 10 óvulos vaginales.'),
(36358, 'Ambroxol', 'Ambroxol', '5 ml', 'Jarabe', 'Pacific Pharma Group', 'II-66358/2023', 18.5, 'Venta Libre', true, 'Mucolítico y expectorante', 'Mucolítico y expectorante. Presentación: Ambroxol Adulto: Caja con frasco por 100 ml.
Ambroxol Infantil: Caja con frasco por 100 ml.'),
(38425, 'Ambroxol', 'Ambroxol', '5 ml', 'Jarabe', 'Prodexa', 'II-68425/2020', 18.5, 'Venta Libre', true, 'Mucolítico y expectorante', 'Mucolítico y expectorante. Presentación: Caja con frasco por 60, 80, 100 o 120 ml sabor frutilla.'),
(39745, 'Ambroxol', 'Ambroxol', '15 mg', 'Jarabe', 'Opes Healthcare', 'II-69745/2020', 18.5, 'Venta Libre', true, 'Mucolítico y expectorante', 'Mucolítico y expectorante. Presentación: Ambroxol 15 mg: Caja con frasco por 100 ml.
Ambroxol 30 mg: Caja con frasco por 100 ml.'),
(41003, 'Ambroxol Clorhidrato', 'Ambroxol', '5 ml', 'Jarabe', 'Asmoh Laboratories', 'II-71003/2023', 18.5, 'Venta Libre', true, 'Mucolítico y expectorante', 'Mucolítico y expectorante. Presentación: Caja con frasco por 100 ml.'),
(38426, 'Ambroxol Forte', 'Ambroxol', '5 ml', 'Jarabe', 'Prodexa', 'II-68426/2021', 18.5, 'Venta Libre', true, 'Mucolítico y expectorante', 'Mucolítico y expectorante. Presentación: Caja con frasco por 100 ml sabor frutilla + dosificador.'),
(41004, 'Amfotericina B', 'Amfotericina B', '50 mg', 'Polvo para inyección', 'Asmoh Laboratories', 'II-71004/2024', 33.5, 'Bajo Receta Médica', false, 'Antifúngico', 'Antifúngico. Presentación: Caja con vial por 10 ml.'),
(38427, 'Amikacina', 'Amikacina', '500 mg', 'Solución inyectable', 'Prodexa', 'II-68427/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 25 ampollas por 2 ml cada una.'),
(41005, 'Amikacina', 'Amikacina', '2 ml', 'Solución inyectable', 'Asmoh Laboratories', 'II-71005/2020', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 10 viales por 2 ml.'),
(35679, 'Amikotic A', 'Econazol', '15 g', 'Crema', 'Farcos', 'II-65679/2024', 23.5, 'Bajo Receta Médica', false, 'Antimicótico de amplio espectro', 'Antimicótico de amplio espectro. Presentación: Tubo de 15 g.'),
(39924, 'Amikotic A', 'Econazol', '100 g', 'Polvo', 'Farcos', 'II-69924/2024', 23.5, 'Bajo Receta Médica', false, 'Antimicótico', 'Antimicótico. Presentación: Frasco con 200 g.'),
(39925, 'Amikotic A', 'Econazol', '100 ml', 'Solución dérmica', 'Farcos', 'II-69925/2020', 23.5, 'Bajo Receta Médica', false, 'Antimicótico', 'Antimicótico. Presentación: Caja con frasco por 30 ml.'),
(41476, 'Amilorida; Hidroclorotiazida', 'Amilorida; Hidroclorotiazida', 'Estándar', 'Tabletas', 'Asmoh Laboratories', 'II-71476/2021', 23.5, 'Bajo Receta Médica', false, 'Antihipertensivo y diurético', 'Antihipertensivo y diurético. Presentación: Caja con 30 tabletas.
Caja con 100 tabletas.'),
(41999, 'Amino Hepat', 'L-ornitina L-aspartato', '3 g', 'Granulado', 'Droguería INTI', 'NN-71999/2024', 23.5, 'Bajo Receta Médica', false, 'Hepatoprotector', 'Hepatoprotector. Presentación: Caja con 10 sobres por 4 g cada uno sabor pomelo.'),
(40843, 'Aminoácidos con Electrolitos', 'Aminoácidos', '100 ml', 'Solución inyectable', 'Farmedical', 'II-70843/2023', 17.5, 'Venta Libre', true, 'Aminoácidos', 'Aminoácidos. Presentación: Caja con frasco por 500 ml.'),
(36641, 'Aminoacidos Rivero 11.5%', 'Aminoácidos', '500 mL', 'Solución inyectable', 'P.L Rivero y Cia', 'II-66641/2021', 31.5, 'Bajo Receta Médica', false, 'Aminoácidos', 'Aminoácidos. Presentación: Caja con 1 ó 6 frascos ámpula por 500 mL.'),
(36640, 'Aminoacidos Rivero 8.5%', 'Aminoácidos', '500 mL', 'Solución inyectable', 'P.L Rivero y Cia', 'II-66640/2020', 31.5, 'Bajo Receta Médica', false, 'Aminoácidos', 'Aminoácidos. Presentación: Caja con 1 ó 6 frascos ámpula por 500 mL.'),
(38619, 'Aminocal', '-', '400 mg', 'Tabletas recubiertas', 'Alfa', 'II-68619/2024', 7.5, 'Venta Libre', true, 'Suplemento nutricional', 'Suplemento nutricional. Presentación: Caja por 30 tabletas.'),
(35346, 'Aminofilina', 'Aminofilina', '200 mg', 'Comprimidos recubiertos', 'Lafar', 'II-65346/2021', 23.5, 'Bajo Receta Médica', false, 'Antiasmático, broncodilatador', 'Antiasmático, broncodilatador. Presentación: Disponible únicamente para el mercado INSTITUCIONAL:
Caja con 1, 2, 10, 20, 30, 100, 150, 250, 500, 1000, 1500, 2000, 3000, 4000 ó 5000 comprimidos recubiertos.'),
(41477, 'Aminofilina', 'Aminofilina', '10 ml', 'Solución inyectable', 'Asmoh Laboratories', 'II-71477/2022', 23.5, 'Bajo Receta Médica', false, 'Antiasmático, broncodilatador', 'Antiasmático, broncodilatador. Presentación: Caja con vial por 10 ml.'),
(40331, 'Aminogal 10%', 'Aminoácidos', '500 ml', 'Solución inyectable', 'Laqfagal', 'II-70331/2021', 31.5, 'Bajo Receta Médica', false, 'Aminoácidos', 'Aminoácidos. Presentación: Caja con frasco por 500 ml.'),
(36403, 'Aminoven', 'Aminoácidos', '6,60 g', 'Solución inyectable', 'Fresenius Kabi', 'II-66403/2023', 31.5, 'Bajo Receta Médica', false, 'Vitamínico', 'Vitamínico. Presentación: Envases conteniendo 1 frasco de vidrio por 500 ml.'),
(36404, 'Aminoven Infant', 'Aminoácidos', '1000 ml', 'Solución inyectable', 'Fresenius Kabi', 'II-66404/2024', 31.5, 'Bajo Receta Médica', false, 'Vitamínico', 'Vitamínico. Presentación: Envases conteniendo 1 frasco de vidrio por 250 ml.'),
(36776, 'Amiodar', 'Amiodarona', '200 mg', 'Comprimidos', 'Vardhman Exports', 'II-66776/2021', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico ventricular', 'Antiarrítmico ventricular. Presentación: Caja por 10 comprimidos.'),
(36218, 'Amiodarona', 'Amiodarona', '200 mg', 'Tabletas', 'La Santé', 'II-66218/2023', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja por 10 tabletas.'),
(38428, 'Amiodarona', 'Amiodarona', '200 mg', 'Comprimidos', 'Prodexa', 'II-68428/2023', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja con 100 comprimidos.'),
(39213, 'Amiodarona', 'Amiodarona', '50 mg', 'Solución inyectable', 'Laqfagal', 'II-69213/2023', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja con ampolla por 3 ml.
Caja por 5 ampollas.'),
(40697, 'Amiodarona', 'Amiodarona', '200 mg', 'Comprimidos', 'Raíces', 'II-70697/2022', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja con 20 comprimidos.'),
(41006, 'Amiodarona', 'Amiodarona', '200 mg', 'Tabletas', 'Asmoh Laboratories', 'II-71006/2021', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja con 100 tabletas.'),
(41943, 'Amiodarona', 'Amiodarona', '200 mg', 'Tabletas', 'Pharmandina', 'II-71943/2023', 35.5, 'Bajo Receta Médica', false, 'Antiarrítmico', 'Antiarrítmico. Presentación: Caja con 100 tabletas.'),
(39214, 'Amitriptigal', 'Amitriptilina', '25 mg', 'Comprimidos recubiertos', 'Laqfagal', 'II-69214/2024', 23.5, 'Bajo Receta Médica', false, 'Ansiolítico y antidepresivo', 'Ansiolítico y antidepresivo. Presentación: Caja por 100 comprimidos recubiertos.'),
(37073, 'Amitriptilina', 'Amitriptilina', '25 mg', 'Comprimidos', 'IDA', 'II-67073/2023', 23.5, 'Bajo Receta Médica', false, 'Antidepresivo ansiolítico', 'Antidepresivo ansiolítico. Presentación: Frasco hospitalario por 1000 comprimidos.'),
(38315, 'Amitriptilina', 'Amitriptilina', '25 mg', 'Comprimidos recubiertos', 'Pacific Pharma Group', 'II-68315/2020', 23.5, 'Bajo Receta Médica', false, 'Antidepresivo y ansiolítico', 'Antidepresivo y ansiolítico. Presentación: Caja con 100 comprimidos recubiertos.'),
(36219, 'Amitriptilina Clorhidrato', 'Amitriptilina', '25 mg', 'Tabletas recubiertas', 'La Santé', 'II-66219/2024', 23.5, 'Bajo Receta Médica', false, 'Antidepresivo ansiolítico', 'Antidepresivo ansiolítico. Presentación: Caja por 30 tabletas.'),
(41007, 'Amloas', 'Amlodipino', '10 mg', 'Tabletas', 'Asmoh Laboratories', 'II-71007/2022', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo y antianginoso', 'Antihipertensivo y antianginoso. Presentación: Caja con 30 tabletas.
Caja con 100 tabletas.'),
(35727, 'Amlodip', 'Amlodipino', '10 mg', 'Tabletas', 'Unicure Remedies', 'II-65727/2022', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo, antianginoso', 'Antihipertensivo, antianginoso. Presentación: Caja por 100 tabletas de 10 mg.'),
(38429, 'Amlodipina', 'Amlodipino', '10 mg', 'Comprimidos', 'Prodexa', 'II-68429/2024', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo y antianginoso', 'Antihipertensivo y antianginoso. Presentación: Caja con 10, 20, 30, 50, 100 o 500 comprimidos.'),
(36220, 'Amlodipino', 'Amlodipino', '10 mg', 'Tabletas', 'La Santé', 'II-66220/2020', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo y antianginoso', 'Antihipertensivo y antianginoso. Presentación: Caja por 10 tabletas.'),
(40254, 'Amlodipino', 'Amlodipino', '5 mg', 'Tabletas', 'CAMSA Industria y Comercio', 'II-70254/2024', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo y antianginoso', 'Antihipertensivo y antianginoso. Presentación: Amlodipino 5 mg: Caja con 100 tabletas.
Amlodipino 10 mg: Caja con 100 tabletas.'),
(38948, 'Amlodipino 10 mg', 'Amlodipino', '10 mg', 'Comprimidos', 'Sanat Pharma', 'II-68948/2023', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo', 'Antihipertensivo. Presentación: Caja por 100 comprimidos.'),
(36137, 'Amlotens', 'Amlodipino', 'Estándar', 'Comprimidos', 'Quimfa Bolivia', 'II-66137/2022', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo y antianginoso', 'Antihipertensivo y antianginoso. Presentación: AMLOTENS® 5, envase conteniendo 30 comprimidos.
AMLOTENS® 10, envase conteniendo 30 comprimidos.'),
(39215, 'Amlovard', 'Amlodipino', '10 mg', 'Comprimidos', 'Vardhman Exports', 'II-69215/2020', 22.5, 'Bajo Receta Médica', false, 'Antihipertensivo, antianginoso', 'Antihipertensivo, antianginoso. Presentación: Caja por 10 comprimidos.'),
(40179, 'Amoxi Duo LC', 'Amoxicilina; Ácido clavulánico', '875 mg', 'Tabletas recubiertas', 'Antila Lifesciences', 'II-70179/2024', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 14 tabletas recubiertas.'),
(40711, 'Amoxi LC', 'Amoxicilina', '1000 mg', 'Tabletas recubiertas', 'Antila Lifesciences', 'II-70711/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 200 tabletas recubiertas.'),
(35347, 'Amoxicilina', 'Amoxicilina', '500 mg', 'Cápsulas', 'Lafar', 'II-65347/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Disponible únicamente para el mercado INSTITUCIONAL:
Caja con 10, 100, 500, 1000, 1500, 2000, 3000, 4000 ó 5000 cápsulas.'),
(35348, 'Amoxicilina', 'Amoxicilina', '1000 mg', 'Comprimidos', 'Lafar', 'II-65348/2023', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja por 500 comprimidos.'),
(35349, 'Amoxicilina', 'Amoxicilina', '5 ml', 'Polvo para suspensión', 'Lafar', 'II-65349/2024', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con frasco por 60 ml + cuchara dosificadora.'),
(35938, 'Amoxicilina', 'Amoxicilina', '500 mg', 'Cápsulas', 'Mhedical Pharma', 'II-65938/2023', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja por 500 cápsulas.'),
(36221, 'Amoxicilina', 'Amoxicilina', '250 mg', 'Polvo para suspensión', 'La Santé', 'II-66221/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Frasco por 100 ml.'),
(36222, 'Amoxicilina', 'Amoxicilina', '500 mg', 'Cápsulas', 'La Santé', 'II-66222/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja por 50 cápsulas.'),
(36271, 'Amoxicilina', 'Amoxicilina', '500 mg', 'Comprimidos', 'Cofar', 'NN-66271/2021', 14.8, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: Exhibidor por 320 comprimidos de 1 g.
Exhibidor por 500 comprimidos ranurados de 500 mg.'),
(36272, 'Amoxicilina', 'Amoxicilina', '5 ml', 'Polvo para suspensión', 'Cofar', 'NN-66272/2022', 14.8, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: Caja con frasco por 60 ml sabor cereza.'),
(36311, 'Amoxicilina', 'Amoxicilina', '500 mg', 'Cápsulas', 'SAE', 'II-66311/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 500 cápsulas.'),
(36312, 'Amoxicilina', 'Amoxicilina', '5 ml', 'Polvo para suspensión', 'Pacific Pharma Group', 'II-66312/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con frasco por 100 ml y jeringa dosificadora.'),
(36335, 'Amoxicilina', 'Amoxicilina', '1 g', 'Comprimidos recubiertos', 'Pacific Pharma Group', 'II-66335/2020', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 100 comprimidos.'),
(38430, 'Amoxicilina', 'Amoxicilina', '500 mg', 'Cápsulas', 'Prodexa', 'II-68430/2020', 30.5, 'Bajo Receta Médica', false, 'Antibiótico bactericida de amplio espectro', 'Antibiótico bactericida de amplio espectro. Presentación: Caja con 500 cápsulas.'),
(38431, 'Amoxicilina', 'Amoxicilina', '1 g', 'Comprimidos recubiertos', 'Prodexa', 'II-68431/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: Caja con 100 o 500 comprimidos recubiertos.'),
(38433, 'Amoxicilina', 'Amoxicilina', '250 mg', 'Polvo para suspensión', 'Prodexa', 'II-68433/2023', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Amoxiclina 250 mg:
Caja con frasco con polvo para reconstituir 60 ml sabor tutti frutti.
Caja con frasco con polvo para reconstituir 100 ml sabor tutti frutti.
Amoxiclina 500 mg:
Caja con frasco con polvo para reconstituir 60 ml sabor tutti frutti + vaso dosificador.
Caja con frasco con polvo para reconstituir 100 ml sabor tutti frutti + vaso dosificador.'),
(39542, 'Amoxicilina', 'Amoxicilina', '1 g', 'Tabletas', 'La Santé', 'II-69542/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja por 20 tabletas.'),
(40501, 'Amoxicilina', 'Amoxicilina', '1 g', 'Comprimidos', 'Kadila Pharmaceuticals', 'II-70501/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 500 comprimidos.'),
(40502, 'Amoxicilina', 'Amoxicilina', '5 ml', 'Suspensión oral', 'Kadila Pharmaceuticals', 'II-70502/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con frasco por 60 ml.'),
(40662, 'Amoxicilina', 'Amoxicilina', '1000 mg', 'Tabletas recubiertas', 'Centurion Healthcare', 'II-70662/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 100 tabletas recubiertas.'),
(41008, 'Amoxicilina', 'Amoxicilina', '250 mg', 'Polvo para suspensión oral', 'Asmoh Laboratories', 'II-71008/2023', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Amoxicilina 250 mg: Caja con frasco para 100 ml.
Amoxicilina 500 mg: Caja con frasco para 60 ml sabor fresa.'),
(41009, 'Amoxicilina', 'Amoxicilina', '1 g', 'Polvo para inyección', 'Asmoh Laboratories', 'II-71009/2024', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con vial por 10 ml.'),
(38949, 'Amoxicilina 1 g', 'Amoxicilina', '1 g', 'Comprimidos', 'Sanat Pharma', 'II-68949/2024', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja por 500 comprimidos.'),
(38950, 'Amoxicilina 500 mg', 'Amoxicilina', '500 mg', 'Cápsulas', 'Sanat Pharma', 'II-68950/2020', 30.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja por 500 cápsulas.'),
(35493, 'Amoxicilina Ifarbo', 'Amoxicilina', '5 ml', 'Suspensión', 'Ifarbo', 'NN-65493/2023', 14.8, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Amoxicilina IFARBO 250 mg: Caja con frasco por 60 ml sabor cereza.
Amoxicilina IFARBO 500 mg: Caja con frasco por 60 ml sabor cereza.'),
(35492, 'Amoxicilina Ifarbo 500 mg', 'Amoxicilina', '500 mg', 'Cápsulas', 'Ifarbo', 'NN-65492/2022', 14.8, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 500 cápsulas.'),
(37824, 'Amoxicilina; Ácido Clavulánico', 'Amoxicilina; Ácido clavulánico', '875 mg', 'Comprimidos recubiertos ranurados', 'Cofar', 'NN-67824/2024', 17.8, 'Bajo Receta Médica', false, 'Antibiótico bactericida de amplio espectro', 'Antibiótico bactericida de amplio espectro. Presentación: Caja con 10 comprimidos ranurados recubiertos.'),
(38434, 'Amoxicilina; Acido Clavulánico', 'Amoxicilina; Ácido clavulánico', '5 ml', 'Polvo para suspensión', 'Prodexa', 'II-68434/2024', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con frasco con polvo para reconstituir 60 o 100 ml sabor fresa + vaso dosificador.'),
(40255, 'Amoxicilina; Ácido Clavulánico', 'Amoxicilina; Ácido clavulánico', 'Estándar', 'Tabletas recubiertas', 'CAMSA Industria y Comercio', 'II-70255/2020', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 14 tabletas recubiertas.'),
(39746, 'Amoxicilina; Clavulanato', 'Amoxicilina; Ácido clavulánico', 'Estándar', 'Tabletas recubiertas', 'Opes Healthcare', 'II-69746/2021', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Amoxicilina; Clavulanato de Potasio 625: Caja por 10 tabletas recubiertas.
Amoxicilina; Clavulanato de Potasio 1000: Caja por 7 tabletas recubiertas.'),
(41816, 'Amoxiclavs LC', 'Amoxicilina; Ácido clavulánico', '5 ml', 'Polvo para suspensión', 'Prahem', 'II-71816/2021', 33.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con frasco por 100 ml sabor frutilla.'),
(36001, 'Amoxicris', 'Amoxicilina', '5 ml', 'Suspensión', 'Hahnemann', 'II-66001/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: Caja con frasco por 60 ml.'),
(39136, 'Amoxicris', 'Amoxicilina', '1 g', 'Solución inyectable', 'Hahnemann', 'II-69136/2021', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 25 viales con 5 ml cada uno.'),
(36002, 'Amoxicris Duo', 'Amoxicilina; Ácido clavulánico', '500 mg', 'Comprimidos recubiertos', 'Hahnemann', 'II-66002/2022', 33.5, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: Caja con 14 comprimidos recubiertos.'),
(36003, 'Amoxicris Duo', 'Amoxicilina; Ácido clavulánico', '5 ml', 'Suspensión', 'Hahnemann', 'II-66003/2023', 33.5, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: AMOXICRIS DUO 250:
Caja con frasco por 70 ml.
Caja con frasco por 100 ml.
AMOXICRIS DUO 500:
Caja con frasco por 70 ml.
Caja con frasco por 100 ml.'),
(39137, 'Amoxicris Duo', 'Amoxicilina; Sulbactam', 'Estándar', 'Polvo para inyección', 'Hahnemann', 'II-69137/2022', 25.5, 'Bajo Receta Médica', false, 'Antibiótico beta-lactámico', 'Antibiótico beta-lactámico. Presentación: Caja con 25 frascos viales.'),
(38861, 'Amoxidal Plus', 'Amoxicilina; Ácido clavulánico', '5 ml', 'Suspensión', 'Megalabs', 'II-68861/2021', 33.5, 'Bajo Receta Médica', false, 'Antibiótico beta-lactámico de amplio espectro', 'Antibiótico beta-lactámico de amplio espectro. Presentación: Caja con frasco por 100 ml.'),
(38862, 'Amoxidal Plus', 'Amoxicilina; Ácido clavulánico', '875 mg', 'Comprimidos recubiertos', 'Megalabs', 'II-68862/2022', 33.5, 'Bajo Receta Médica', false, 'Antibiótico beta-lactámico de amplio espectro', 'Antibiótico beta-lactámico de amplio espectro. Presentación: Caja por 20 comprimidos recubiertos.'),
(35112, 'Amoxidin Orange 250', 'Amoxicilina', '5 ml', 'Suspensión oral', 'Farmedical', 'II-65112/2022', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con frasco por 100 ml sabor naranja.'),
(35113, 'Amoxidin Orange 500', 'Amoxicilina', '5 ml', 'Suspensión oral', 'Farmedical', 'II-65113/2023', 30.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con frasco por 100 ml sabor naranja.'),
(35114, 'Amoxidin Plus', 'Amoxicilina; Ácido clavulánico', '500 mg', 'Comprimidos recubiertos', 'Farmedical', 'II-65114/2024', 33.5, 'Bajo Receta Médica', false, 'Antibiótico betalactámico', 'Antibiótico betalactámico. Presentación: Caja con 14 comprimidos recubiertos.'),
(37670, 'Amoxidin Plus', 'Amoxicilina; Ácido clavulánico', '5 ml', 'Suspensión', 'Farmedical', 'II-67670/2020', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con frasco por 100 ml.'),
(37792, 'Amoxidin Plus Forte', 'Amoxicilina; Ácido clavulánico', 'Estándar', 'Comprimidos recubiertos', 'Farmedical', 'II-67792/2022', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 14 comprimidos recubiertos ranurados.'),
(37687, 'Amoxidin Plus Forte', 'Difluprednato', '0,5 mg', 'Emulsión oftálmica', 'Poen', 'II-67687/2022', 32, 'Bajo Receta Médica', false, 'Antiinflamatorio corticosteroide', 'Antiinflamatorio corticosteroide. Presentación: Caja con frasco gotero por 5 ml.'),
(41772, 'Amoxim Duo G', 'Amoxicilina; Ácido clavulánico', 'Estándar', 'Tabletas', 'Galenmarsfarma', 'II-71772/2022', 33.5, 'Bajo Receta Médica', false, 'Antibiótico de amplio espectro', 'Antibiótico de amplio espectro. Presentación: Caja con 10 tabletas.'),
(35729, 'Ampicilina', 'Ampicilina', '577,5 mg', 'Cápsulas', 'Mhedical Pharma', 'II-65729/2024', 31.5, 'Bajo Receta Médica', false, 'Antibiótico bactericida', 'Antibiótico bactericida. Presentación: Caja por 500 cápsulas.'),
(36846, 'Ampicilina', 'Ampicilina', '1 g', 'Polvo para solución inyectable', 'Laqfagal', 'II-66846/2021', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja por 50 viales.'),
(37076, 'Ampicilina', 'Ampicilina', '1 g', 'Solución inyectable', 'IDA', 'II-67076/2021', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja por 50 viales.'),
(37438, 'Ampicilina', 'Ampicilina', '1000 mg', 'Polvo para inyección', 'Prodexa', 'II-67438/2023', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 25 o 50 viales.'),
(38437, 'Ampicilina', 'Ampicilina', '500 mg', 'Cápsulas', 'Prodexa', 'II-68437/2022', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 500 cápsulas.'),
(40446, 'Ampicilina', 'Ampicilina', '1 g', 'Polvo para solución inyectable', 'FarmaShopping', 'II-70446/2021', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 10 viales.'),
(41010, 'Ampicilina', 'Ampicilina', '1 g', 'Polvo para inyección', 'Asmoh Laboratories', 'II-71010/2020', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con vial por 10 ml.'),
(38951, 'Ampicilina 500 mg', 'Ampicilina', '500 mg', 'Cápsulas', 'Sanat Pharma', 'II-68951/2021', 31.5, 'Bajo Receta Médica', false, 'Antibiótico bactericida de amplio espectro', 'Antibiótico bactericida de amplio espectro. Presentación: Caja por 500 cápsulas.'),
(39138, 'Ampicris', 'Ampicilina', '1 g', 'Polvo para solución inyectable', 'Hahnemann', 'II-69138/2023', 31.5, 'Bajo Receta Médica', false, 'Antibiótico', 'Antibiótico. Presentación: Caja con 25 viales.'),
(40823, 'Amplibiotic', 'Cefixima', '5 ml', 'Polvo para suspensión', 'Droguería INTI', 'NN-70823/2023', 32.5, 'Bajo Receta Médica', false, 'Antibiótico cefalosporínico de amplio espectro', 'Antibiótico cefalosporínico de amplio espectro. Presentación: Caja con frasco por 90 ml y jeringa dosificadora.'),
(40824, 'Amplibiotic', 'Cefixima', '400 mg', 'Cápsulas', 'Droguería INTI', 'NN-70824/2024', 32.5, 'Bajo Receta Médica', false, 'Antibiótico cefalosporínico de amplio espectro', 'Antibiótico cefalosporínico de amplio espectro. Presentación: Caja con 8 cápsulas.'),
(36933, 'Anaflex Mujer', 'Cafeína; Diclofenaco sódico; Paracetamol (acetaminofén)', 'Estándar', 'Comprimidos recubiertos', 'Bagó', 'NN-66933/2023', 11, 'Venta Libre', true, 'Analgésico y antiinflamatorio', 'Analgésico y antiinflamatorio. Presentación: Dispenser conteniendo 200 comprimidos recubiertos.
Caja con 30 comprimidos recubiertos.'),
(41293, 'Analgovan', 'Lidocaína', '700 mg', 'Parches', 'Megalabs', 'II-71293/2023', 33.5, 'Bajo Receta Médica', false, 'Anestésico tópico', 'Anestésico tópico. Presentación: Caja con 5 parches de hidrogel de 10 x 14 cm² y 5 láminas adhesivas.'),
(38750, 'Analizador Corporal Seca mBCA 514', '-', 'Estándar', 'Equipo médico y hospitalario', 'HP Medical', 'II-68750/2020', 21.5, 'Bajo Receta Médica', false, 'Analizadores de signos vitales', 'Analizadores de signos vitales. Presentación: Un analizador.'),
(38749, 'Analizador de Signos Vitales Seca mVSA 535', '-', 'Estándar', 'Equipo médico y hospitalario', 'HP Medical', 'II-68749/2024', 21.5, 'Bajo Receta Médica', false, 'Analizadores de signos vitales', 'Analizadores de signos vitales. Presentación: Un analizador.'),
(37062, 'Anamax NF', 'Cafeína; Ibuprofeno; Paracetamol (acetaminofén)', 'Estándar', 'Cápsulas blandas', 'Pacific Pharma Group', 'II-67062/2022', 14, 'Venta Libre', true, 'Analgésico y antiinflamatorio', 'Analgésico y antiinflamatorio. Presentación: Caja por 100 cápsulas blandas.'),
(38066, 'Anastrozol', 'Anastrozol', '1 mg', 'Comprimidos', 'Eurofarma', 'II-68066/2021', 25.5, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: Caja con 30 comprimidos.'),
(39717, 'Anastrozol', 'Anastrozol', '1 mg', 'Tabletas recubiertas', 'AC Farma', 'II-69717/2022', 25.5, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: Caja por 100 tabletas recubiertas.'),
(40536, 'Anastrozol', 'Anastrozol', '1 mg', 'Comprimidos recubiertos', 'Microsules', 'II-70536/2021', 25.5, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: Caja con 28 comprimidos recubiertos.'),
(35252, 'Anastrozol Varifarma', 'Anastrozol', '1 mg', 'Comprimidos recubiertos', 'Varifarma', 'NN-65252/2022', 9.8, 'Bajo Receta Médica', false, 'Antineoplásico', 'Antineoplásico. Presentación: Disponible únicamente para el mercado INSTITUCIONAL:
Caja con 28 comprimidos.'),
(41648, 'Androamid', 'Tadalafil', '5 mg', 'Comprimidos recubiertos', 'SAE', 'II-71648/2023', 34.5, 'Bajo Receta Médica', false, 'Tratamiento de la disfunción eréctil', 'Tratamiento de la disfunción eréctil. Presentación: Caja con 30 comprimidos recubiertos.'),
(36714, 'Anestears', 'Proximetacaína', '5,00 mg', 'Solución oftálmica', 'Lansier', 'II-66714/2024', 24.5, 'Bajo Receta Médica', false, 'Anestésico oftálmico', 'Anestésico oftálmico. Presentación: Caja con frasco gotero x 5 mL, 10 mL y 15 mL.'),
(38935, 'Anfotericina B', 'Amfotericina B', '0,0500 g', 'Solución inyectable', 'Richet', 'II-68935/2020', 33.5, 'Bajo Receta Médica', false, 'Antifúngico', 'Antifúngico. Presentación: Caja con frasco ampolla.'),
(41695, 'Angelin', 'Ciproterona; Etinilestradiol', 'Estándar', 'Comprimidos recubiertos', 'DKT Bolivia', 'II-71695/2020', 30.5, 'Bajo Receta Médica', false, 'Antiandrogénica y progestágena', 'Antiandrogénica y progestágena. Presentación: Caja con 21 comprimidos recubiertos.'),
(41551, 'Anidu', 'Anidulafungina', '100 mg', 'Polvo para solución inyectable', 'Farmedical', 'II-71551/2021', 27.5, 'Bajo Receta Médica', false, 'Antifúngico', 'Antifúngico. Presentación: Caja con 1 vial.'),
(40941, 'Ansiben', 'Escitalopram', '10 mg', 'Tabletas recubiertas', 'Luminova', 'II-70941/2021', 28.5, 'Bajo Receta Médica', false, 'Antidepresivo', 'Antidepresivo. Presentación: ANSIBEN® 10 mg: Caja con 30 tabletas recubiertas.
ANSIBEN® 20 mg: Caja con 30 tabletas recubiertas.'),
(42147, 'Ansietil', 'Ketazolam', '30 mg', 'Cápsulas', 'Tecnofarma', 'II-72147/2022', 27.5, 'Bajo Receta Médica', false, 'Ansiolítico sedante', 'Ansiolítico sedante. Presentación: Caja con 60 cápsulas duras.'),
(36138, 'Ansiodex', 'Citalopram', '20 mg', 'Comprimidos recubiertos', 'Quimfa Bolivia', 'II-66138/2023', 22.5, 'Bajo Receta Médica', false, 'Antidepresivo', 'Antidepresivo. Presentación: ANSIODEX® envase conteniendo 30 comprimidos recubiertos.'),
(39819, 'Ansiodex E', 'Escitalopram', '10 mg', 'Comprimidos recubiertos', 'Quimfa Bolivia', 'II-69819/2024', 28.5, 'Bajo Receta Médica', false, 'Antidepresivo', 'Antidepresivo. Presentación: ANSIODEX E 10: Caja por 30 comprimidos recubiertos.
ANSIODEX E 20: Caja por 30 comprimidos recubiertos.'),
(41642, 'Ansiofanol', 'Fluvoxamina', '50 mg', 'Comprimidos recubiertos', 'SAE', 'II-71642/2022', 28.5, 'Bajo Receta Médica', false, 'Antidepresivo', 'Antidepresivo. Presentación: ANSIOFANOL® 50 mg: Caja con 30 comprimidos recubiertos.
ANSIOFANOL® 100 mg: Caja con 30 comprimidos recubiertos.
ANSIOFANOL® 150 mg: Caja con 30 comprimidos recubiertos.'),
(40009, 'Ansioplan ODT', 'Clotiazepam', '5 mg', 'Comprimidos dispersables', 'Abbott', 'II-70009/2024', 26.5, 'Bajo Receta Médica', false, 'Ansiolítico', 'Ansiolítico. Presentación: Caja con 30 comprimidos dispersables.'),
(42077, 'Antibina', 'Terbinafina', '250 mg', 'Tabletas recubiertas', 'CAMSA Industria y Comercio', 'II-72077/2022', 34.5, 'Bajo Receta Médica', false, 'Antimicótico de amplio espectro', 'Antimicótico de amplio espectro. Presentación: Caja con 14 tabletas recubiertas.'),
(41436, 'Antidol', 'Paracetamol (acetaminofén)', '1 g', 'Comprimidos recubiertos', 'Breskot Pharma', 'II-71436/2021', 14.5, 'Venta Libre', true, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja con 30 comprimidos recubiertos.'),
(35288, 'Antiflat', 'Aluminio, hidróxido de; Magnesio, hidróxido de', '5 ml', 'Suspensión', 'Lafar', 'II-65288/2023', 9.5, 'Venta Libre', true, 'Antiácido', 'Antiácido. Presentación: Disponible únicamente para el mercado INSTITUCIONAL:
Caja con frasco pediatra por 120 ml sabor menta.'),
(35289, 'Antiflat Plus', 'Aluminio, hidróxido de; Magnesio, hidróxido de; Simeticona', '5 ml', 'Suspensión', 'Lafar', 'II-65289/2024', 11.5, 'Venta Libre', true, 'Antiácido y antiflatulento', 'Antiácido y antiflatulento. Presentación: Caja con frasco por 200 ml sabor menta.'),
(39630, 'Antiflat Plus', 'Aluminio, hidróxido de; Magnesio, hidróxido de; Simeticona', 'Estándar', 'Comprimidos masticables', 'Lafar', 'II-69630/2020', 11.5, 'Venta Libre', true, 'Antiácido y antiflatulento', 'Antiácido y antiflatulento. Presentación: ANTIFLAT PLUS Fresa: Caja por 100 comprimidos masticables.
ANTIFLAT PLUS Menta: Caja por 100 comprimidos masticables.'),
(37724, 'Antiflu Des', 'Amantadina; Clorfenamina; Paracetamol (acetaminofén)', 'Estándar', 'Cápsulas', 'Chinoin', 'II-67724/2024', 18.5, 'Venta Libre', true, 'Antigripal, analgésico y antipirético', 'Antigripal, analgésico y antipirético. Presentación: Caja con 100 cápsulas.'),
(37726, 'Antiflu Des Jr', 'Amantadina; Clorfenamina; Paracetamol (acetaminofén)', '100 mL', 'Jarabe', 'Chinoin', 'II-67726/2021', 18.5, 'Venta Libre', true, 'Antigripal, analgésico y antipirético', 'Antigripal, analgésico y antipirético. Presentación: Frasco con 60 mL y vasito dosificador.'),
(37725, 'Antiflu Des Pediátrico', 'Amantadina; Clorfenamina; Paracetamol (acetaminofén)', '100 mL', 'Solución pediátrica', 'Chinoin', 'II-67725/2020', 18.5, 'Venta Libre', true, 'Antigripal, analgésico y antipirético', 'Antigripal, analgésico y antipirético. Presentación: Caja con frasco gotero por 30 mL.'),
(35116, 'Antigrel', 'Clopidogrel', '75 mg', 'Comprimidos recubiertos', 'Farmedical', 'II-65116/2021', 21.5, 'Bajo Receta Médica', false, 'Antiagregante plaquetario', 'Antiagregante plaquetario. Presentación: Caja con 30 comprimidos recubiertos ranurados.'),
(38438, 'Antigripal', 'Clorfenamina; Paracetamol (acetaminofén); Pseudoefedrina', '20 ml', 'Gotas', 'Prodexa', 'II-68438/2023', 16.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja con frasco gotero por 20 ml sabor piña.'),
(39112, 'Antigripal', 'Clorfenamina; Paracetamol (acetaminofén); Pseudoefedrina', 'Estándar', 'Comprimidos recubiertos', 'Prodexa', 'II-69112/2022', 16.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja con 100 o 500 comprimidos recubiertos.'),
(41928, 'Antigripal Compuesto Día', 'Loratadina; Paracetamol (acetaminofén); Pseudoefedrina...', '3.3 g', 'Granulado', 'Droguería INTI', 'NN-71928/2023', 21.5, 'Venta Libre', true, 'Analgésico, antipirético, antihistamínico y descongestionante', 'Analgésico, antipirético, antihistamínico y descongestionante. Presentación: Caja con 60 sobres por 3.3 g cada uno sabor naranja.'),
(41929, 'Antigripal Compuesto Noche', 'Clorfeniramina; Paracetamol (acetaminofén); Pseudoefedrina...', '3.3 g', 'Granulado', 'Droguería INTI', 'NN-71929/2024', 13.5, 'Venta Libre', true, 'Analgésico, antihistamínico y descongestivo', 'Analgésico, antihistamínico y descongestivo. Presentación: Caja con 60 sobres por 3.3 g cada uno sabor limón.'),
(36460, 'Antigripal Lch D/N', 'Clorfenamina; Paracetamol (acetaminofén); Pseudoefedrina', 'Estándar', 'Comprimidos recubiertos', 'LCH Laboratorio Chile', 'II-66460/2020', 16.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja por 100 comprimidos.'),
(41552, 'Antigripal MP', 'Clorfenamina; Dextrometorfano; Fenilefrina...', 'Estándar', 'Cápsulas', 'Opes Healthcare', 'II-71552/2022', 7.5, 'Venta Libre', true, 'Antigripal', 'Antigripal. Presentación: Caja con 10 cápsulas de gelatina dura.'),
(39181, 'Antimetil', 'Jengibre', '50 mg', 'Comprimidos recubiertos', 'Megalabs', 'II-69181/2021', 32.5, 'Bajo Receta Médica', false, 'Antinauseoso, antiemético', 'Antinauseoso, antiemético. Presentación: Caja por 30 comprimidos recubiertos.'),
(41564, 'Antisol NF con color', '-', '60 g', 'Crema', 'NeoFármaco', 'II-71564/2024', 7.5, 'Venta Libre', true, 'Protector solar', 'Protector solar. Presentación: Caja con tubo por 60 g.'),
(41565, 'Antisol NF sin color', '-', '60 g', 'Crema', 'NeoFármaco', 'II-71565/2020', 7.5, 'Venta Libre', true, 'Protector solar', 'Protector solar. Presentación: Caja con tubo por 60 g.'),
(39655, 'Antitoxina Tetánica BIOL', 'Tétanos, vacuna contra', '3.000 UI', 'Solución inyectable', 'BIOL', 'II-69655/2020', 30.5, 'Bajo Receta Médica', false, 'Vacuna para la inmunización activa contra el tétanos', 'Vacuna para la inmunización activa contra el tétanos. Presentación: Antitoxina Tetánica BIOL 3.000 UI: Caja con vial.
Antitoxina Tetánica BIOL 5.000 UI: Caja con vial.'),
(39638, 'Antrofi', 'Promestrieno', '10,0 mg', 'Crema vaginal', 'Eurofarma', 'II-69638/2023', 33.5, 'Bajo Receta Médica', false, 'Estrógeno de aplicación vaginal', 'Estrógeno de aplicación vaginal. Presentación: Caja con pomo por 15 g y 10 aplicadores.'),
(38200, 'Aparkin', 'Carbidopa; Levodopa', 'Estándar', 'Comprimidos recubiertos', 'IFA Laboratorios', 'NN-68200/2020', 8.8, 'Bajo Receta Médica', false, 'Tratamiento de la enfermedad de Parkinson', 'Tratamiento de la enfermedad de Parkinson. Presentación: Caja con 30 comprimidos recubiertos.'),
(41560, 'ApetiCAL', 'Calcio, carbonato de; Colecalciferol (vitamina D3); Zinc, óxido de', '5 ml', 'Suspensión', 'NeoFármaco', 'II-71560/2020', 12.5, 'Venta Libre', true, 'Suplemento alimenticio', 'Suplemento alimenticio. Presentación: Caja con frasco por 200 ml sabor naranja.'),
(38587, 'Apetitol', 'Minerales; Vitaminas', '2.0 mg', 'Gotas pediátricas', 'NeoFármaco', 'II-68587/2022', 16.5, 'Venta Libre', true, 'Suplemento vitamínico', 'Suplemento vitamínico. Presentación: Caja con frasco gotero por 20 ml.'),
(40412, 'Apetitol', 'Minerales; Vitaminas', '5 ml', 'Jarabe', 'NeoFármaco', 'II-70412/2022', 16.5, 'Venta Libre', true, 'Suplemento multivitamínico', 'Suplemento multivitamínico. Presentación: Caja con frasco por 120 ml.'),
(40413, 'Apetitol Plus', 'Minerales; Vitaminas', '5 ml', 'Jarabe', 'NeoFármaco', 'II-70413/2023', 16.5, 'Venta Libre', true, 'Suplemento multivitamínico', 'Suplemento multivitamínico. Presentación: Caja con frasco por 120 ml.'),
(41561, 'Apetitol Zinc', 'Vitaminas; Zinc (Zn)', '5 g', 'Jalea', 'NeoFármaco', 'II-71561/2021', 15.5, 'Venta Libre', true, 'Suplemento multivitamínico', 'Suplemento multivitamínico. Presentación: Caja con tubo por 100 g sabor naranja.'),
(35777, 'Apiron', 'Metamizol sódico', '500 mg', 'Solución', 'Indufar', 'II-65777/2022', 32.5, 'Bajo Receta Médica', false, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja por un frasco gotero de 10 ml.'),
(35778, 'Apiron', 'Metamizol sódico', '2 mL', 'Solución inyectable', 'Indufar', 'II-65778/2023', 32.5, 'Bajo Receta Médica', false, 'Analgésico y antipirético', 'Analgésico y antipirético. Presentación: Caja conteniendo 5 ampollas por 2 mL de solución inyectable.'),
(41335, 'Apitena', 'Apixabán', '2.5 mg', 'Comprimidos recubiertos', 'Tecnofarma', 'II-71335/2020', 23.5, 'Bajo Receta Médica', false, 'Anticoagulante', 'Anticoagulante. Presentación: APITENA® 2.5: Caja con 60 comprimidos recubiertos.
APITENA® 5: Caja con 60 comprimidos recubiertos.'),
(41310, 'Apix', 'Apixabán', '2.5 mg', 'Comprimidos recubiertos', 'Lafar', 'II-71310/2020', 23.5, 'Bajo Receta Médica', false, 'Anticoagulante', 'Anticoagulante. Presentación: APIX® 2.5: Caja con 30 comprimidos recubiertos.
APIX® 5: Caja con 30 comprimidos recubiertos.'),
(36359, 'Aquablan', 'Alcohol polivinílico; Nafazolina', '0,1%', 'Solución oftálmica', 'Pacific Pharma Group', 'II-66359/2024', 7.5, 'Venta Libre', true, 'Vasoconstrictor', 'Vasoconstrictor. Presentación: Envase conteniendo 10 ml de solución oftálmico estéril.'),
(41437, 'Aquatears SP', 'Condroitín; Sodio, hialuronato de', '10 ml', 'Solución oftálmica estéril', 'Vidiline', 'II-71437/2022', 32.5, 'Bajo Receta Médica', false, 'Lubricante ocular', 'Lubricante ocular. Presentación: Caja con frasco oftálmico por 10 ml.'),
(38333, 'Aquatop', '-', '250 g', 'Crema', 'Medihealth', 'II-68333/2023', 21.5, 'Bajo Receta Médica', false, 'Hidratante de la piel', 'Hidratante de la piel. Presentación: Caja con tubo por 250 g.'),
(40211, 'Aquatop', '-', '400 ml', 'Loción', 'Medihealth', 'II-70211/2021', 21.5, 'Bajo Receta Médica', false, 'Limpiador de la piel', 'Limpiador de la piel. Presentación: Frasco por 400 ml.'),
(41714, 'Aquatop Rescue', '-', '100 g', 'Crema', 'Medihealth', 'II-71714/2024', 21.5, 'Bajo Receta Médica', false, 'Tratamiento de la dermatitis atópica', 'Tratamiento de la dermatitis atópica. Presentación: Caja con tubo por 100 g.'),
(38933, 'Aquol Fresh', 'Nafazolina', '0.125 mg', 'Solución oftálmica', 'Roster', 'II-68933/2023', 14.5, 'Venta Libre', true, 'Vasoconstrictor', 'Vasoconstrictor. Presentación: Caja con frasco por 15 ml.')
ON CONFLICT (id) DO UPDATE SET
nombre_comercial = EXCLUDED.nombre_comercial, precio_referencial_bs = EXCLUDED.precio_referencial_bs, condicion_venta = EXCLUDED.condicion_venta;

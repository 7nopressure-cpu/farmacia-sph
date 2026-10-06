export interface Medicamento {
  id: number;
  nombre_comercial: string; // Col B
  dci_principio_activo: string; // Col C
  accion_terapeutica?: string; // Col D
  categoria_clasificacion?: string; // Col E
  subgrupo_justificacion?: string; // Col F
  forma_farmaceutica: string; // Col G
  laboratorio: string; // Col H
  distribuido_por?: string; // Col I
  formula?: string; // Col J
  presentaciones?: string; // Col K
  direccion_laboratorio?: string; // Col L

  // Compatibilidad
  concentracion: string;
  registro_sanitario: string;
  precio_referencial_bs: number;
  condicion_venta: string;
  es_venta_libre: boolean;
  grupo_terapeutico: string;
  indicaciones_principales: string;
  imagen_url?: string;
}

export interface CentroSalud {
  id: string;
  nombre: string;
  ciudad: string;
  zona: string;
  direccion: string;
  telefono_urgencias: string;
  telefono_consultas: string;
  nivel_atencion: string;
  especialidades: string[];
  horario_atencion: string;
  tipo_institucion: string;
  latitud?: number;
  longitud?: number;
  destacado?: boolean;
}

export type TriageLevel = 'VERDE' | 'AMARILLO' | 'ROJO';

export interface OtcSuggestion {
  dci: string;
  posologia_preventiva: string;
  advertencia: string;
  nombre_referencial_bo?: string;
}

export interface TriajeResponse {
  nivel: TriageLevel;
  titulo: string;
  resumen_clinico: string;
  medidas_no_farmacologicas: string[];
  medicamentos_otc_sugeridos: OtcSuggestion[];
  especialidad_recomendada?: string;
  hospitales_derivacion_sugeridos?: string[];
  signos_alarma: string[];
  advertencia_legal: string;
}

export interface PrescriptionAnalysisResponse {
  dci?: string;
  concentracion?: string;
  nombre_leido?: string;
  legible: boolean;
  orientacion?: string;
  medicamentos_relacionados?: Medicamento[];
}

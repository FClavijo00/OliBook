export interface WorksCalendar {
    id: number;
    name: string;
    description: string;
    date: string;
}

export interface WorkTypes {
    id: number;
    nombre: string;
    descripcion: string;
    user_id: number;
}

export interface WorkDone {
    id: number;
    user_id: number;
    empresa_id?: number | null;
    parcela_id: number;
    tipo_trabajo_id: number;
    fecha_trabajo: string;
    observaciones: string;
    trabajadores?: number[];
}

export interface TrabajosCalendario {
    id: number;
    observaciones: string;
    fecha_trabajo: string;
    tipo_trabajo_id: number;
    parcela_id: number;
    nombre_trabajo: string;
    descripcion_trabajo: string;
    nombre_parcela: string;
    apodo_parcela: string;
    origen?: string;
}
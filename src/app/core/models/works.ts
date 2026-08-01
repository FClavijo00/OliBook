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
    plot_id: number;
    work_type: number;
    date: string;
    description: string;
}
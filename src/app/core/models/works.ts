export interface WorksCalendar {
    id: number;
    name: string;
    description: string;
    date: string;
}

export interface WorkTypes {
    id: number;
    name: string;
}

export interface WorkDone {
    id: number;
    plot_id: number;
    work_type: number;
    date: string;
    description: string;
}
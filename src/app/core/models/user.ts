export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    image_url: string;
    rol: string;
    nombre_empresa: string;
    codigo_empresa: string;
    empresa_id?: number;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  nombre_empresa?: string;
  codigo_empresa?: string;
}
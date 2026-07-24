export interface User {
    id: number;
    nombre: string;
    email: string;
    password: string;
    image_url: string;
    rol: string;
    nombre_empresa: string;
    codigo_empresa: string;
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
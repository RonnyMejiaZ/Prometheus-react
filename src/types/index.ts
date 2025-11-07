// Tipos para la API de Prometheus

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Entidades
export interface Property {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  rentado: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inquilino {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  documento?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Alquiler {
  id: number;
  nombre: string;
  propiedadId: number;
  inquilinoId: number;
  fechaInicio: string;
  fechaFin: string;
  meses: number;
  montoMensual: number;
  personas: number;
  activo: boolean;
  contrato?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pago {
  id: number;
  alquilerId: number;
  fechaPago: string;
  montoMensual: number;
  pagoRenta: boolean;
  pagoAgua: boolean;
  pagoEnergia: boolean;
  pagoGas: boolean;
}

export interface PerfilData {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  rol: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formularios
export interface PropertyFormData {
  nombre: string;
  direccion: string;
  descripcion: string;
  rentado: boolean;
}

export interface InquilinoFormData {
  nombre: string;
  email: string;
  telefono: string;
  documento?: string;
}

export interface AlquilerFormData {
  nombre: string;
  propiedadId: number;
  inquilinoId: number;
  fechaInicio: string;
  fechaFin: string;
  meses: number;
  montoMensual: number;
  personas: number;
  activo: boolean;
  contrato?: File | null;
}

export interface PagoFormData {
  alquilerId: number;
  monto: number;
  fechaPago: string;
  metodoPago: string;
  estado: string;
}

export interface PerfilFormData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  rol: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  userId: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
}
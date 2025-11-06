import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PagedResult, Property, Inquilino, Alquiler, Pago, PerfilData, LoginRequest, RegisterRequest, AuthResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/prometheus_web_war_exploded/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Interceptor para manejar respuestas
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log para debugging
        if (response.config.url?.includes('/login')) {
          console.log('Login interceptor response:', response.data);
        }
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  // Propiedades
  async getProperties(page = 0, size = 10, search = ''): Promise<ApiResponse<PagedResult<Property>>> {
    const response = await this.api.get(`/propiedades?page=${page}&size=${size}&q=${search}`);
    return response.data;
  }

  async getProperty(id: number): Promise<ApiResponse<Property>> {
    const response = await this.api.get(`/propiedades/${id}`);
    return response.data;
  }

  async createProperty(property: Omit<Property, 'id'>): Promise<ApiResponse<Property>> {
    const response = await this.api.post('/propiedades', property);
    return response.data;
  }

  async updateProperty(id: number, property: Omit<Property, 'id'>): Promise<ApiResponse<Property>> {
    const response = await this.api.put(`/propiedades/${id}`, property);
    return response.data;
  }

  async deleteProperty(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/propiedades/${id}`);
    return response.data;
  }

  // Inquilinos
  async getInquilinos(page = 0, size = 10, search = ''): Promise<ApiResponse<PagedResult<Inquilino>>> {
    const response = await this.api.get(`/inquilinos?page=${page}&size=${size}&q=${search}`);
    return response.data;
  }

  async getInquilino(id: number): Promise<ApiResponse<Inquilino>> {
    const response = await this.api.get(`/inquilinos/${id}`);
    return response.data;
  }

  async createInquilino(inquilino: Omit<Inquilino, 'id'>): Promise<ApiResponse<Inquilino>> {
    const response = await this.api.post('/inquilinos', inquilino);
    return response.data;
  }

  async updateInquilino(id: number, inquilino: Omit<Inquilino, 'id'>): Promise<ApiResponse<Inquilino>> {
    const response = await this.api.put(`/inquilinos/${id}`, inquilino);
    return response.data;
  }

  async deleteInquilino(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/inquilinos/${id}`);
    return response.data;
  }

  // Alquileres
  async getAlquileres(page = 0, size = 10, search = ''): Promise<ApiResponse<PagedResult<Alquiler>>> {
    const response = await this.api.get(`/alquileres?page=${page}&size=${size}&q=${search}`);
    return response.data;
  }

  async getAlquiler(id: number): Promise<ApiResponse<Alquiler>> {
    const response = await this.api.get(`/alquileres/${id}`);
    return response.data;
  }

  async createAlquiler(alquiler: Omit<Alquiler, 'id'>): Promise<ApiResponse<Alquiler>> {
    const response = await this.api.post('/alquileres', alquiler);
    return response.data;
  }

  async updateAlquiler(id: number, alquiler: Omit<Alquiler, 'id'>): Promise<ApiResponse<Alquiler>> {
    const response = await this.api.put(`/alquileres/${id}`, alquiler);
    return response.data;
  }

  async deleteAlquiler(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/alquileres/${id}`);
    return response.data;
  }

  // Pagos
  async getPagos(page = 0, size = 10, search = ''): Promise<ApiResponse<PagedResult<Pago>>> {
    const response = await this.api.get(`/pagos?page=${page}&size=${size}&q=${search}`);
    return response.data;
  }

  async getPago(id: number): Promise<ApiResponse<Pago>> {
    const response = await this.api.get(`/pagos/${id}`);
    return response.data;
  }

  async createPago(pago: Omit<Pago, 'id'>): Promise<ApiResponse<Pago>> {
    const response = await this.api.post('/pagos', pago);
    return response.data;
  }

  async updatePago(id: number, pago: Omit<Pago, 'id'>): Promise<ApiResponse<Pago>> {
    const response = await this.api.put(`/pagos/${id}`, pago);
    return response.data;
  }

  async deletePago(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/pagos/${id}`);
    return response.data;
  }

  // Perfil
  async getPerfil(page = 0, size = 10, search = ''): Promise<ApiResponse<PagedResult<PerfilData>>> {
    const response = await this.api.get(`/perfil?page=${page}&size=${size}&q=${search}`);
    return response.data;
  }

  async getPerfilById(id: number): Promise<ApiResponse<PerfilData>> {
    const response = await this.api.get(`/perfil/${id}`);
    return response.data;
  }

  async createPerfil(perfil: Omit<PerfilData, 'id'>): Promise<ApiResponse<PerfilData>> {
    const response = await this.api.post('/perfil', perfil);
    return response.data;
  }

  async updatePerfil(id: number, perfil: Omit<PerfilData, 'id'>): Promise<ApiResponse<PerfilData>> {
    const response = await this.api.put(`/perfil/${id}`, perfil);
    return response.data;
  }

  async deletePerfil(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/perfil/${id}`);
    return response.data;
  }

  // Datos de prueba
  async createTestData(): Promise<ApiResponse<void>> {
    const response = await this.api.post('/test-data');
    return response.data;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    // Solo enviamos email y password al backend, no remember
    const loginPayload = {
      email: credentials.email.trim(),
      password: credentials.password
    };
    
    console.log('Sending login request:', { email: loginPayload.email, password: '***' });
    
    try {
      const response = await this.api.post('/login', loginPayload, {
        withCredentials: true
      });
      
      console.log('Login API response:', response);
      console.log('Login API response data:', response.data);
      
      // Verificar que la respuesta tenga la estructura correcta
      if (response.data) {
        if (response.data.success && response.data.data) {
          const userData = response.data.data;
          console.log('User data received:', userData);
          localStorage.setItem('user', JSON.stringify(userData));
          if (credentials.remember) {
            localStorage.setItem('remember', 'true');
          }
          return response.data;
        } else {
          // Si success es false, retornar la respuesta para que el componente maneje el error
          console.warn('Login failed:', response.data.message || response.data.error);
          return response.data;
        }
      }
      
      // Si no hay data, retornar error
      return {
        success: false,
        message: 'Respuesta inválida del servidor',
        error: 'Invalid server response'
      };
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Si el error tiene una respuesta del servidor, extraer el mensaje
      if (error.response?.data) {
        // Retornar la respuesta del servidor como ApiResponse
        return {
          success: false,
          message: error.response.data.message || error.response.data.error || 'Error al iniciar sesión',
          error: error.response.data.error || error.response.data.message
        };
      }
      
      // Si no hay respuesta del servidor, lanzar el error
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/register', userData, {
      withCredentials: true
    });
    if (response.data.success && response.data.data) {
      const userData = response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/logout', {}, { withCredentials: true });
    } catch (error) {
      // Si el endpoint no existe, no es crítico, continuamos con la limpieza local
      console.warn('Logout endpoint may not exist, continuing with local cleanup:', error);
    } finally {
      // Siempre limpiamos el localStorage independientemente del resultado del servidor
      localStorage.removeItem('user');
      localStorage.removeItem('remember');
    }
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const apiService = new ApiService();
export default apiService;

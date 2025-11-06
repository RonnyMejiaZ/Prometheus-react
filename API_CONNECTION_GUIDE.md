# Guía de Conexión con la API

## 📡 Arquitectura de Conexión

### 1. **Cliente HTTP Centralizado (Axios)**

**Ubicación:** `src/services/api.ts`

La aplicación usa **Axios** como cliente HTTP, configurado como una instancia singleton:

```typescript
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/prometheus_web_war_exploded/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,  // ← CRÍTICO: Envía cookies de sesión
    });
  }
}
```

**Configuración:**
- **baseURL**: URL base del servidor backend
- **timeout**: 10 segundos para evitar esperas infinitas
- **withCredentials: true**: Permite que el navegador envíe cookies automáticamente (necesario para sesiones)

---

### 2. **Interceptores de Axios**

**Propósito:** Interceptar todas las respuestas y errores antes de llegar a los componentes.

```typescript
// Interceptor de respuesta
this.api.interceptors.response.use(
  (response) => {
    // Log para debugging (especialmente login)
    if (response.config.url?.includes('/login')) {
      console.log('Login interceptor response:', response.data);
    }
    return response;  // Pasa la respuesta sin modificar
  },
  (error) => {
    // Manejo global de errores
    console.error('API Error:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);  // Propaga el error
  }
);
```

**Beneficios:**
- Logging centralizado para debugging
- Manejo consistente de errores
- No necesitas manejar errores en cada componente

---

### 3. **Sistema de Autenticación Híbrido**

#### 🔐 **Doble Mecanismo:**

**A) Backend (Sesión HTTP):**
- Usa **cookies de sesión** gestionadas por el servidor Java
- Las cookies se envían automáticamente con cada request gracias a `withCredentials: true`
- El servidor valida la sesión en cada petición

**B) Frontend (localStorage):**
- Guarda datos del usuario (`userId`, `name`, `email`) en `localStorage`
- Se usa para verificación rápida de autenticación sin consultar el servidor
- NO es la fuente de verdad (solo para UI)

#### 📋 **Flujo de Autenticación:**

```
1. Usuario hace login
   ↓
2. Frontend envía: POST /login { email, password }
   ↓
3. Backend valida credenciales
   ↓
4. Backend crea sesión y envía cookie HTTP
   ↓
5. Backend retorna: { success: true, data: { userId, name, email } }
   ↓
6. Frontend guarda datos en localStorage
   ↓
7. Componente verifica: apiService.isAuthenticated()
   (revisa localStorage, NO consulta servidor)
```

**Código de Login:**
```typescript
async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const loginPayload = {
    email: credentials.email.trim(),
    password: credentials.password
  };
  
  // Envía con withCredentials para cookies
  const response = await this.api.post('/login', loginPayload, {
    withCredentials: true
  });
  
  // Si éxito, guarda en localStorage
  if (response.data.success && response.data.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data;
}
```

---

### 4. **Métodos CRUD**

Cada recurso (Propiedades, Inquilinos, Alquileres, Pagos, Perfil) tiene métodos estándar:

```typescript
// GET - Listar con paginación
async getProperties(page = 0, size = 10, search = ''): Promise<ApiResponse<PagedResult<Property>>> {
  const response = await this.api.get(`/propiedades?page=${page}&size=${size}&q=${search}`);
  return response.data;
}

// GET - Obtener uno
async getProperty(id: number): Promise<ApiResponse<Property>> {
  const response = await this.api.get(`/propiedades/${id}`);
  return response.data;
}

// POST - Crear
async createProperty(property: Omit<Property, 'id'>): Promise<ApiResponse<Property>> {
  const response = await this.api.post('/propiedades', property);
  return response.data;
}

// PUT - Actualizar
async updateProperty(id: number, property: Omit<Property, 'id'>): Promise<ApiResponse<Property>> {
  const response = await this.api.put(`/propiedades/${id}`, property);
  return response.data;
}

// DELETE - Eliminar
async deleteProperty(id: number): Promise<ApiResponse<void>> {
  const response = await this.api.delete(`/propiedades/${id}`);
  return response.data;
}
```

---

### 5. **Uso en Componentes**

**Ejemplo: Login.tsx**

```typescript
import { apiService } from '../services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Llama al método del servicio
    const response = await apiService.login(formData);
    
    // Verifica la respuesta
    if (response && response.success && response.data) {
      navigate('/dashboard');  // Redirige si éxito
    } else {
      setError(response?.message || 'Error al iniciar sesión');
    }
  } catch (err) {
    // Maneja errores de red o servidor
    setError(err.response?.data?.message || 'Error de conexión');
  }
};
```

**Ejemplo: Dashboard.tsx**

```typescript
const loadStats = async () => {
  try {
    // Hace múltiples llamadas en paralelo
    const [alquileresRes, pagosRes] = await Promise.all([
      apiService.getAlquileres(0, 1000, ''),
      apiService.getPagos(0, 1000, '')
    ]);
    
    // Procesa los datos
    const alquileres = alquileresRes.data?.items || [];
    const pagos = pagosRes.data?.items || [];
    
    // Calcula estadísticas...
  } catch (err) {
    setError('Error al cargar las estadísticas');
  }
};
```

---

### 6. **Estructura de Respuestas**

Todas las respuestas siguen este formato:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Para listas paginadas:
interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
```

**Ejemplos:**

```typescript
// Respuesta exitosa
{
  success: true,
  data: { id: 1, nombre: "Casa 1", ... }
}

// Respuesta de lista
{
  success: true,
  data: {
    items: [{ id: 1, ... }, { id: 2, ... }],
    total: 100,
    page: 0,
    size: 10
  }
}

// Respuesta de error
{
  success: false,
  message: "Usuario no encontrado",
  error: "USER_NOT_FOUND"
}
```

---

### 7. **Manejo de Errores**

**Niveles de manejo:**

1. **Interceptor global** (api.ts): Logs y propagación
2. **Métodos del servicio** (api.ts): Transformación de errores
3. **Componentes** (Login.tsx, etc.): Mensajes al usuario

**Ejemplo completo:**

```typescript
// En api.ts
async login(credentials: LoginRequest) {
  try {
    const response = await this.api.post('/login', credentials);
    return response.data;
  } catch (error: any) {
    // Extrae mensaje del servidor
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Error al iniciar sesión'
      };
    }
    throw error;  // Si no hay respuesta, lanza error
  }
}

// En Login.tsx
try {
  const response = await apiService.login(formData);
  if (!response.success) {
    setError(response.message);  // Muestra al usuario
  }
} catch (err) {
  setError('Error de conexión');  // Error de red
}
```

---

### 8. **Rutas Protegidas**

**App.tsx** usa `ProtectedRoute` para verificar autenticación:

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = apiService.isAuthenticated();  // ← Revisa localStorage
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

**⚠️ IMPORTANTE:** `isAuthenticated()` solo verifica `localStorage`, NO valida con el servidor. Si la sesión expira en el backend, el frontend seguirá pensando que el usuario está autenticado hasta que intente hacer una petición.

---

## 🔍 Flujo Completo de una Petición

```
1. Componente llama: apiService.getProperties(0, 10, '')
   ↓
2. ApiService construye URL: GET /propiedades?page=0&size=10&q=
   ↓
3. Axios añade:
   - baseURL: http://localhost:8080/prometheus_web_war_exploded/api
   - Headers: Content-Type: application/json
   - Cookies: (automático con withCredentials)
   ↓
4. Request HTTP: GET http://localhost:8080/.../api/propiedades?page=0&size=10&q=
   ↓
5. Backend procesa:
   - Valida sesión (cookie)
   - Consulta base de datos
   - Retorna datos
   ↓
6. Interceptor recibe respuesta
   - Logs si es necesario
   - Pasa respuesta al método
   ↓
7. Método extrae: response.data
   ↓
8. Retorna al componente: ApiResponse<PagedResult<Property>>
   ↓
9. Componente procesa datos y actualiza UI
```

---

## ⚠️ Puntos Importantes

### ✅ **Lo que funciona bien:**
- Centralización de configuración HTTP
- Manejo consistente de errores
- Cookies automáticas con `withCredentials`
- Tipado TypeScript para seguridad

### ⚠️ **Áreas de mejora:**
- `isAuthenticated()` solo verifica localStorage (no valida con servidor)
- No hay refresh automático de tokens/sesión
- Muchos `console.log` en producción (deberían removerse)
- No hay manejo de timeouts personalizado por endpoint

---

## 📝 Resumen

**¿Cómo se conecta la app con la API?**

1. **Axios** como cliente HTTP centralizado en `ApiService`
2. **URL base** configurada: `http://localhost:8080/prometheus_web_war_exploded/api`
3. **Cookies automáticas** con `withCredentials: true` para sesiones
4. **localStorage** para datos de usuario (solo UI, no fuente de verdad)
5. **Métodos CRUD** estándar para cada recurso
6. **Interceptores** para logging y manejo de errores global
7. **Tipado TypeScript** para seguridad de tipos

**¿Cómo se autentica?**
- Backend: Cookies de sesión HTTP (automáticas)
- Frontend: Datos en localStorage (verificación rápida)
- Cada petición incluye cookies automáticamente


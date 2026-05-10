const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.MODE === "production"
    ? "https://ifx-brack-end-prueba.onrender.com"
    : "http://localhost:4000")

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorPayload = payload as { error?: string; message?: string; details?: string }
    throw new Error(errorPayload.error ?? errorPayload.message ?? errorPayload.details ?? `Error ${response.status}`)
  }

  return payload as T
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  total: number
}

export type VmRole = 'Administrador' | 'Cliente'
export type VmStatus = 'Encendida' | 'Apagada' | 'Suspendida'

export interface VmUser {
  id: string
  nombre: string
  email: string
  role: VmRole
  status?: string
  createdAt?: string
}

export interface VmRegisterPayload {
  nombre: string
  email: string
  password: string
  phone?: string
  role?: VmRole
  adminKey?: string
}

export interface VmLoginPayload {
  email: string
  password: string
}

export interface VmSmsPayload {
  phone: string
}

export interface VmSmsVerifyPayload {
  phone: string
  code: string
}

export interface VmSmsVerifyResponse {
  success: boolean
  data?: VmUser
  message?: string
  error?: string
}

export interface VmRecord {
  id: string
  name: string
  cores: number
  ram: number
  disk: number
  os: string
  status: VmStatus
  createdBy?: string | null
  updatedBy?: string | null
  createdAt?: string
  updatedAt?: string
  statusUpdatedAt?: string
}

export interface VmSummaryStatus {
  totalCores: number
  totalRam: number
  totalDisk: number
  total: number
}

export interface VmSummary {
  active: VmSummaryStatus
  byStatus: Partial<Record<VmStatus, VmSummaryStatus>>
}

export interface VmCreatePayload {
  name: string
  cores: number | string
  ram: number | string
  disk: number | string
  os: string
  status: VmStatus
}

export interface VmUpdatePayload {
  name?: string
  cores?: number | string
  ram?: number | string
  disk?: number | string
  os?: string
  status?: VmStatus
}

export const authApi = {
  login: (payload: VmLoginPayload) =>
    apiFetch<ApiResponse<VmUser>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: VmRegisterPayload) =>
    apiFetch<ApiResponse<VmUser>>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sendSmsCode: (payload: VmSmsPayload) =>
    apiFetch<ApiResponse<null>>('/api/auth/sms/send-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifySmsCode: (payload: VmSmsVerifyPayload) =>
    apiFetch<VmSmsVerifyResponse>('/api/auth/sms/verify-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => apiFetch<ApiResponse<VmUser>>('/api/auth/me'),
  logout: () => apiFetch<ApiResponse<null>>('/api/auth/logout', { method: 'POST' }),
}

export const vmApi = {
  list: () => apiFetch<ListResponse<VmRecord>>('/api/vms'),
  summary: () => apiFetch<ApiResponse<VmSummary>>('/api/vms/summary'),
  create: (payload: VmCreatePayload) =>
    apiFetch<ApiResponse<VmRecord>>('/api/vms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: VmUpdatePayload) =>
    apiFetch<ApiResponse<VmRecord>>(`/api/vms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<ApiResponse<VmRecord>>(`/api/vms/${id}`, { method: 'DELETE' }),
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  total: number
  payment_method: string
  discount_code?: string | null
  createdAt: string
  items: Array<{ report_id: string; title: string; price: number }>
}

export interface OrderDetail extends Order {
  nombre: string
  apellido: string
  email: string
  empresa?: string | null
  subtotal: number
  discount: number
  tax: number
}

export const ordersApi = {
  /** Lista todas las órdenes del usuario autenticado. */
  list: () =>
    apiFetch<ListResponse<Order>>('/api/portal/orders'),

  /** Detalle de una orden por ID. Solo accesible por el propietario. */
  getById: (id: string) =>
    apiFetch<ApiResponse<OrderDetail>>(`/api/portal/orders/${id}`),
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

export interface Subscription {
  id: string
  report_id: string
  order_id: string
  status: 'active' | 'cancelled' | 'expired'
  price_monthly: number
  renews_at: string
  createdAt: string
  report: {
    title: string
    category: string
    icon: string
  }
}

export const subscriptionsApi = {
  /** Lista las suscripciones del usuario autenticado. */
  list: () =>
    apiFetch<ListResponse<Subscription>>('/api/portal/subscriptions'),

  /** Cancela una suscripción activa. */
  cancel: (id: string) =>
    apiFetch<ApiResponse<null>>(`/api/portal/subscriptions/${id}/cancel`, {
      method: 'PATCH',
    }),
}

// ─── LANDING FORMS (reutilizados del backend existente) ───────────────────────

export interface JoinFormPayload {
  formType: 'usuario' | 'marca' | 'operador'
  nombre: string
  email: string
  whatsapp: string
  pais: string
  ciudad: string
  empresa?: string
  cargo?: string
  industria?: string
  comentarios?: string
}

export interface WaitlistPayload {
  name: string
  email: string
  country?: string
}

export const formsApi = {
  /**
   * Envía el formulario "Quiero ser parte" (usuario / marca / operador).
   * Corresponde al formulario del landing de la app Bivi.
   */
  join: (data: JoinFormPayload) =>
    apiFetch<ApiResponse<{ id: string; formType: string }>>('/api/forms/join', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Suscribe un email a la waitlist del portal.
   */
  waitlist: (data: WaitlistPayload) =>
    apiFetch<ApiResponse<{ id: string; formType: string }>>('/api/forms/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

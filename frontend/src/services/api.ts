import axios, { AxiosError } from 'axios';
import type {
  User, Department, Appointment, AssistanceRequest, Feedback,
  FAQ, EmpathyCheckIn, Notification, AnalyticsData,
} from '@/types';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(err);
  }
);

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) return data.detail.map((d: { msg: string }) => d.msg).join(', ');
  }
  return 'An unexpected error occurred';
}

// Auth
export const authApi = {
  register: (data: object) => api.post<User>('/auth/register', data).then(r => r.data),
  login: (data: object) => api.post<User>('/auth/login', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  me: () => api.get<User>('/auth/me').then(r => r.data),
};

// Profile
export const profileApi = {
  get: () => api.get<User>('/profile').then(r => r.data),
  update: (data: object) => api.patch<User>('/profile', data).then(r => r.data),
};

// Departments
export const departmentsApi = {
  list: (search?: string) =>
    api.get<Department[]>('/departments', { params: { search } }).then(r => r.data),
  get: (id: number) => api.get<Department>(`/departments/${id}`).then(r => r.data),
  create: (data: object) => api.post<Department>('/departments', data).then(r => r.data),
  update: (id: number, data: object) => api.patch<Department>(`/departments/${id}`, data).then(r => r.data),
};

// Appointments
export const appointmentsApi = {
  list: () => api.get<Appointment[]>('/appointments').then(r => r.data),
  get: (id: number) => api.get<Appointment>(`/appointments/${id}`).then(r => r.data),
  create: (data: object) => api.post<Appointment>('/appointments', data).then(r => r.data),
  update: (id: number, data: object) => api.patch<Appointment>(`/appointments/${id}`, data).then(r => r.data),
  cancel: (id: number) => api.delete(`/appointments/${id}`).then(r => r.data),
};

// Assistance Requests
export const assistanceApi = {
  list: (params?: { status_filter?: string; category_filter?: string; page?: number; page_size?: number }) =>
    api.get<AssistanceRequest[]>('/assistance-requests', { params }).then(r => r.data),
  get: (id: number) => api.get<AssistanceRequest>(`/assistance-requests/${id}`).then(r => r.data),
  create: (data: object) => api.post<{ id: number; reference_code: string; status: string }>('/assistance-requests', data).then(r => r.data),
  updateStatus: (id: number, data: { status: string; note?: string }) =>
    api.patch(`/assistance-requests/${id}/status`, data).then(r => r.data),
  addResponse: (id: number, data: { message: string; is_internal_note: boolean }) =>
    api.post(`/assistance-requests/${id}/responses`, data).then(r => r.data),
  assign: (id: number, staff_id: number) =>
    api.post(`/assistance-requests/${id}/assign`, { staff_id }).then(r => r.data),
};

// Feedback
export const feedbackApi = {
  submit: (data: object) => api.post<Feedback>('/feedback', data).then(r => r.data),
  mine: () => api.get<Feedback[]>('/feedback/mine').then(r => r.data),
  staffList: () => api.get<Feedback[]>('/staff/feedback').then(r => r.data),
};

// Empathy
export const empathyApi = {
  submit: (data: object) => api.post<EmpathyCheckIn>('/empathy-checkins', data).then(r => r.data),
  mine: () => api.get<EmpathyCheckIn[]>('/empathy-checkins/mine').then(r => r.data),
};

// FAQs
export const faqsApi = {
  list: (category?: string) =>
    api.get<FAQ[]>('/faqs', { params: { category } }).then(r => r.data),
  create: (data: object) => api.post<FAQ>('/faqs', data).then(r => r.data),
  update: (id: number, data: object) => api.patch<FAQ>(`/faqs/${id}`, data).then(r => r.data),
};

// FAQ Assistant
export const assistantApi = {
  message: (message: string, language = 'en') =>
    api.post<{ answer: string; source: string; related_faqs: number[] }>('/assistant/message', { message, language })
      .then(r => r.data),
};

// Analytics
export const analyticsApi = {
  get: (days?: number) =>
    api.get<AnalyticsData>('/staff/analytics', { params: { days } }).then(r => r.data),
};

// Notifications
export const notificationsApi = {
  list: (unread_only = false) =>
    api.get<Notification[]>('/notifications', { params: { unread_only } }).then(r => r.data),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.patch('/notifications/mark-all-read').then(r => r.data),
};

// Staff APIs
export const staffApi = {
  members: () => api.get<{ id: number; name: string; role: string }[]>('/staff/members').then(r => r.data),
};

// Admin APIs
export const adminApi = {
  listStaff: () => api.get<object[]>('/admin/staff').then(r => r.data),
  createStaff: (data: object) => api.post('/admin/staff', data).then(r => r.data),
  updateStaff: (id: number, data: object) => api.patch(`/admin/staff/${id}`, data).then(r => r.data),
  auditEvents: (page = 1) => api.get('/admin/audit-events', { params: { page } }).then(r => r.data),
  health: () => api.get('/admin/health').then(r => r.data),
};

export { extractError };
export default api;

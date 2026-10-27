import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

declare global {
  // Set by each route case so the mocked auth context can exercise role layouts.
  // eslint-disable-next-line no-var
  var __caresyncTestRole: 'patient' | 'staff' | 'admin' | null;
  var __caresyncRegister: ReturnType<typeof vi.fn> | undefined;
}

vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => {
    const role = globalThis.__caresyncTestRole;
    const user = role ? {
      id: 1,
      name: 'CareSync Test User',
      email: 'caresync.test@example.com',
      role,
      preferred_language: 'en',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    } : null;
    return {
      user,
      isLoading: false,
      isAuthenticated: Boolean(user),
      language: 'en',
      setLanguage: vi.fn(),
      t: (key: string) => key,
      login: vi.fn(),
      register: globalThis.__caresyncRegister ?? vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    };
  },
}));

vi.mock('@/services/api', () => {
  const user = {
    id: 1, name: 'CareSync Test User', email: 'caresync.test@example.com',
    role: globalThis.__caresyncTestRole ?? 'patient', preferred_language: 'en',
    is_active: true, created_at: '2026-01-01T00:00:00Z',
  };
  const department = {
    id: 1, name: 'General Services', description: 'Test department',
    location: 'Ground Floor', building: 'Main', floor: 'Ground',
    opening_hours: 'Weekdays', contact_information: '', directions: '',
    accessibility_info: '', is_active: true, is_demo: true,
  };
  const request = {
    id: 1, reference_code: 'CS-ABC123', patient_id: 1,
    category: 'hospital_navigation', description: 'Test assistance request description.',
    preferred_language: 'en', department_id: 1, contact_preference: 'in_app',
    accessibility_needs: '', priority: 'normal', status: 'submitted',
    assigned_staff_id: null, is_demo: true, created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z', resolved_at: null, responses: [],
  };
  const faq = {
    id: 1, question_en: 'Where is the help desk?', answer_en: 'At the main entrance.',
    question_ta: null, answer_ta: null, category: 'general', is_published: true,
    updated_at: '2026-01-01T00:00:00Z',
  };
  const analytics = {
    total_requests: 0, open_requests: 0, resolved_requests: 0, closed_requests: 0,
    by_status: {}, by_category: {},
    feedback: { count: 0, avg_overall: null, avg_communication: null, avg_information: null, avg_assistance: null },
    weekly_trend: [],
  };
  const empty = async () => [];
  const ok = async () => ({ message: 'ok' });
  const extractError = () => 'Test error';
  return {
    authApi: { me: async () => user, login: async () => user, register: async () => user, logout: ok },
    profileApi: { get: async () => user, update: async () => user },
    departmentsApi: { list: async () => [department], get: async () => department, create: async () => department, update: async () => department },
    appointmentsApi: { list: empty, get: async () => ({ id: 1, patient_id: 1, department_id: 1, title: 'Test appointment', appointment_date: '2030-01-01T10:00:00Z', status: 'scheduled', notes: '', questions: '[]', is_demo: true }), create: ok, update: ok, cancel: ok },
    assistanceApi: { list: async () => [request], get: async () => request, create: async () => ({ id: 1, reference_code: 'CS-ABC123', status: 'submitted' }), updateStatus: ok, addResponse: ok, assign: ok },
    feedbackApi: { submit: ok, mine: empty, staffList: empty },
    empathyApi: { submit: ok, mine: empty },
    faqsApi: { list: async () => [faq], create: async () => faq, update: async () => faq },
    assistantApi: { message: async () => ({ answer: 'At the main entrance.', source: 'faq', related_faqs: [1] }) },
    analyticsApi: { get: async () => analytics },
    notificationsApi: { list: empty, markRead: ok, markAllRead: ok },
    staffApi: { members: async () => [{ id: 2, name: 'Test Staff', role: 'staff' }] },
    adminApi: { listStaff: async () => [], createStaff: ok, updateStaff: ok, auditEvents: empty, health: async () => ({ status: 'ok' }) },
    extractError,
    default: {},
  };
});

afterEach(() => {
  cleanup();
  globalThis.__caresyncTestRole = null;
  globalThis.__caresyncRegister = undefined;
});

const screens = [
  { path: '/', role: null, name: 'landing page' },
  { path: '/login', role: null, name: 'login page' },
  { path: '/register', role: null, name: 'registration page' },
  { path: '/hospital-directory', role: null, name: 'hospital directory' },
  { path: '/faqs', role: null, name: 'FAQ route' },
  { path: '/faq-assistant', role: null, name: 'FAQ assistant route' },
  { path: '/dashboard', role: 'patient', name: 'patient dashboard' },
  { path: '/visit-planner', role: 'patient', name: 'visit planner' },
  { path: '/request-assistance', role: 'patient', name: 'request assistance' },
  { path: '/my-requests', role: 'patient', name: 'patient requests list' },
  { path: '/my-requests/1', role: 'patient', name: 'patient request detail' },
  { path: '/feedback', role: 'patient', name: 'feedback and check-in' },
  { path: '/profile', role: 'patient', name: 'profile' },
  { path: '/notifications', role: 'patient', name: 'notifications' },
  { path: '/staff/dashboard', role: 'staff', name: 'staff dashboard' },
  { path: '/staff/requests', role: 'staff', name: 'staff requests list' },
  { path: '/staff/requests/1', role: 'staff', name: 'staff request detail' },
  { path: '/staff/analytics', role: 'staff', name: 'staff analytics' },
  { path: '/admin/dashboard', role: 'admin', name: 'admin dashboard' },
  { path: '/admin/staff', role: 'admin', name: 'staff administration' },
  { path: '/admin/departments', role: 'admin', name: 'department administration' },
  { path: '/admin/faqs', role: 'admin', name: 'FAQ administration' },
  { path: '/admin/audit', role: 'admin', name: 'audit log' },
  { path: '/404', role: null, name: 'not found page' },
  { path: '/unmatched-route', role: null, name: 'unknown route fallback' },
] as const;

describe('CareSync screen render smoke tests', () => {
  it.each(screens)('renders the $name at $path', async ({ path, role }) => {
    globalThis.__caresyncTestRole = role;
    render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

    await waitFor(() => {
      expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(20);
    });
    expect(document.body.textContent).not.toContain('Something went wrong');
  });
});
it('submits registration only after the consent checkbox is checked', async () => {
  const user = userEvent.setup();
  globalThis.__caresyncTestRole = null;
  globalThis.__caresyncRegister = vi.fn().mockResolvedValue(undefined);
  render(<MemoryRouter initialEntries={['/register']}><App /></MemoryRouter>);

  await user.type(document.querySelector('input[name="name"]') as HTMLInputElement, 'CareSync Test Patient');
  await user.type(document.querySelector('input[name="email"]') as HTMLInputElement, 'patient.ui@example.com');
  await user.type(document.querySelector('input[name="password"]') as HTMLInputElement, 'CareSyncTest123');
  await user.type(document.querySelector('input[name="password_confirm"]') as HTMLInputElement, 'CareSyncTest123');
  await user.click(document.querySelector('form button[type="submit"]') as HTMLButtonElement);
  expect(globalThis.__caresyncRegister).not.toHaveBeenCalled();
  await user.click(screen.getByRole('checkbox'));
  await user.click(document.querySelector('form button[type="submit"]') as HTMLButtonElement);

  await waitFor(() => expect(globalThis.__caresyncRegister).toHaveBeenCalledWith(expect.objectContaining({
    email: 'patient.ui@example.com',
    consent: true,
  })));
});

// CareSync TypeScript Types

export type Role = 'patient' | 'staff' | 'admin';
export type Language = 'en' | 'ta';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  preferred_language: Language;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
  building?: string;
  floor?: string;
  opening_hours?: string;
  contact_information?: string;
  directions?: string;
  accessibility_info?: string;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'demo';

export interface Appointment {
  id: number;
  patient_id: number;
  department_id?: number;
  title: string;
  appointment_date: string;
  status: AppointmentStatus;
  notes?: string;
  questions?: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export type RequestCategory =
  | 'hospital_navigation'
  | 'language_assistance'
  | 'understanding_procedures'
  | 'wheelchair_mobility_assistance'
  | 'appointment_related_support'
  | 'communication_assistance'
  | 'general_patient_service'
  | 'other_non_emergency';

export type RequestStatus =
  | 'submitted'
  | 'acknowledged'
  | 'in_progress'
  | 'awaiting_patient'
  | 'resolved'
  | 'closed';

export type RequestPriority = 'normal' | 'high';

export interface AssistanceResponse {
  id: number;
  request_id: number;
  author_id: number;
  author_name: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

export interface AssistanceRequest {
  id: number;
  reference_code: string;
  patient_id: number;
  category: RequestCategory;
  description: string;
  preferred_language: Language;
  department_id?: number;
  contact_preference?: string;
  accessibility_needs?: string;
  priority: RequestPriority;
  status: RequestStatus;
  assigned_staff_id?: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  responses: AssistanceResponse[];
}

export interface Feedback {
  id: number;
  patient_id: number;
  communication_rating: number;
  information_rating: number;
  assistance_rating: number;
  overall_rating: number;
  category?: string;
  comments?: string;
  preferred_language: Language;
  is_demo: boolean;
  created_at: string;
}

export interface FAQ {
  id: number;
  question_en: string;
  answer_en: string;
  question_ta?: string;
  answer_ta?: string;
  category?: string;
  is_published: boolean;
  updated_at: string;
}

export interface EmpathyCheckIn {
  id: number;
  patient_id: number;
  selected_feeling: string;
  optional_comment?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  related_entity_type?: string;
  related_entity_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  total_requests: number;
  open_requests: number;
  resolved_requests: number;
  closed_requests: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  feedback: {
    count: number;
    avg_overall?: number;
    avg_communication?: number;
    avg_information?: number;
    avg_assistance?: number;
  };
  weekly_trend: { week: string; count: number }[];
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

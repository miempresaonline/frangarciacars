export * from './database';
export * from './checklist';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'reviewer' | 'client';
  profile?: {
    full_name: string;
    phone?: string;
    location?: string;
    assigned_admin_id?: string;
  };
}

export interface ReviewWithRelations {
  id: string;
  status: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_km?: number;
  vehicle_vin?: string;
  started_at?: string;
  completed_at?: string;
  sent_to_client_at?: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
  };
  assigned_admin?: {
    id: string;
    full_name: string;
  };
}

export interface DashboardStats {
  total_reviews: number;
  in_progress: number;
  pending_qc: number;
  sent_to_client: number;
  avg_completion_time_hours: number;
  reviews_by_status: {
    status: string;
    count: number;
  }[];
  reviews_by_reviewer: {
    reviewer_name: string;
    count: number;
  }[];
}

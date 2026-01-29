export type UserRole = 'admin' | 'reviewer' | 'client';

export type ReviewStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_qc'
  | 'sent_to_client'
  | 'closed';

export type ChecklistValueType =
  | 'select'
  | 'text'
  | 'number'
  | 'boolean'
  | 'multiple_photos'
  | 'single_video';

export type MediaType = 'photo' | 'video';

export type DocType = 'carvertical' | 'tuv' | 'service_history' | 'documentacion' | 'coc';

export type SyncOperationType = 'create' | 'update' | 'delete' | 'upload_media';

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  assigned_admin_id?: string;
  location?: string;
  active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  client_id: string;
  reviewer_id?: string;
  assigned_admin_id?: string;
  status: ReviewStatus;
  vehicle_vin?: string;
  vehicle_make_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_km?: number;
  started_at?: string;
  completed_at?: string;
  driving_time_seconds: number;
  total_time_seconds: number;
  paused_time_seconds: number;
  qc_notes?: string;
  client_viewed_at?: string;
  sent_to_client_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  review_id: string;
  category: string;
  item_key: string;
  item_label: string;
  value_type: ChecklistValueType;
  value_select?: number;
  value_text?: string;
  value_number?: number;
  value_boolean?: boolean;
  comment?: string;
  is_mandatory: boolean;
  requires_photo: boolean;
  requires_video: boolean;
  min_photos: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistMedia {
  id: string;
  checklist_item_id?: string;
  review_id: string;
  media_type: MediaType;
  file_path: string;
  file_url: string;
  thumbnail_url?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  width?: number;
  height?: number;
  captured_at: string;
  uploaded_at: string;
  is_deleted_by_admin: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ExternalDoc {
  id: string;
  review_id: string;
  doc_type: DocType;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size_bytes?: number;
  uploaded_by: string;
  uploaded_at: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  review_id?: string;
  action: string;
  description?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SyncQueueItem {
  id: string;
  user_id: string;
  review_id?: string;
  operation_type: SyncOperationType;
  entity_type: string;
  entity_id?: string;
  payload: Record<string, any>;
  status: SyncStatus;
  attempts: number;
  last_attempt_at?: string;
  error_message?: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      checklist_items: {
        Row: ChecklistItem;
        Insert: Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChecklistItem, 'id' | 'created_at'>>;
      };
      checklist_media: {
        Row: ChecklistMedia;
        Insert: Omit<ChecklistMedia, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ChecklistMedia, 'id' | 'created_at'>>;
      };
      external_docs: {
        Row: ExternalDoc;
        Insert: Omit<ExternalDoc, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ExternalDoc, 'id' | 'created_at'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
      sync_queue: {
        Row: SyncQueueItem;
        Insert: Omit<SyncQueueItem, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SyncQueueItem, 'id' | 'created_at'>>;
      };
    };
  };
}

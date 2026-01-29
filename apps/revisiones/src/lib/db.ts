import Dexie from 'dexie';

export interface LocalReview {
    id: string; // UUID from Supabase
    client_id: string;
    reviewer_id?: string;
    assigned_admin_id?: string;
    status: string;
    vehicle_make_id?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_year?: number;
    vehicle_km?: number;
    vehicle_vin?: string;
    created_at: string;
    updated_at: string;
    metadata?: any;
    sync_status?: 'synced' | 'pending_update' | 'pending_upload';
}

export interface LocalChecklistItem {
    id: string; // UUID (or temp local ID for offline creation)
    review_id: string;
    item_key: string;
    category: string;
    value_type: string;
    value_select?: number | null;
    value_text?: string | null;
    value_number?: number | null;
    value_boolean?: boolean | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    is_synced: boolean;
}

export interface LocalMedia {
    id: string; // UUID (if synced) or temp ID
    review_id: string;
    checklist_item_id: string;
    media_type: 'photo' | 'video';
    file_blob?: Blob; // For pending uploads
    file_path?: string; // Supabase path (if synced)
    file_url?: string; // Public URL (if synced) or Object URL (if local)
    metadata?: any;
    created_at: string;
    is_deleted: boolean; // Soft delete
    sync_status: 'synced' | 'pending_upload' | 'pending_delete' | 'error_upload' | 'error_delete' | 'error_no_blob';
}

export interface SyncQueueItem {
    id?: number; // Auto-increment
    table: 'reviews' | 'checklist_items' | 'checklist_media';
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    data: any;
    created_at: number;
}

export class AppDatabase extends Dexie {
    reviews!: Dexie.Table<LocalReview, string>;
    checklistItems!: Dexie.Table<LocalChecklistItem, string>;
    media!: Dexie.Table<LocalMedia, string>;
    syncQueue!: Dexie.Table<SyncQueueItem, number>;

    constructor() {
        super('AppDatabase');
        this.version(1).stores({
            reviews: 'id, reviewer_id, status, sync_status',
            checklistItems: 'id, review_id, item_key, is_synced',
            media: 'id, review_id, checklist_item_id, sync_status',
            syncQueue: '++id, table, operation, created_at'
        });
    }
}

export const db = new AppDatabase();

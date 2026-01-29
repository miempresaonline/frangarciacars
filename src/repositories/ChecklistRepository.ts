import { db, LocalChecklistItem, LocalMedia } from '../lib/db';
import { supabase } from '../lib/supabase';
import { SyncService } from '../lib/sync';
import { ChecklistItemDefinition } from '../types/checklist';

export class ChecklistRepository {

    // --- Checklist Items ---

    async saveItem(reviewId: string, itemKey: string, value: any, notes: string | null) {
        const itemData: any = {
            review_id: reviewId,
            item_key: itemKey,
            notes,
            updated_at: new Date().toISOString(),
            is_synced: false // Pending sync
        };

        // Determine value field based on type
        if (typeof value === 'boolean') itemData.value_boolean = value;
        else if (typeof value === 'number') itemData.value_select = value; // assuming select uses numbers
        else itemData.value_text = String(value);

        // 1. Save Local
        // Check if exists to update or add
        const existing = await db.checklistItems.where({ review_id: reviewId, item_key: itemKey }).first();

        if (existing) {
            await db.checklistItems.update(existing.id, itemData);
        } else {
            itemData.id = crypto.randomUUID(); // Generate local ID
            itemData.created_at = new Date().toISOString();
            await db.checklistItems.add(itemData);
        }

        // 2. Queue Sync
        // We queue an UPSERT. The backend should handle using item_key + review_id to identify the row.
        // NOTE: Our Supabase table structure might expect specific "value" column as string.
        // We need to map back to Supabase structure here for the sync queue.
        const supabasePayload = {
            review_id: reviewId,
            item_key: itemKey,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value), // Simple mapping
            notes,
            updated_at: itemData.updated_at
        };

        await SyncService.queueAction('checklist_items', 'INSERT', supabasePayload); // Using INSERT as UPSERT
    }

    async getItems(reviewId: string): Promise<Record<string, LocalChecklistItem>> {
        const items = await db.checklistItems.where('review_id').equals(reviewId).toArray();
        const map: Record<string, LocalChecklistItem> = {};
        items.forEach(i => map[i.item_key] = i);
        return map;
    }

    // --- Media ---

    async saveMedia(reviewId: string, checklistItemId: string | null, file: File, mediaType: 'photo' | 'video'): Promise<LocalMedia> {
        const id = crypto.randomUUID();
        const blob = file; // Store the file itself

        const mediaRecord: LocalMedia = {
            id,
            review_id: reviewId,
            checklist_item_id: checklistItemId || '', // Handle null?
            media_type: mediaType,
            file_blob: blob,
            metadata: { original_name: file.name, type: file.type },
            created_at: new Date().toISOString(),
            is_deleted: false,
            sync_status: 'pending_upload'
        };

        await db.media.add(mediaRecord);

        // We do NOT queue a standard sync action here. 
        // The SyncService polls 'pending_upload' media items separately.

        return mediaRecord;
    }

    async getMedia(reviewId: string): Promise<LocalMedia[]> {
        return await db.media
            .where('review_id').equals(reviewId)
            .filter(m => !m.is_deleted)
            .toArray();
    }
}

export const checklistRepository = new ChecklistRepository();

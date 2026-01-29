import { db, SyncQueueItem } from './db';
import { supabase } from './supabase';

export class SyncService {
    private isSyncing = false;
    private online = navigator.onLine;

    constructor() {
        window.addEventListener('online', () => {
            this.online = true;
            this.processQueue();
        });
        window.addEventListener('offline', () => {
            this.online = false;
        });
    }

    private isSyncingMedia = false; // Add separate flag for media

    // Called periodically or on connection restore
    async processQueue() {
        if (!this.online) return; // Allow syncing if online, even if syncing currently? Or guard strictly? Guard strictly.
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            // 1. Process Metadata Queue (Inserts/Updates/Deletes)
            const queueItems = await db.syncQueue.orderBy('created_at').toArray();

            for (const item of queueItems) {
                try {
                    await this.syncItem(item);
                    await db.syncQueue.delete(item.id!); // Remove from queue on success
                } catch (err) {
                    console.error(`Failed to sync item ${item.id}:`, err);
                    // Keep in queue to retry later? Or move to dead-letter queue?
                    // For now, simpler to abort and retry next time
                }
            }

            // 2. Process Media Queue (Pending Uploads)
            await this.processMediaQueue();

            // 3. Pull latest data if queue is empty (to get changes from others)
            // if (queueItems.length === 0 && pendingMedia.length === 0) {
            //     // Trigger a pull?
            // }

        } catch (err) {
            console.error('Sync process failed:', err);
        } finally {
            this.isSyncing = false;
        }
    }

    private async processMediaQueue() {
        if (this.isSyncingMedia) return;
        this.isSyncingMedia = true;

        try {
            const pendingMedia = await db.media
                .where('sync_status')
                .equals('pending_upload')
                .limit(5) // Process in chunks
                .toArray();

            for (const media of pendingMedia) {
                if (!media.file_blob) {
                    // Mark as error if no blob, to prevent stuck loop
                    await db.media.update(media.id, { sync_status: 'error_no_blob' });
                    continue;
                }

                try {
                    const bucket = media.media_type === 'video' ? 'review-videos' : 'review-evidence';
                    const path = `${media.review_id}/${media.id}`;

                    // Upload
                    const { error } = await supabase.storage
                        .from(bucket)
                        .upload(path, media.file_blob, { upsert: true });

                    if (error) throw error;

                    // Get Public URL
                    const { data: publicData } = supabase.storage
                        .from(bucket)
                        .getPublicUrl(path);

                    // Update Local
                    await db.media.update(media.id, {
                        sync_status: 'synced',
                        file_url: publicData.publicUrl,
                        // file_blob: undefined // OPTIONAL: Clear blob to save space? Keep for now for offline viewing.
                    });

                } catch (err) {
                    console.error(`Failed to upload media ${media.id}:`, err);
                    // Leave as pending_upload to retry? Or mark retry_count?
                }
            }

            // Process Pending Deletes
            const pendingDeletes = await db.media
                .where('sync_status').equals('pending_delete')
                .toArray();

            for (const media of pendingDeletes) {
                try {
                    const bucket = media.media_type === 'video' ? 'review-videos' : 'review-evidence';
                    const path = `${media.review_id}/${media.id}`;
                    await supabase.storage.from(bucket).remove([path]);
                    await db.media.delete(media.id);
                } catch (err) {
                    console.error(`Failed to delete media ${media.id}:`, err);
                }
            }
        } finally {
            this.isSyncingMedia = false;
        }
    }

    async syncItem(item: SyncQueueItem) {
        const { table, operation, data } = item;

        if (operation === 'INSERT' || operation === 'UPDATE') {
            // const { id, ...payload } = data; // Usually we want to upsert
            // We need to handle RLS issues? ID might be generated locally.
            // If local ID is UUID, Supabase should accept it.

            const { error } = await supabase
                .from(table)
                .upsert(data);

            if (error) throw error;
        } else if (operation === 'DELETE') {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', data.id);

            if (error) throw error;
        }
    }

    // Method to queue an action
    static async queueAction(table: 'reviews' | 'checklist_items' | 'checklist_media', operation: 'INSERT' | 'UPDATE' | 'DELETE', data: any) {
        await db.syncQueue.add({
            table,
            operation,
            data,
            created_at: Date.now()
        });
        // Try to sync immediately if online
        syncService.processQueue();
    }
}

export const syncService = new SyncService();

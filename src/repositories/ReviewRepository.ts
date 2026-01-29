import { db, LocalReview } from '../lib/db';
import { supabase } from '../lib/supabase';
import { SyncService } from '../lib/sync';

export class ReviewRepository {

    // Get review by ID (try local first, then network fallback)
    async getReview(id: string): Promise<LocalReview | null> {
        // 1. Try local
        const localReview = await db.reviews.get(id);
        if (localReview) return localReview;

        // 2. Try network (if online)
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                // Cache it locally
                await db.reviews.put({ ...data, sync_status: 'synced' });
                return { ...data, sync_status: 'synced' };
            }
        } catch (err) {
            console.error('Failed to fetch review from network:', err);
        }

        return null;
    }

    // Save review updates
    async updateReview(id: string, updates: Partial<LocalReview>) {
        // 1. Update Local immediately
        await db.reviews.update(id, { ...updates, sync_status: 'pending_update', updated_at: new Date().toISOString() });

        // 2. Queue for Sync
        await SyncService.queueAction('reviews', 'UPDATE', { id, ...updates });
    }

    // Fetch all reviews assigned to a reviewer (Populate cache)
    async syncReviewsForReviewer(reviewerId: string) {
        if (!navigator.onLine) return;

        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('reviewer_id', reviewerId);

            if (error) throw error;

            if (data) {
                await db.transaction('rw', db.reviews, async () => {
                    for (const review of data) {
                        await db.reviews.put({ ...review, sync_status: 'synced' });
                    }
                });
            }
        } catch (err) {
            console.error('Error syncing reviews:', err);
        }
    }
}

export const reviewRepository = new ReviewRepository();

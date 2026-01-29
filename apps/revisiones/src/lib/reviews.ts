import { supabase } from './supabase';
import { logActivity } from './auth';
import type { Review, ReviewStatus } from '../types';
import { CHECKLIST_TEMPLATE } from '../types/checklist';

export interface CreateReviewData {
  client_id: string;
  reviewer_id?: string;
  assigned_admin_id?: string;
  vehicle_make_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_km?: number;
  vehicle_vin?: string;
}

export interface UpdateReviewData {
  reviewer_id?: string;
  assigned_admin_id?: string;
  status?: ReviewStatus;
  vehicle_make_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_km?: number;
  vehicle_vin?: string;
  qc_notes?: string;
}

export async function createReview(data: CreateReviewData) {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      client_id: data.client_id,
      reviewer_id: data.reviewer_id,
      assigned_admin_id: data.assigned_admin_id,
      status: 'draft',
      vehicle_make_id: data.vehicle_make_id,
      vehicle_make: data.vehicle_make,
      vehicle_model: data.vehicle_model,
      vehicle_year: data.vehicle_year,
      vehicle_km: data.vehicle_km,
      vehicle_vin: data.vehicle_vin,
      driving_time_seconds: 0,
      total_time_seconds: 0,
      paused_time_seconds: 0,
      metadata: {},
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity(
    'review_created',
    `Created review for ${data.vehicle_make} ${data.vehicle_model}`,
    review.id
  );

  return review;
}

export async function getAllReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(id, full_name, email),
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name),
      assigned_admin:profiles!reviews_assigned_admin_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getReviewById(reviewId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(id, full_name, email, phone),
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, phone),
      assigned_admin:profiles!reviews_assigned_admin_id_fkey(id, full_name)
    `)
    .eq('id', reviewId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getReviewsByReviewer(reviewerId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(id, full_name, email, phone),
      assigned_admin:profiles!reviews_assigned_admin_id_fkey(id, full_name)
    `)
    .eq('reviewer_id', reviewerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getReviewsByClient(clientId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name)
    `)
    .eq('client_id', clientId)
    .eq('status', 'sent_to_client')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateReview(reviewId: string, updates: UpdateReviewData) {
  const { error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId);

  if (error) throw error;

  await logActivity(
    'review_updated',
    `Updated review ${reviewId}`,
    reviewId
  );
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  const updates: any = { status };

  if (status === 'in_progress' && !updates.started_at) {
    updates.started_at = new Date().toISOString();
  }

  if (status === 'pending_qc') {
    updates.completed_at = new Date().toISOString();
  }

  if (status === 'sent_to_client') {
    updates.sent_to_client_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId);

  if (error) throw error;

  await logActivity(
    'review_status_changed',
    `Review status changed to ${status}`,
    reviewId
  );
}

export async function markClientViewed(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .update({ client_viewed_at: new Date().toISOString() })
    .eq('id', reviewId)
    .is('client_viewed_at', null);

  if (error) throw error;
}

export async function getReviewStats() {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('status, created_at, completed_at, started_at');

  if (error) throw error;

  const stats = {
    total: reviews.length,
    draft: reviews.filter((r) => r.status === 'draft').length,
    in_progress: reviews.filter((r) => r.status === 'in_progress').length,
    pending_qc: reviews.filter((r) => r.status === 'pending_qc').length,
    sent_to_client: reviews.filter((r) => r.status === 'sent_to_client').length,
    closed: reviews.filter((r) => r.status === 'closed').length,
    avg_completion_time: 0,
  };

  const completedReviews = reviews.filter(
    (r) => r.started_at && r.completed_at
  );

  if (completedReviews.length > 0) {
    const totalTime = completedReviews.reduce((sum, r) => {
      const start = new Date(r.started_at!).getTime();
      const end = new Date(r.completed_at!).getTime();
      return sum + (end - start);
    }, 0);

    stats.avg_completion_time = Math.round(
      totalTime / completedReviews.length / 1000 / 60 / 60
    );
  }

  return stats;
}

export async function getReviewProgress(reviewId: string): Promise<number> {
  try {
    const { data: items, error } = await supabase
      .from('checklist_items')
      .select('id, item_key, category, value_type, value_select, value_text, value_number, value_boolean')
      .eq('review_id', reviewId);

    // Force type for now as Supabase generated types might be out of sync
    const checklistItems = (items || []) as any[];

    if (error) throw error;

    // Flatten logic: Iterate through all items in the template
    let completedCount = 0;
    let totalCount = 0;

    // Helper map for fast lookup of saved items
    const savedItemsMap = new Map();
    if (checklistItems) {
      checklistItems.forEach(item => {
        savedItemsMap.set(item.item_key, item);
      });
    }

    for (const category of CHECKLIST_TEMPLATE) {
      for (const itemDef of category.items) {
        totalCount++;

        const savedItem = savedItemsMap.get(itemDef.key);

        if (!savedItem) {
          // If not in DB, it's not complete. 
          // (Unless it's not mandatory? No, progress is usually strict or we only count mandatory?)
          // Usually progress is % of "Things to do". 
          // But let's stick to the previous logic: we count ALL items. 
          // If item is optional, does it count towards 100%?
          // ChecklistScreen shows "totalItems" which includes everything.
          // Let's assume all items in template contribute to progress.
          continue;
        }

        let isCompleted = false;
        let hasValue = false;
        let hasRequiredPhotos = true;
        let hasRequiredVideo = true;

        switch (savedItem.value_type) {
          case 'select':
            hasValue = savedItem.value_select !== null && savedItem.value_select !== undefined;
            break;
          case 'text':
            hasValue = !!savedItem.value_text && savedItem.value_text.trim().length > 0;
            break;
          case 'number':
            hasValue = savedItem.value_number !== null && savedItem.value_number !== undefined;
            break;
          case 'boolean':
            hasValue = savedItem.value_boolean !== null && savedItem.value_boolean !== undefined;
            break;
          case 'multiple_photos':
            hasValue = true; // Value is photos, checked below
            break;
          case 'single_video':
            hasValue = true; // Value is video, checked below
            break;
        }

        if (itemDef.requiresPhoto || itemDef.minPhotos > 0) {
          const { count } = await supabase
            .from('checklist_media')
            .select('*', { count: 'exact', head: true })
            .eq('checklist_item_id', savedItem.id)
            .eq('media_type', 'photo')
            .is('is_deleted_by_admin', false); // Ensure we don't count deleted?

          const photoCount = count || 0;
          hasRequiredPhotos = photoCount >= (itemDef.minPhotos || 1);
        }

        if (itemDef.requiresVideo) {
          const { count } = await supabase
            .from('checklist_media')
            .select('*', { count: 'exact', head: true })
            .eq('checklist_item_id', savedItem.id)
            .eq('media_type', 'video')
            .is('is_deleted_by_admin', false);

          const videoCount = count || 0;
          hasRequiredVideo = videoCount > 0;
        }

        isCompleted = hasValue && hasRequiredPhotos && hasRequiredVideo;

        if (isCompleted) {
          completedCount++;
        }
      }
    }

    if (totalCount === 0) return 0;

    return Math.round((completedCount / totalCount) * 100);
  } catch (err) {
    console.error('Error calculating review progress:', err);
    return 0;
  }
}

export interface IncompleteItem {
  category: string;
  categoryLabel: string;
  itemKey: string;
  itemLabel: string;
  valueType: string;
  missingValue: boolean;
  missingPhotos: number;
  missingVideos: boolean;
  currentPhotos: number;
  requiredPhotos: number;
}

export async function getIncompleteItems(reviewId: string): Promise<IncompleteItem[]> {
  try {
    const { data: items, error } = await supabase
      .from('checklist_items')
      .select('id, item_key, category_key, value_type, value_select, value_text, value_number, value_boolean')
      .eq('review_id', reviewId);

    if (error) throw error;
    if (!items || items.length === 0) return [];

    const incompleteItems: IncompleteItem[] = [];

    for (const item of items) {
      const categoryDef = CHECKLIST_TEMPLATE.find(c => c.key === item.category_key);
      if (!categoryDef) continue;

      const itemDef = categoryDef.items.find(i => i.key === item.item_key);
      if (!itemDef) continue;

      let missingValue = false;
      let missingPhotos = 0;
      let missingVideos = false;
      let currentPhotos = 0;

      switch (item.value_type) {
        case 'select':
          missingValue = item.value_select === null || item.value_select === undefined;
          break;
        case 'text':
          missingValue = !item.value_text || item.value_text.trim().length === 0;
          break;
        case 'number':
          missingValue = item.value_number === null || item.value_number === undefined;
          break;
        case 'boolean':
          missingValue = item.value_boolean === null || item.value_boolean === undefined;
          break;
      }

      if (itemDef.requiresPhoto || itemDef.minPhotos > 0) {
        const { count } = await supabase
          .from('checklist_media')
          .select('*', { count: 'exact', head: true })
          .eq('checklist_item_id', item.id)
          .eq('media_type', 'photo');

        currentPhotos = count || 0;
        const requiredPhotos = itemDef.minPhotos || 1;
        if (currentPhotos < requiredPhotos) {
          missingPhotos = requiredPhotos - currentPhotos;
        }
      }

      if (itemDef.requiresVideo) {
        const { count } = await supabase
          .from('checklist_media')
          .select('*', { count: 'exact', head: true })
          .eq('checklist_item_id', item.id)
          .eq('media_type', 'video');

        missingVideos = !count || count === 0;
      }

      if (missingValue || missingPhotos > 0 || missingVideos) {
        incompleteItems.push({
          category: item.category_key,
          categoryLabel: categoryDef.label,
          itemKey: item.item_key,
          itemLabel: itemDef.label,
          valueType: item.value_type,
          missingValue,
          missingPhotos,
          missingVideos,
          currentPhotos,
          requiredPhotos: itemDef.minPhotos || 0,
        });
      }
    }

    return incompleteItems;
  } catch (err) {
    console.error('Error getting incomplete items:', err);
    return [];
  }
}

export async function sendClientWebhook(reviewId: string) {
  try {
    const review = await getReviewById(reviewId);
    if (!review) throw new Error('Review not found');

    const payload = {
      review_id: review.id,
      client: review.client, // Includes full_name, email, phone
      vehicle: {
        make: review.vehicle_make,
        model: review.vehicle_model,
        year: review.vehicle_year,
        vin: review.vehicle_vin,
        km: review.vehicle_km
      },
      status: review.status,
      completed_at: review.completed_at,
      sent_at: new Date().toISOString()
    };

    // Webhook for sending report to Client (Admin Action)
    // https://n8n.miempresa.online/webhook-test/6cfa5dca-2122-4fff-9a11-5b4374dd4159
    await fetch('https://n8n.miempresa.online/webhook-test/6cfa5dca-2122-4fff-9a11-5b4374dd4159', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Error sending client webhook:', err);
    throw err;
  }
}

export async function sendReviewerWebhook(reviewId: string) {
  try {
    // Get full review details including incomplete items check (just in case) or full data
    const review = await getReviewById(reviewId);
    if (!review) throw new Error('Review not found');

    // Also fetch checklist Stats
    const progress = await getReviewProgress(reviewId);

    // We want to send all possible data
    const payload = {
      action: 'review_submitted_to_qc',
      review_data: review,
      reviewer: review.reviewer,
      client: review.client,
      vehicle: {
        make: review.vehicle_make,
        model: review.vehicle_model,
        year: review.vehicle_year,
        vin: review.vehicle_vin,
        km: review.vehicle_km
      },
      stats: {
        progress_percentage: progress,
        driving_time: review.driving_time_seconds,
        total_time: review.total_time_seconds
      },
      timestamp: new Date().toISOString()
    };

    // Webhook for Reviewer Submission (Reviewer -> Admin QC)
    // https://n8n.miempresa.online/webhook-test/bd473717-0cbe-4125-aa30-f2a48d9760b0
    await fetch('https://n8n.miempresa.online/webhook-test/bd473717-0cbe-4125-aa30-f2a48d9760b0', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Error sending reviewer webhook:', err);
    // We don't throw here to avoid blocking the UI flow if the webhook fails, 
    // simply log it. Or should we block? Ideally we just notify.
    // user said "mande todos los datos", implies it's important. 
    // I'll throw so the UI can warn the user.
    throw err;
  }
}

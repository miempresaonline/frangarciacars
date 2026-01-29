import { supabase } from './supabase';
import type { Profile, Review, ActivityLog } from '../types/database';

export interface RecentUser extends Profile {
  hasCompletedReview?: boolean;
}

export interface ActivityLogWithProfile extends ActivityLog {
  user?: {
    full_name: string;
    role: string;
  };
}

export interface ReviewerPerformance {
  reviewer: {
    id: string;
    full_name: string;
  };
  reviewsCompleted: number;
  avgTimeHours: number;
  qualityRating: number;
}

export interface TrendDataPoint {
  date: string;
  completadas: number;
  enProgreso: number;
  pendienteQC: number;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  reviewId?: string;
}

export interface FeaturedClient {
  client: {
    id: string;
    full_name: string;
    email: string;
  };
  reviewCount: number;
  lastActivity: string;
}

export interface MediaStats {
  totalPhotosToday: number;
  totalPhotosWeek: number;
  totalPhotosMonth: number;
  totalVideosToday: number;
  totalVideosWeek: number;
  totalVideosMonth: number;
  totalSizeBytes: number;
  avgPhotosPerReview: number;
  mostMediaReview?: {
    reviewId: string;
    vehicleName: string;
    mediaCount: number;
  };
  categoryCounts: { category: string; count: number }[];
}

export interface AdvancedStats {
  totalReviews: number;
  totalUsers: number;
  totalCompleted: number;
  totalInProgress: number;
  completedToday: number;
  avgQCTimeHours: number;
}

export interface ReviewWithProgress extends Review {
  progress: number;
  client?: {
    full_name: string;
  };
  reviewer?: {
    full_name: string;
  };
  assigned_admin?: {
    full_name: string;
  };
}

export interface ReviewerDetailedStats {
  reviewer: {
    id: string;
    full_name: string;
    email: string;
  };
  totalReviews: number;
  inProgressReviews: number;
  avgPhotos: number;
  avgVideos: number;
  avgCompletionHours: number;
}

export async function getRecentUsers(days: number = 7): Promise<RecentUser[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  const usersWithReviews = await Promise.all(
    (users || []).map(async (user) => {
      if (user.role === 'reviewer') {
        const { count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('reviewer_id', user.id)
          .eq('status', 'sent_to_client');

        return {
          ...user,
          hasCompletedReview: (count || 0) > 0,
        };
      }
      return user;
    })
  );

  return usersWithReviews;
}

export async function getActivityTimeline(limit: number = 15): Promise<ActivityLogWithProfile[]> {
  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:profiles!activity_logs_user_id_fkey(full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return activities || [];
}

export async function getAdvancedStats(): Promise<AdvancedStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalCompleted } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent_to_client');

  const { count: totalInProgress } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress');

  const { count: completedToday } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('completed_at', todayStart.toISOString())
    .eq('status', 'sent_to_client');

  const { data: qcReviews } = await supabase
    .from('reviews')
    .select('completed_at, sent_to_client_at')
    .not('completed_at', 'is', null)
    .not('sent_to_client_at', 'is', null);

  let avgQCTimeHours = 0;
  if (qcReviews && qcReviews.length > 0) {
    const totalQCTime = qcReviews.reduce((sum, review) => {
      const completed = new Date(review.completed_at!).getTime();
      const sent = new Date(review.sent_to_client_at!).getTime();
      return sum + (sent - completed);
    }, 0);
    avgQCTimeHours = Math.round(totalQCTime / qcReviews.length / 1000 / 60 / 60 * 10) / 10;
  }

  return {
    totalReviews: totalReviews || 0,
    totalUsers: totalUsers || 0,
    totalCompleted: totalCompleted || 0,
    totalInProgress: totalInProgress || 0,
    completedToday: completedToday || 0,
    avgQCTimeHours,
  };
}

export async function getReviewersPerformance(period: 'day' | 'week' | 'month' = 'month'): Promise<ReviewerPerformance[]> {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      break;
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      reviewer_id,
      started_at,
      completed_at,
      qc_notes,
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name)
    `)
    .gte('completed_at', startDate.toISOString())
    .not('reviewer_id', 'is', null)
    .not('completed_at', 'is', null);

  if (!reviews || reviews.length === 0) return [];

  const reviewerMap = new Map<string, {
    reviewer: { id: string; full_name: string };
    reviews: typeof reviews;
  }>();

  reviews.forEach((review) => {
    if (review.reviewer_id && review.reviewer) {
      if (!reviewerMap.has(review.reviewer_id)) {
        reviewerMap.set(review.reviewer_id, {
          reviewer: review.reviewer as { id: string; full_name: string },
          reviews: [],
        });
      }
      reviewerMap.get(review.reviewer_id)!.reviews.push(review);
    }
  });

  const performance: ReviewerPerformance[] = [];

  reviewerMap.forEach((data) => {
    const reviewsCompleted = data.reviews.length;

    const totalTime = data.reviews.reduce((sum, review) => {
      if (review.started_at && review.completed_at) {
        const start = new Date(review.started_at).getTime();
        const end = new Date(review.completed_at).getTime();
        return sum + (end - start);
      }
      return sum;
    }, 0);

    const avgTimeHours = reviewsCompleted > 0
      ? Math.round(totalTime / reviewsCompleted / 1000 / 60 / 60 * 10) / 10
      : 0;

    const approvedCount = data.reviews.filter(r => !r.qc_notes || r.qc_notes.trim() === '').length;
    const qualityRating = reviewsCompleted > 0
      ? Math.round((approvedCount / reviewsCompleted) * 100)
      : 0;

    performance.push({
      reviewer: data.reviewer,
      reviewsCompleted,
      avgTimeHours,
      qualityRating,
    });
  });

  return performance.sort((a, b) => b.reviewsCompleted - a.reviewsCompleted).slice(0, 5);
}

export async function getTrendsData(days: number = 30): Promise<TrendDataPoint[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('status, created_at, completed_at, sent_to_client_at')
    .gte('created_at', startDate.toISOString());

  if (!reviews) return [];

  const dateMap = new Map<string, TrendDataPoint>();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, {
      date: dateStr,
      completadas: 0,
      enProgreso: 0,
      pendienteQC: 0,
    });
  }

  reviews.forEach((review) => {
    if (review.sent_to_client_at) {
      const dateStr = review.sent_to_client_at.split('T')[0];
      const point = dateMap.get(dateStr);
      if (point) point.completadas++;
    }

    const createdDateStr = review.created_at.split('T')[0];
    const point = dateMap.get(createdDateStr);
    if (point) {
      if (review.status === 'in_progress') {
        point.enProgreso++;
      } else if (review.status === 'pending_qc') {
        point.pendienteQC++;
      }
    }
  });

  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSmartAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: unassignedReviews } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .is('reviewer_id', null)
    .eq('status', 'draft')
    .lt('created_at', oneDayAgo.toISOString());

  if (unassignedReviews && unassignedReviews.count > 0) {
    alerts.push({
      id: 'unassigned',
      type: 'error',
      title: 'Revisiones sin asignar',
      description: `${unassignedReviews.count} revisiones sin revisor por más de 24h`,
      count: unassignedReviews.count,
    });
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const { data: stuckQC } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_qc')
    .lt('completed_at', twoDaysAgo.toISOString());

  if (stuckQC && stuckQC.count > 0) {
    alerts.push({
      id: 'stuck_qc',
      type: 'warning',
      title: 'Revisiones en QC atrasadas',
      description: `${stuckQC.count} revisiones en QC por más de 48h`,
      count: stuckQC.count,
    });
  }

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const { data: unviewedReports } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent_to_client')
    .is('client_viewed_at', null)
    .lt('sent_to_client_at', fiveDaysAgo.toISOString());

  if (unviewedReports && unviewedReports.count > 0) {
    alerts.push({
      id: 'unviewed',
      type: 'warning',
      title: 'Reportes sin ver',
      description: `${unviewedReports.count} clientes no han visto su reporte en 5+ días`,
      count: unviewedReviews.count,
    });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: reviewers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'reviewer')
    .eq('active', true);

  if (reviewers) {
    let inactiveCount = 0;
    for (const reviewer of reviewers) {
      const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', reviewer.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!recentActivity || recentActivity.count === 0) {
        inactiveCount++;
      }
    }

    if (inactiveCount > 0) {
      alerts.push({
        id: 'inactive_reviewers',
        type: 'info',
        title: 'Revisores inactivos',
        description: `${inactiveCount} revisores sin actividad en 7+ días`,
        count: inactiveCount,
      });
    }
  }

  return alerts;
}

export async function getFeaturedClients(limit: number = 5): Promise<FeaturedClient[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      client_id,
      created_at,
      client:profiles!reviews_client_id_fkey(id, full_name, email)
    `)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (!reviews || reviews.length === 0) return [];

  const clientMap = new Map<string, { client: any; reviewCount: number; lastActivity: string }>();

  reviews.forEach((review) => {
    if (review.client) {
      if (!clientMap.has(review.client_id)) {
        clientMap.set(review.client_id, {
          client: review.client,
          reviewCount: 0,
          lastActivity: review.created_at,
        });
      }
      const data = clientMap.get(review.client_id)!;
      data.reviewCount++;
      if (review.created_at > data.lastActivity) {
        data.lastActivity = review.created_at;
      }
    }
  });

  return Array.from(clientMap.values())
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export async function getMediaStats(): Promise<MediaStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const { count: photosToday } = await supabase
    .from('checklist_media')
    .select('*', { count: 'exact', head: true })
    .eq('media_type', 'photo')
    .gte('captured_at', todayStart.toISOString());

  const { count: photosWeek } = await supabase
    .from('checklist_media')
    .select('*', { count: 'exact', head: true })
    .eq('media_type', 'photo')
    .gte('captured_at', weekStart.toISOString());

  const { count: photosMonth } = await supabase
    .from('checklist_media')
    .select('*', { count: 'exact', head: true })
    .eq('media_type', 'photo')
    .gte('captured_at', monthStart.toISOString());

  const { count: videosToday } = await supabase
    .from('checklist_media')
    .select('*', { count: 'exact', head: true })
    .eq('media_type', 'video')
    .gte('captured_at', todayStart.toISOString());

  const { count: videosWeek } = await supabase
    .from('checklist_media')
    .select('*', { count: 'exact', head: true })
    .eq('media_type', 'video')
    .gte('captured_at', weekStart.toISOString());

  const { count: videosMonth } = await supabase
    .from('checklist_media')
    .select('*', { count: 'exact', head: true })
    .eq('media_type', 'video')
    .gte('captured_at', monthStart.toISOString());

  const { data: allMedia } = await supabase
    .from('checklist_media')
    .select('file_size_bytes');

  const totalSizeBytes = (allMedia || []).reduce((sum, file) => sum + (file.file_size_bytes || 0), 0);

  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  let avgPhotosPerReview = 0;
  if (totalReviews && totalReviews > 0) {
    const totalPhotos = photosMonth || 0;
    avgPhotosPerReview = Math.round((totalPhotos / totalReviews) * 10) / 10;
  }

  const { data: mediaByReview } = await supabase
    .from('checklist_media')
    .select(`
      review_id,
      review:reviews!checklist_media_review_id_fkey(vehicle_make, vehicle_model)
    `);

  let mostMediaReview;
  if (mediaByReview && mediaByReview.length > 0) {
    const reviewCounts = new Map<string, { count: number; review: any }>();
    mediaByReview.forEach((media) => {
      if (media.review_id) {
        if (!reviewCounts.has(media.review_id)) {
          reviewCounts.set(media.review_id, { count: 0, review: media.review });
        }
        reviewCounts.get(media.review_id)!.count++;
      }
    });

    const sorted = Array.from(reviewCounts.entries()).sort((a, b) => b[1].count - a[1].count);
    if (sorted.length > 0) {
      const [reviewId, data] = sorted[0];
      mostMediaReview = {
        reviewId,
        vehicleName: data.review ? `${data.review.vehicle_make || ''} ${data.review.vehicle_model || ''}`.trim() : 'Desconocido',
        mediaCount: data.count,
      };
    }
  }

  const { data: itemsWithMedia } = await supabase
    .from('checklist_media')
    .select(`
      checklist_item_id,
      item:checklist_items!checklist_media_checklist_item_id_fkey(category)
    `);

  const categoryCounts: { category: string; count: number }[] = [];
  if (itemsWithMedia) {
    const categoryMap = new Map<string, number>();
    itemsWithMedia.forEach((media) => {
      if (media.item && media.item.category) {
        categoryMap.set(media.item.category, (categoryMap.get(media.item.category) || 0) + 1);
      }
    });

    categoryMap.forEach((count, category) => {
      categoryCounts.push({ category, count });
    });
  }

  return {
    totalPhotosToday: photosToday || 0,
    totalPhotosWeek: photosWeek || 0,
    totalPhotosMonth: photosMonth || 0,
    totalVideosToday: videosToday || 0,
    totalVideosWeek: videosWeek || 0,
    totalVideosMonth: videosMonth || 0,
    totalSizeBytes,
    avgPhotosPerReview,
    mostMediaReview,
    categoryCounts: categoryCounts.sort((a, b) => b.count - a.count).slice(0, 5),
  };
}

export async function getReviewProgress(reviewId: string): Promise<number> {
  try {
    const { data: allItems } = await supabase
      .from('checklist_items')
      .select('id, is_mandatory')
      .eq('review_id', reviewId);

    if (!allItems || allItems.length === 0) return 0;

    const mandatoryItems = allItems.filter(item => item.is_mandatory);
    if (mandatoryItems.length === 0) return 0;

    const completedMandatory = mandatoryItems.filter(item => item.id).length;
    return Math.round((completedMandatory / mandatoryItems.length) * 100);
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
}

export async function getReviewsWithProgress(): Promise<ReviewWithProgress[]> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(full_name),
      reviewer:profiles!reviews_reviewer_id_fkey(full_name),
      assigned_admin:profiles!reviews_assigned_admin_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const reviewsWithProgress = await Promise.all(
    (reviews || []).map(async (review) => {
      const progress = await getReviewProgress(review.id);
      return {
        ...review,
        progress,
      };
    })
  );

  return reviewsWithProgress;
}

export async function getReviewerDetailedStats(): Promise<ReviewerDetailedStats[]> {
  const { data: reviewers } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'reviewer')
    .eq('active', true);

  if (!reviewers) return [];

  const stats = await Promise.all(
    reviewers.map(async (reviewer) => {
      const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reviewer_id', reviewer.id);

      const { count: inProgressReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reviewer_id', reviewer.id)
        .eq('status', 'in_progress');

      const { data: reviewIds } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', reviewer.id);

      let avgPhotos = 0;
      let avgVideos = 0;
      if (reviewIds && reviewIds.length > 0) {
        const ids = reviewIds.map(r => r.id);

        const { count: photoCount } = await supabase
          .from('checklist_media')
          .select('*', { count: 'exact', head: true })
          .in('review_id', ids)
          .eq('media_type', 'photo');

        const { count: videoCount } = await supabase
          .from('checklist_media')
          .select('*', { count: 'exact', head: true })
          .in('review_id', ids)
          .eq('media_type', 'video');

        avgPhotos = photoCount ? Math.round((photoCount / reviewIds.length) * 10) / 10 : 0;
        avgVideos = videoCount ? Math.round((videoCount / reviewIds.length) * 10) / 10 : 0;
      }

      const { data: completedReviews } = await supabase
        .from('reviews')
        .select('started_at, completed_at')
        .eq('reviewer_id', reviewer.id)
        .not('started_at', 'is', null)
        .not('completed_at', 'is', null);

      let avgCompletionHours = 0;
      if (completedReviews && completedReviews.length > 0) {
        const totalTime = completedReviews.reduce((sum, review) => {
          const start = new Date(review.started_at!).getTime();
          const end = new Date(review.completed_at!).getTime();
          return sum + (end - start);
        }, 0);
        avgCompletionHours = Math.round(totalTime / completedReviews.length / 1000 / 60 / 60 * 10) / 10;
      }

      return {
        reviewer,
        totalReviews: totalReviews || 0,
        inProgressReviews: inProgressReviews || 0,
        avgPhotos,
        avgVideos,
        avgCompletionHours,
      };
    })
  );

  return stats.sort((a, b) => b.totalReviews - a.totalReviews);
}

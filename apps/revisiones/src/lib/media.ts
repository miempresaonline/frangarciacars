import { supabase } from './supabase';
import { logActivity } from './auth';

export interface MediaFile {
  id: string;
  review_id: string;
  checklist_item_id: string | null;
  media_type: 'photo' | 'video';
  file_path: string;
  file_url: string;
  file_size_bytes: number;
  duration_seconds: number | null;
  created_at: string;
  metadata: Record<string, any>;
}

export function getStoragePath(reviewId: string, itemId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${reviewId}/${itemId}/${timestamp}_${sanitizedFilename}`;
}

export async function getReviewMedia(reviewId: string, mediaType?: 'photo' | 'video') {
  let query = supabase
    .from('checklist_media')
    .select('*')
    .eq('review_id', reviewId)
    .is('is_deleted_by_admin', false);

  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as MediaFile[];
}

export async function uploadPhoto(
  reviewId: string,
  checklistItemId: string,
  file: File
): Promise<MediaFile> {
  const storagePath = getStoragePath(reviewId, checklistItemId, file.name);

  const { error: uploadError } = await supabase.storage
    .from('review-photos')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('review-photos')
    .getPublicUrl(storagePath);

  const { data: mediaRecord, error: insertError } = await supabase
    .from('checklist_media')
    .insert({
      review_id: reviewId,
      checklist_item_id: checklistItemId,
      media_type: 'photo',
      file_path: storagePath,
      file_url: publicUrlData.publicUrl,
      file_size_bytes: file.size,
      duration_seconds: null,
      metadata: {
        original_filename: file.name,
        mime_type: file.type,
        public_url: publicUrlData.publicUrl,
      },
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from('review-photos').remove([storagePath]);
    throw insertError;
  }

  await logActivity('photo_uploaded', `Uploaded photo for review ${reviewId}`, reviewId);

  return mediaRecord as MediaFile;
}

export async function uploadVideo(
  reviewId: string,
  checklistItemId: string,
  file: File,
  durationSeconds?: number
): Promise<MediaFile> {
  const storagePath = getStoragePath(reviewId, checklistItemId, file.name);

  const { error: uploadError } = await supabase.storage
    .from('review-videos')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('review-videos')
    .getPublicUrl(storagePath);

  const { data: mediaRecord, error: insertError } = await supabase
    .from('checklist_media')
    .insert({
      review_id: reviewId,
      checklist_item_id: checklistItemId,
      media_type: 'video',
      file_path: storagePath,
      file_url: publicUrlData.publicUrl,
      file_size_bytes: file.size,
      duration_seconds: durationSeconds || null,
      metadata: {
        original_filename: file.name,
        mime_type: file.type,
        public_url: publicUrlData.publicUrl,
      },
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from('review-videos').remove([storagePath]);
    throw insertError;
  }

  await logActivity('video_uploaded', `Uploaded video for review ${reviewId}`, reviewId);

  return mediaRecord as MediaFile;
}

export async function deleteMediaFile(mediaId: string): Promise<void> {
  try {
    const { data: media, error: fetchError } = await supabase
      .from('checklist_media')
      .select('id, file_path, media_type, review_id')
      .eq('id', mediaId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!media) throw new Error('Media file not found');

    const bucket = media.media_type === 'photo' ? 'review-photos' : 'review-videos';

    if (media.file_path) {
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([media.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }
    }

    const { error: deleteError } = await supabase
      .from('checklist_media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) throw deleteError;

    await logActivity(
      'media_deleted',
      `Deleted ${media.media_type} from review ${media.review_id}`,
      media.review_id
    );
  } catch (error) {
    console.error('Error deleting media file:', error);
    throw error;
  }
}

export async function getMediaPublicUrl(mediaType: 'photo' | 'video', storagePath: string): string {
  const bucket = mediaType === 'photo' ? 'review-photos' : 'review-videos';
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getMediaSignedUrl(
  mediaType: 'photo' | 'video',
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucket = mediaType === 'photo' ? 'review-photos' : 'review-videos';
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

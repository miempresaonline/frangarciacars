import { supabase } from './supabase';
import { logActivity } from './auth';

export type DocumentType = 'carvertical' | 'tuv' | 'service_history' | 'documentacion' | 'coc';

export interface ExternalDocument {
  id: string;
  review_id: string;
  doc_type: DocumentType;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size_bytes: number;
  uploaded_by: string;
  created_at: string;
  metadata: Record<string, any>;
}

export function getDocumentStoragePath(reviewId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${reviewId}/${timestamp}_${sanitizedFilename}`;
}

export async function getReviewDocuments(reviewId: string): Promise<ExternalDocument[]> {
  const { data, error } = await supabase
    .from('external_docs')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ExternalDocument[];
}

export async function uploadDocument(
  reviewId: string,
  documentType: DocumentType,
  file: File
): Promise<ExternalDocument> {
  if (file.type !== 'application/pdf') {
    throw new Error('Solo se permiten archivos PDF');
  }

  const storagePath = getDocumentStoragePath(reviewId, file.name);

  const { error: uploadError } = await supabase.storage
    .from('external-docs')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('external-docs')
    .getPublicUrl(storagePath);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const { data: document, error: insertError } = await supabase
    .from('external_docs')
    .insert({
      review_id: reviewId,
      doc_type: documentType,
      file_name: file.name,
      file_path: storagePath,
      file_url: publicUrlData.publicUrl,
      file_size_bytes: file.size,
      uploaded_by: user.id,
      metadata: {
        original_filename: file.name,
        mime_type: file.type,
      },
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from('external-docs').remove([storagePath]);
    throw insertError;
  }

  await logActivity(
    'document_uploaded',
    `Uploaded ${documentType} document for review ${reviewId}`,
    reviewId
  );

  return document as ExternalDocument;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { data: document, error: fetchError } = await supabase
    .from('external_docs')
    .select('*')
    .eq('id', documentId)
    .single();

  if (fetchError) throw fetchError;

  const { error: storageError } = await supabase.storage
    .from('external-docs')
    .remove([document.file_path]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from('external_docs')
    .delete()
    .eq('id', documentId);

  if (deleteError) throw deleteError;

  await logActivity(
    'document_deleted',
    `Deleted ${document.doc_type} document from review ${document.review_id}`,
    document.review_id
  );
}

export async function downloadDocument(documentId: string): Promise<string> {
  const { data: document, error: fetchError } = await supabase
    .from('external_docs')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase.storage
    .from('external-docs')
    .createSignedUrl(document.file_path, 60);

  if (error) throw error;

  return data.signedUrl;
}

export async function getDocumentUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('external-docs')
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    carvertical: 'CarVertical',
    tuv: 'TÜV / ITV',
    service_history: 'Historial Mantenimiento',
    documentacion: 'Documentación',
    coc: 'COC (Certificado Conformidad)',
  };
  return labels[type] || type;
}

export function getDocumentTypeColor(type: DocumentType): string {
  const colors: Record<DocumentType, string> = {
    carvertical: 'bg-blue-100 text-blue-700',
    tuv: 'bg-green-100 text-green-700',
    service_history: 'bg-orange-100 text-orange-700',
    documentacion: 'bg-purple-100 text-purple-700',
    coc: 'bg-indigo-100 text-indigo-700',
  };
  return colors[type];
}

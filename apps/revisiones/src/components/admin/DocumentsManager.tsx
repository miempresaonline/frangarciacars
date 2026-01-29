import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Loader2 } from 'lucide-react';
import {
  getReviewDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  getDocumentTypeLabel,
  getDocumentTypeColor,
  type DocumentType,
  type ExternalDocument,
} from '../../lib/documents';

interface DocumentsManagerProps {
  reviewId: string;
}

export function DocumentsManager({ reviewId }: DocumentsManagerProps) {
  const [documents, setDocuments] = useState<ExternalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('carvertical');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [reviewId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getReviewDocuments(reviewId);
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
      alert('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe superar 10MB');
      return;
    }

    try {
      setUploading(true);
      await uploadDocument(reviewId, selectedType, file);
      await loadDocuments();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      alert(`Error al subir documento: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, documentName: string) => {
    if (!confirm(`¿Seguro que quieres eliminar "${documentName}"?`)) {
      return;
    }

    try {
      await deleteDocument(documentId);
      await loadDocuments();
    } catch (err: any) {
      alert(`Error al eliminar documento: ${err.message}`);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const url = await downloadDocument(documentId);
      window.open(url, '_blank');
    } catch (err: any) {
      alert(`Error al descargar documento: ${err.message}`);
    }
  };

  const formatFileSize = (sizeBytes: number) => {
    const sizeKb = sizeBytes / 1024;
    if (sizeKb < 1024) {
      return `${sizeKb.toFixed(1)} KB`;
    }
    return `${(sizeKb / 1024).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0029D4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
        >
          <option value="carvertical">CarVertical</option>
          <option value="tuv">TÜV / ITV</option>
          <option value="service_history">Historial Mantenimiento</option>
          <option value="documentacion">Documentación</option>
          <option value="coc">COC (Certificado Conformidad)</option>
        </select>

        <label className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={20} />
                Subir Documento PDF
              </>
            )}
          </button>
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay documentos adjuntos</p>
          <p className="text-sm text-gray-400 mt-1">Sube documentos como CarVertical, TÜV, etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText size={24} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {doc.file_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(
                        doc.doc_type
                      )}`}
                    >
                      {getDocumentTypeLabel(doc.doc_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Descargar"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.document_name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

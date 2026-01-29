import { useState, useEffect } from 'react';
import { Search, FileText, Clock, CheckCircle, AlertCircle, Eye, Edit, XCircle } from 'lucide-react';
import { getAllReviews, getReviewProgress } from '../../lib/reviews';
import { ReviewDetailModal } from './ReviewDetailModal';
import { EditReviewModal } from './EditReviewModal';
import { ProgressBar } from '../ui/ProgressBar';
import type { ReviewStatus } from '../../types';

interface ReviewsListProps {
  onRefresh?: number;
}

export function ReviewsList({ onRefresh }: ReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [reviewerFilter, setReviewerFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    loadReviews();
  }, [onRefresh]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);

      const progressData: Record<string, number> = {};
      for (const review of data) {
        if (review.status !== 'sent_to_client') {
          progressData[review.id] = review.progress_percentage || 0;
        }
      }
      setProgressMap(progressData);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueReviewers = Array.from(new Set(reviews.map(r => r.reviewer?.full_name).filter(Boolean)));
  const uniqueResponsibles = Array.from(new Set(reviews.map(r => r.assigned_admin?.full_name).filter(Boolean)));
  const uniqueBrands = Array.from(new Set(reviews.map(r => r.vehicle_make).filter(Boolean)));
  const uniqueModels = brandFilter === 'all'
    ? Array.from(new Set(reviews.map(r => r.vehicle_model).filter(Boolean)))
    : Array.from(new Set(reviews.filter(r => r.vehicle_make === brandFilter).map(r => r.vehicle_model).filter(Boolean)));

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.vehicle_vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesReviewer = reviewerFilter === 'all' || review.reviewer?.full_name === reviewerFilter;
    const matchesResponsible = responsibleFilter === 'all' || review.assigned_admin?.full_name === responsibleFilter;
    const matchesBrand = brandFilter === 'all' || review.vehicle_make === brandFilter;
    const matchesModel = modelFilter === 'all' || review.vehicle_model === modelFilter;

    return matchesSearch && matchesStatus && matchesReviewer && matchesResponsible && matchesBrand && matchesModel;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setReviewerFilter('all');
    setResponsibleFilter('all');
    setBrandFilter('all');
    setModelFilter('all');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    reviewerFilter !== 'all',
    responsibleFilter !== 'all',
    brandFilter !== 'all',
    modelFilter !== 'all',
    searchTerm !== '',
  ].filter(Boolean).length;

  const getStatusBadge = (status: ReviewStatus) => {
    const badges = {
      draft: {
        label: 'Creada',
        color: 'bg-gray-100 text-gray-700',
        icon: FileText,
      },
      in_progress: {
        label: 'En Ejecución',
        color: 'bg-blue-100 text-blue-700',
        icon: Clock,
      },
      pending_qc: {
        label: 'En Revisión (QC)',
        color: 'bg-orange-100 text-orange-700',
        icon: AlertCircle,
      },
      sent_to_client: {
        label: 'Aprobada',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      },
      closed: {
        label: 'Cerrada',
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#0029D4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por vehículo, VIN o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Creada</option>
            <option value="in_progress">En Ejecución</option>
            <option value="pending_qc">En Revisión (QC)</option>
            <option value="sent_to_client">Aprobada</option>
            <option value="closed">Cerrada</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            value={reviewerFilter}
            onChange={(e) => setReviewerFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent text-sm"
          >
            <option value="all">Todos los revisores</option>
            {uniqueReviewers.map(reviewer => (
              <option key={reviewer} value={reviewer}>{reviewer}</option>
            ))}
          </select>

          <select
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent text-sm"
          >
            <option value="all">Todos los responsables</option>
            {uniqueResponsibles.map(responsible => (
              <option key={responsible} value={responsible}>{responsible}</option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setModelFilter('all');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent text-sm"
          >
            <option value="all">Todas las marcas</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent text-sm"
          >
            <option value="all">Todos los modelos</option>
            {uniqueModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-700 font-medium">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron revisiones</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.vehicle_make} {review.vehicle_model}
                        </div>
                        {review.vehicle_year && (
                          <div className="text-sm text-gray-500">
                            {review.vehicle_year}
                            {review.vehicle_km && ` • ${review.vehicle_km.toLocaleString()} km`}
                          </div>
                        )}
                        {review.vehicle_vin && (
                          <div className="text-xs text-gray-400 font-mono mt-1">
                            {review.vehicle_vin}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.client?.full_name || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.client?.email || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.reviewer?.full_name || (
                          <span className="text-gray-400">Sin asignar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.assigned_admin?.full_name || (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(review.status)}
                        {review.client_viewed_at && review.status === 'sent_to_client' && (
                          <Eye
                            size={16}
                            className="text-green-600"
                            title="Cliente ha visto el informe"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.status !== 'sent_to_client' ? (
                        <div className="w-40 space-y-1">
                          <div className="flex items-center gap-2">
                            <ProgressBar progress={progressMap[review.id] || review.progress_percentage || 0} />
                            <span className="text-sm font-semibold text-gray-700 min-w-[40px]">
                              {progressMap[review.id] || review.progress_percentage || 0}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingReviewId(review.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedReviewId(review.id)}
                          className="text-[#0029D4] hover:text-[#0021A0] font-medium"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredReviews.length} de {reviews.length} revisiones
      </div>

      {selectedReviewId && (
        <ReviewDetailModal
          isOpen={true}
          onClose={() => setSelectedReviewId(null)}
          reviewId={selectedReviewId}
          onSuccess={() => {
            setSelectedReviewId(null);
            loadReviews();
          }}
        />
      )}

      {editingReviewId && (
        <EditReviewModal
          isOpen={true}
          onClose={() => setEditingReviewId(null)}
          reviewId={editingReviewId}
          onSuccess={() => {
            setEditingReviewId(null);
            loadReviews();
          }}
        />
      )}
    </div>
  );
}

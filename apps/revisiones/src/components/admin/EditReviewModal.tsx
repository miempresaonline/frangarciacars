import { useState, useEffect } from 'react';
import { X, Save, Loader2, Car, User, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { searchVehicleMakes } from '../../lib/vehicleMakes';
import { Autocomplete } from '../ui/Autocomplete';
import type { ReviewStatus } from '../../types';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  onSuccess?: () => void;
}

interface ReviewFormData {
  vehicle_make_id: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | null;
  vehicle_km: number | null;
  vehicle_vin: string;
  status: ReviewStatus;
  reviewer_id: string | null;
}

export function EditReviewModal({ isOpen, onClose, reviewId, onSuccess }: EditReviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    vehicle_make_id: null,
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: null,
    vehicle_km: null,
    vehicle_vin: '',
    status: 'draft',
    reviewer_id: null,
  });
  const [reviewers, setReviewers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadReviewData();
      loadReviewers();
    }
  }, [isOpen, reviewId]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error) throw error;

      setFormData({
        vehicle_make_id: data.vehicle_make_id || null,
        vehicle_make: data.vehicle_make || '',
        vehicle_model: data.vehicle_model || '',
        vehicle_year: data.vehicle_year || null,
        vehicle_km: data.vehicle_km || null,
        vehicle_vin: data.vehicle_vin || '',
        status: data.status || 'draft',
        reviewer_id: data.reviewer_id || null,
      });
    } catch (err) {
      console.error('Error loading review:', err);
      toast.error('Error al cargar la revisión');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'reviewer')
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      setReviewers(data || []);
    } catch (err) {
      console.error('Error loading reviewers:', err);
    }
  };

  const handleSave = async () => {
    if (!formData.vehicle_make || !formData.vehicle_model) {
      toast.error('Marca y modelo son obligatorios');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('reviews')
        .update({
          vehicle_make_id: formData.vehicle_make_id,
          vehicle_make: formData.vehicle_make,
          vehicle_model: formData.vehicle_model,
          vehicle_year: formData.vehicle_year,
          vehicle_km: formData.vehicle_km,
          vehicle_vin: formData.vehicle_vin,
          status: formData.status,
          reviewer_id: formData.reviewer_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Revisión actualizada correctamente');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error updating review:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-12 h-12 text-[#0029D4] animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Revisión</h2>
            <p className="text-sm text-gray-500">ID: {reviewId.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Car className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Datos del Vehículo</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Autocomplete
                    label="Marca"
                    required
                    value={formData.vehicle_make}
                    placeholder="Buscar marca (ej: BMW, Mercedes...)"
                    onSearch={async (query) => {
                      const makes = await searchVehicleMakes(query);
                      return makes.map((make) => ({
                        id: make.id,
                        label: make.name,
                        ...make,
                      }));
                    }}
                    onChange={(option) => {
                      if (option) {
                        setFormData({
                          ...formData,
                          vehicle_make_id: option.id,
                          vehicle_make: option.label,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          vehicle_make_id: null,
                          vehicle_make: '',
                        });
                      }
                    }}
                    debounceMs={300}
                    minCharsToSearch={0}
                    noResultsText="No se encontraron marcas"
                    loadingText="Buscando marcas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="ej: 320i"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="number"
                    value={formData.vehicle_year || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="ej: 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    value={formData.vehicle_km || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_km: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="ej: 50000"
                    min="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIN
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_vin}
                    onChange={(e) => setFormData({ ...formData, vehicle_vin: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="ej: WBADT43452G123456"
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Asignación</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revisor Asignado
                  </label>
                  <select
                    value={formData.reviewer_id || ''}
                    onChange={(e) => setFormData({ ...formData, reviewer_id: e.target.value || null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  >
                    <option value="">Sin asignar</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ReviewStatus })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  >
                    <option value="draft">Borrador</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="pending_qc">Pendiente QC</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="sent_to_client">Enviada al Cliente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

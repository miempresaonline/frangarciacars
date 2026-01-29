import { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { createReview } from '../../lib/reviews';
import { getClientUsers, getReviewerUsers, getAdminUsers } from '../../lib/users';
import { searchVehicleMakes, type VehicleMake } from '../../lib/vehicleMakes';
import { Autocomplete, type AutocompleteOption } from '../ui/Autocomplete';
import type { Profile } from '../../types';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReviewModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateReviewModalProps) {
  const [formData, setFormData] = useState({
    client_id: '',
    reviewer_id: '',
    assigned_admin_id: '',
    vehicle_make_id: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_km: '',
    vehicle_vin: '',
  });

  const [clients, setClients] = useState<Profile[]>([]);
  const [reviewers, setReviewers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const [clientData, reviewerData, adminData] = await Promise.all([
        getClientUsers(),
        getReviewerUsers(),
        getAdminUsers(),
      ]);
      setClients(clientData);
      setReviewers(reviewerData);
      setAdmins(adminData);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createReview({
        client_id: formData.client_id,
        reviewer_id: formData.reviewer_id || undefined,
        assigned_admin_id: formData.assigned_admin_id || undefined,
        vehicle_make_id: formData.vehicle_make_id || undefined,
        vehicle_make: formData.vehicle_make || undefined,
        vehicle_model: formData.vehicle_model || undefined,
        vehicle_year: formData.vehicle_year || undefined,
        vehicle_km: formData.vehicle_km ? parseInt(formData.vehicle_km) : undefined,
        vehicle_vin: formData.vehicle_vin || undefined,
      });

      setFormData({
        client_id: '',
        reviewer_id: '',
        assigned_admin_id: '',
        vehicle_make_id: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: new Date().getFullYear(),
        vehicle_km: '',
        vehicle_vin: '',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear revisión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nueva Revisión</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre o email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={formData.client_id}
                  onChange={(e) =>
                    setFormData({ ...formData, client_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  required
              >
                <option value="">Seleccionar cliente</option>
                {clients
                  .filter((client) => {
                    if (!clientSearch) return true;
                    const search = clientSearch.toLowerCase();
                    return (
                      client.full_name?.toLowerCase().includes(search) ||
                      client.email?.toLowerCase().includes(search)
                    );
                  })
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </option>
                ))}
              </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revisor
              </label>
              <select
                value={formData.reviewer_id}
                onChange={(e) =>
                  setFormData({ ...formData, reviewer_id: e.target.value })
                }
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
                Admin Responsable
              </label>
              <select
                value={formData.assigned_admin_id}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_admin_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Datos del Vehículo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Autocomplete
                  label="Marca"
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
                        vehicle_make_id: '',
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
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.vehicle_model}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle_model: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  placeholder="Golf GTI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  value={formData.vehicle_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicle_year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
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
                  value={formData.vehicle_km}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle_km: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN (Número de Bastidor)
                </label>
                <input
                  type="text"
                  value={formData.vehicle_vin}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle_vin: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent font-mono"
                  placeholder="WVWZZZ1KZBW123456"
                  maxLength={17}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Revisión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

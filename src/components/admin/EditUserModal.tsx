import { useState, useEffect } from 'react';
import { X, Loader2, KeyRound } from 'lucide-react';
import { updateUserProfile, getAdminUsers } from '../../lib/users';
import type { UserRole, Profile } from '../../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: Profile;
}

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    phone: user.phone || '',
    location: user.location || '',
    assigned_admin_id: user.assigned_admin_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: user.full_name,
        phone: user.phone || '',
        location: user.location || '',
        assigned_admin_id: user.assigned_admin_id || '',
      });
      setError(null);
      setShowResetPassword(false);
      setNewPassword('');
      if (user.role === 'client') {
        loadAdmins();
      }
    }
  }, [isOpen, user]);

  const loadAdmins = async () => {
    try {
      const data = await getAdminUsers();
      setAdmins(data);
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        assigned_admin_id: formData.assigned_admin_id || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`¿Seguro que quieres resetear la contraseña de ${user.full_name}?`)) {
      return;
    }

    setResetPasswordLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-user-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al resetear contraseña');
      }

      setNewPassword(data.new_password);
      setShowResetPassword(true);
    } catch (err: any) {
      setError(err.message || 'Error al resetear contraseña');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    alert('Contraseña copiada al portapapeles');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Editar Usuario</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Rol:</span> {user.role}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Estado:</span>{' '}
              {user.active ? (
                <span className="text-green-600 font-medium">Activo</span>
              ) : (
                <span className="text-gray-600 font-medium">Inactivo</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
              placeholder="+34 600 000 000"
            />
          </div>

          {user.role === 'reviewer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                placeholder="Munich, Alemania"
              />
            </div>
          )}

          {user.role === 'client' && admins.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable Interno
              </label>
              <select
                value={formData.assigned_admin_id}
                onChange={(e) => setFormData({ ...formData, assigned_admin_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
              >
                <option value="">Ninguno</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetPasswordLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound size={20} />
              {resetPasswordLoading ? 'Reseteando...' : 'Resetear Contraseña'}
            </button>
          </div>

          {showResetPassword && newPassword && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 mb-2">
                Nueva contraseña generada:
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 font-mono text-sm">
                  {newPassword}
                </code>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Guarda esta contraseña. El usuario deberá cambiarla al iniciar sesión.
              </p>
            </div>
          )}

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
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, Save, X, Loader2, Image, Video, Type, Hash, ToggleLeft, ChevronDown, Sparkles, GripVertical } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChecklistValueType } from '../../types';
import { getCategoryOrder, updateCategoryOrder, type CategoryOrder } from '../../lib/checklistOrder';

interface ChecklistTemplate {
  id?: string;
  category: string;
  item_key: string;
  item_label: string;
  value_type: ChecklistValueType;
  is_mandatory: boolean;
  requires_photo: boolean;
  requires_video: boolean;
  min_photos: number;
  order_index: number;
  select_options?: string[];
}

export function ChecklistSettings() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder[]>([]);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChecklistTemplate>({
    category: '',
    item_key: '',
    item_label: '',
    value_type: 'select',
    is_mandatory: true,
    requires_photo: false,
    requires_video: false,
    min_photos: 0,
    order_index: 0,
    select_options: ['Bueno', 'Regular', 'Malo'],
  });

  useEffect(() => {
    loadTemplates();
    loadCategoryOrder();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('category')
        .order('order_index');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryOrder = async () => {
    try {
      const order = await getCategoryOrder();
      setCategoryOrder(order);
    } catch (err) {
      console.error('Error loading category order:', err);
    }
  };

  const handleDragStart = (category: string) => {
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory === targetCategory) return;

    const sortedCategories = getSortedCategories();
    const draggedIndex = sortedCategories.indexOf(draggedCategory);
    const targetIndex = sortedCategories.indexOf(targetCategory);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...sortedCategories];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategory);

    const updatedOrder: CategoryOrder[] = newOrder.map((cat, idx) => ({
      category_key: cat,
      order_position: idx + 1,
    }));

    setCategoryOrder(updatedOrder);
  };

  const handleDragEnd = async () => {
    if (draggedCategory && categoryOrder.length > 0) {
      try {
        await updateCategoryOrder(categoryOrder);
        toast.success('Orden guardado correctamente');
      } catch (err) {
        console.error('Error saving category order:', err);
        toast.error('Error al guardar el orden');
        await loadCategoryOrder();
      }
    }
    setDraggedCategory(null);
  };

  const getSortedCategories = (): string[] => {
    const allCategories = Array.from(new Set(templates.map((t) => t.category)));

    if (categoryOrder.length === 0) {
      return allCategories.sort();
    }

    const orderMap = new Map(categoryOrder.map((o) => [o.category_key, o.order_position]));

    return allCategories.sort((a, b) => {
      const orderA = orderMap.get(a) ?? 999;
      const orderB = orderMap.get(b) ?? 999;
      return orderA - orderB;
    });
  };

  const handleSave = async (template: ChecklistTemplate) => {
    try {
      if (template.id) {
        const { error } = await supabase
          .from('checklist_templates')
          .update({
            item_label: template.item_label,
            is_mandatory: template.is_mandatory,
            requires_photo: template.requires_photo,
            requires_video: template.requires_video,
            min_photos: template.min_photos,
          })
          .eq('id', template.id);

        if (error) throw error;
      } else {
        const maxOrder = templates
          .filter(t => t.category === template.category)
          .reduce((max, t) => Math.max(max, t.order_index), 0);

        const { error } = await supabase
          .from('checklist_templates')
          .insert({
            ...template,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
      }

      await loadTemplates();
      setEditingId(null);
      setShowAddForm(false);
      resetForm();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento del checklist?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadTemplates();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      item_key: '',
      item_label: '',
      value_type: 'select',
      is_mandatory: true,
      requires_photo: false,
      requires_video: false,
      min_photos: 0,
      order_index: 0,
      select_options: ['Bueno', 'Regular', 'Malo'],
    });
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getValueTypeIcon = (type: ChecklistValueType) => {
    switch (type) {
      case 'multiple_photos':
        return <Image size={16} className="text-purple-600" />;
      case 'single_video':
        return <Video size={16} className="text-pink-600" />;
      case 'text':
        return <Type size={16} className="text-blue-600" />;
      case 'number':
        return <Hash size={16} className="text-green-600" />;
      case 'boolean':
        return <ToggleLeft size={16} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getValueTypeLabel = (type: ChecklistValueType) => {
    const labels = {
      select: 'Selección',
      text: 'Texto',
      number: 'Número',
      boolean: 'Sí/No',
      multiple_photos: 'Múltiples Fotos',
      single_video: 'Un Video',
    };
    return labels[type] || type;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      exterior: '🚗',
      interior: '🪟',
      engine: '⚙️',
      motor: '⚙️',
      mecanica: '🔧',
      electrica: '⚡',
      neumaticos: '🛞',
      documentacion: '📄',
      general: '📋',
    };
    return icons[category.toLowerCase()] || '📋';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exterior: 'Exterior',
      interior: 'Interior',
      engine: 'Motor y Mecánica',
      motor: 'Motor',
      mecanica: 'Mecánica',
      electrica: 'Eléctrica',
      neumaticos: 'Neumáticos',
      obd: 'Diagnosis OBD',
      test_drive: 'Prueba de Conducción',
      documentation: 'Documentación y Extras',
      documentacion: 'Documentación',
      general: 'General',
    };
    return labels[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const categories = getSortedCategories();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={48} className="animate-spin text-[#0029D4]" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            padding: '12px 16px',
          },
        }}
      />
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Settings className="text-[#0029D4]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración del Checklist</h2>
            <p className="text-sm text-gray-600">
              {templates.length} preguntas en {categories.length} categorías
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Nueva Pregunta
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Nueva Pregunta del Checklist</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/50 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryIcon(cat)} {getCategoryLabel(cat)}
                      </option>
                    ))}
                    <option value="nueva">➕ Nueva categoría...</option>
                  </select>
                  {formData.category === 'nueva' && (
                    <input
                      type="text"
                      placeholder="Nombre de la nueva categoría"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Identificador Único <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.item_key}
                    onChange={(e) => setFormData({ ...formData, item_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="ejemplo: exterior_pintura"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo letras minúsculas, números y guiones bajos
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Texto de la Pregunta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.item_label}
                    onChange={(e) => setFormData({ ...formData, item_label: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="¿Cómo está el estado de la pintura exterior?"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Respuesta
                  </label>
                  <select
                    value={formData.value_type}
                    onChange={(e) => setFormData({ ...formData, value_type: e.target.value as ChecklistValueType })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                  >
                    <option value="select">📋 Selección (Opciones personalizables)</option>
                    <option value="text">📝 Texto libre</option>
                    <option value="number">🔢 Número</option>
                    <option value="boolean">✓ Sí / No</option>
                  </select>
                </div>

                {formData.value_type === 'select' && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Opciones de Selección
                    </label>
                    <div className="space-y-2">
                      {(formData.select_options || ['Bueno', 'Regular', 'Malo']).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(formData.select_options || ['Bueno', 'Regular', 'Malo'])];
                              newOptions[index] = e.target.value;
                              setFormData({ ...formData, select_options: newOptions });
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                            placeholder={`Opción ${index + 1}`}
                          />
                          {(formData.select_options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = (formData.select_options || []).filter((_, i) => i !== index);
                                setFormData({ ...formData, select_options: newOptions });
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      {(formData.select_options || []).length < 5 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              select_options: [...(formData.select_options || []), '']
                            });
                          }}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#0029D4] hover:text-[#0029D4] transition"
                        >
                          + Agregar Opción
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mínimo de Fotos Requeridas
                  </label>
                  <input
                    type="number"
                    value={formData.min_photos}
                    onChange={(e) => setFormData({ ...formData, min_photos: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    min="0"
                    max="20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número mínimo de fotos que debe capturar el revisor
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-white/50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_photo}
                    onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })}
                    className="w-5 h-5 text-[#0029D4] rounded focus:ring-2 focus:ring-[#0029D4]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    📷 Requiere Foto
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_video}
                    onChange={(e) => setFormData({ ...formData, requires_video: e.target.checked })}
                    className="w-5 h-5 text-[#0029D4] rounded focus:ring-2 focus:ring-[#0029D4]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🎥 Requiere Video
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSave(formData)}
                  disabled={!formData.category || !formData.item_key || !formData.item_label}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0029D4] text-white rounded-lg hover:bg-[#0021A0] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Save size={20} />
                  Guardar Pregunta
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay preguntas configuradas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza agregando tu primera pregunta al checklist
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition"
            >
              <Plus size={20} />
              Agregar Primera Pregunta
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category, catIndex) => {
            const categoryItems = templates.filter((t) => t.category === category);
            const isExpanded = expandedCategories.has(category);

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.05 }}
                draggable
                onDragStart={() => handleDragStart(category)}
                onDragOver={(e) => handleDragOver(e, category)}
                onDragEnd={handleDragEnd}
                className={`cursor-move ${draggedCategory === category ? 'opacity-50' : ''}`}
              >
                <Card className="overflow-hidden">
                  <div className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                      </div>
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {getCategoryLabel(category)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {categoryItems.length} {categoryItems.length === 1 ? 'pregunta' : 'preguntas'} • Posición {catIndex + 1}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="p-2 hover:bg-white/50 rounded-lg transition"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={24} className="text-gray-400" />
                      </motion.div>
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200"
                      >
                        <div className="divide-y divide-gray-100">
                          {categoryItems.map((template, idx) => {
                            const isEditing = editingId === template.id;
                            const editingData = isEditing ? formData : template;

                            return (
                              <motion.div
                                key={template.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="p-5 hover:bg-gray-50 transition"
                              >
                                {isEditing ? (
                                  <div className="space-y-4">
                                    <input
                                      type="text"
                                      value={editingData.item_label}
                                      onChange={(e) => setFormData({ ...editingData, item_label: e.target.value })}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium"
                                      placeholder="Texto de la pregunta"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Mínimo de Fotos
                                        </label>
                                        <input
                                          type="number"
                                          value={editingData.min_photos}
                                          onChange={(e) => setFormData({ ...editingData, min_photos: parseInt(e.target.value) || 0 })}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                          min="0"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={editingData.is_mandatory}
                                          onChange={(e) => setFormData({ ...editingData, is_mandatory: e.target.checked })}
                                          className="w-4 h-4 text-[#0029D4] rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Obligatorio</span>
                                      </label>

                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={editingData.requires_photo}
                                          onChange={(e) => setFormData({ ...editingData, requires_photo: e.target.checked })}
                                          className="w-4 h-4 text-[#0029D4] rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Req. Foto</span>
                                      </label>

                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={editingData.requires_video}
                                          onChange={(e) => setFormData({ ...editingData, requires_video: e.target.checked })}
                                          className="w-4 h-4 text-[#0029D4] rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Req. Video</span>
                                      </label>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingId(null);
                                          resetForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        onClick={() => handleSave(editingData)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0029D4] text-white rounded-lg hover:bg-[#0021A0] transition"
                                      >
                                        <Save size={18} />
                                        Guardar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-start gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                          {getValueTypeIcon(template.value_type)}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 mb-1">
                                            {template.item_label}
                                          </h4>
                                          <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono">
                                              {template.item_key}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                              {getValueTypeLabel(template.value_type)}
                                            </span>
                                            {template.is_mandatory && (
                                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                                                Obligatorio
                                              </span>
                                            )}
                                            {template.requires_photo && (
                                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                📷 Foto
                                              </span>
                                            )}
                                            {template.requires_video && (
                                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                                🎥 Video
                                              </span>
                                            )}
                                            {template.min_photos > 0 && (
                                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
                                                Mín. {template.min_photos} fotos
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                          setEditingId(template.id!);
                                          setFormData(template);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Editar"
                                      >
                                        <Edit size={18} />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(template.id!)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Eliminar"
                                      >
                                        <Trash2 size={18} />
                                      </motion.button>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, AlertCircle, Camera, Video, X, CheckCircle2, Grid3x3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CHECKLIST_TEMPLATE, type ChecklistCategory } from '../../types/checklist';
import { db } from '../../lib/db';
import { checklistRepository } from '../../repositories/ChecklistRepository';
import { getCategoryOrder, sortCategoriesByOrder } from '../../lib/checklistOrder';
import { EnhancedProgressIndicator } from './EnhancedProgressIndicator';

interface ChecklistScreenProps {
  reviewId: string;
  onItemComplete?: (itemKey: string) => void;
  onItemUpdate?: () => void;
}

export function ChecklistScreen({ reviewId, onItemComplete, onItemUpdate }: ChecklistScreenProps) {
  // Queries to Local DB (Reactive!)
  const savedItems = useLiveQuery(
    () => db.checklistItems.where('review_id').equals(reviewId).toArray(),
    [reviewId]
  );

  const allMedia = useLiveQuery(
    () => db.media.where('review_id').equals(reviewId).filter(m => !m.is_deleted).toArray(),
    [reviewId]
  );

  const [orderedCategories, setOrderedCategories] = useState<ChecklistCategory[]>(CHECKLIST_TEMPLATE);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Create Maps for easier lookup
  const itemsMap = (savedItems || []).reduce((acc, item) => {
    acc[item.item_key] = item;
    return acc;
  }, {} as Record<string, any>);

  const photos = (allMedia || []).filter(m => m.media_type === 'photo');
  const videos = (allMedia || []).filter(m => m.media_type === 'video');

  const [currentValue, setCurrentValue] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Driving Timer Logic States (Simplified context for offline refactor)
  const isDrivingTimerActive = false;

  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'item'>('categories');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = orderedCategories[currentCategoryIndex];
  const currentItem = currentCategory.items[currentItemIndex];
  const totalItems = orderedCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = Object.keys(itemsMap).length;

  const currentItemId = itemsMap[currentItem.key]?.id;
  const currentItemPhotos = photos.filter((p) => p.checklist_item_id && p.checklist_item_id === currentItemId);
  const currentItemVideos = videos.filter((v) => v.checklist_item_id && v.checklist_item_id === currentItemId);

  // Stats Logic - Recalculate based on current Items
  const getMandatoryStats = () => {
    const allMandatory = orderedCategories.flatMap((cat) =>
      cat.items.filter((item) => item.isMandatory)
    );
    const completedMandatory = allMandatory.filter((item) => itemsMap[item.key]).length;
    return { completed: completedMandatory, total: allMandatory.length };
  };

  const mandatoryStats = getMandatoryStats();

  // Load Categories & Initial Navigation
  useEffect(() => {
    const init = async () => {
      const categories = await loadCategoryOrder();
      setOrderedCategories(categories);
    };
    init();
  }, []);

  // Update current value when item changes or DB updates
  useEffect(() => {
    const saved = itemsMap[currentItem.key];
    if (saved) {
      if (saved.value_text) setCurrentValue(saved.value_text);
      else if (saved.value_select !== undefined) setCurrentValue(String(saved.value_select));
      else if (saved.value_boolean !== undefined) setCurrentValue(String(saved.value_boolean));
      else if (saved.value) setCurrentValue(saved.value);
      else setCurrentValue('');

      setCurrentNotes(saved.notes || '');
    } else {
      setCurrentValue('');
      setCurrentNotes('');
    }
  }, [currentItem.key, savedItems]);

  async function loadCategoryOrder() {
    try {
      const order = await getCategoryOrder();
      return sortCategoriesByOrder(CHECKLIST_TEMPLATE, order);
    } catch (e) {
      return CHECKLIST_TEMPLATE;
    }
  }

  const saveCurrentItem = async (showMessage = true) => {
    if (!currentValue && !currentItem.isMandatory) return;

    setSaving(true);
    try {
      await checklistRepository.saveItem(reviewId, currentItem.key, currentValue, currentNotes);

      if (showMessage) toast.success('Guardado');
      onItemUpdate?.();

      const updatedItem = await db.checklistItems.where({ review_id: reviewId, item_key: currentItem.key }).first();
      return updatedItem?.id;
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    let itemId = itemsMap[currentItem.key]?.id;
    if (!itemId) {
      itemId = await saveCurrentItem(false);
    }
    if (!itemId) return;

    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await checklistRepository.saveMedia(reviewId, itemId, file, 'photo');
      }
      toast.success(`${files.length} fotos guardadas`);
      onItemUpdate?.();
    } catch (err) {
      console.error(err);
      toast.error('Error guardando fotos');
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    let itemId = itemsMap[currentItem.key]?.id;
    if (!itemId) {
      itemId = await saveCurrentItem(false);
    }
    if (!itemId) return;

    setUploading(true);
    try {
      const file = e.target.files[0];
      await checklistRepository.saveMedia(reviewId, itemId, file, 'video');
      toast.success('Video guardado');
      onItemUpdate?.();
    } catch (err) {
      toast.error('Error guardando video');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (id: string) => {
    await db.media.update(id, { is_deleted: true, sync_status: 'pending_delete' });
    onItemUpdate?.();
  };

  const handleDeleteVideo = async (id: string) => {
    await db.media.update(id, { is_deleted: true, sync_status: 'pending_delete' });
    onItemUpdate?.();
  };

  const handleNext = async () => {
    await saveCurrentItem();
    if (currentItemIndex < currentCategory.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else if (currentCategoryIndex < orderedCategories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentItemIndex(0);
    } else {
      toast.success('Checklist finalizado');
    }
  };

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentItemIndex(orderedCategories[currentCategoryIndex - 1].items.length - 1);
    }
  };

  const jumpToCategory = (index: number) => {
    setCurrentCategoryIndex(index);
    setCurrentItemIndex(0);
    setViewMode('item');
  };

  // --- RENDER ---
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Toaster position="top-center" />

      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <EnhancedProgressIndicator
          completedItems={completedItems}
          totalItems={totalItems}
          completedMandatory={mandatoryStats.completed}
          totalMandatory={mandatoryStats.total}
          currentCategoryLabel={currentCategory.label}
          currentItemIndex={currentItemIndex}
          currentCategoryItemCount={currentCategory.items.length}
        />
      </div>

      {viewMode === 'categories' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderedCategories.map((cat, idx) => {
            const catItems = cat.items;
            const completed = catItems.filter(i => itemsMap[i.key]).length;
            return (
              <div key={cat.key} onClick={() => jumpToCategory(idx)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-blue-500 transition-all">
                <h3 className="font-bold text-lg mb-2">{cat.label}</h3>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${(completed / catItems.length) * 100}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{completed}/{catItems.length} completados</p>
              </div>
            )
          })}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCategoryIndex}-${currentItemIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-500 font-medium">{currentCategory.label}</span>
                  <h2 className="text-xl font-bold text-gray-900">{currentItem.label}</h2>
                </div>
                {currentItem.isMandatory && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Obligatorio</span>}
              </div>

              <div className="mb-6 space-y-4">
                {currentItem.valueType === 'boolean' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentValue('true')}
                      className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all ${currentValue === 'true' ? 'bg-green-50 border-green-500 text-green-700 font-bold shadow-sm' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Sí / Correcto</div>
                    </button>
                    <button
                      onClick={() => setCurrentValue('false')}
                      className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all ${currentValue === 'false' ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-center gap-2"><AlertCircle size={20} /> No / Defectuoso</div>
                    </button>
                  </div>
                )}

                {currentItem.valueType === 'select' && (
                  <div className="grid grid-cols-1 gap-2">
                    {currentItem.selectOptions?.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setCurrentValue(String(opt.value))}
                        className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all ${currentValue === String(opt.value) ? 'bg-blue-50 border-blue-600 text-blue-800 font-semibold' : 'border-gray-100 text-gray-700 hover:border-gray-300'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentItem.valueType === 'text' && (
                  <textarea
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="Escribe aquí..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
                  <textarea
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Observaciones..."
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera size={18} className="text-gray-500" /> Fotos y Evidencias
                </h3>

                {currentItemPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    {currentItemPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
                        <img src={photo.file_blob ? URL.createObjectURL(photo.file_blob) : photo.file_url || ''} className="w-full h-full object-cover" alt="evidence" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => handleDeletePhoto(photo.id)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"><X size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => photoInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium border border-blue-200 transition-colors">
                    <Camera size={18} /> {uploading ? 'Subiendo...' : 'Añadir Foto'}
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />

                  {currentItem.requiresVideo && (
                    <>
                      <button onClick={() => videoInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium border border-purple-200 transition-colors">
                        <Video size={18} /> Añadir Video
                      </button>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </>
                  )}
                </div>

                {currentItemVideos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {currentItemVideos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Video size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Video adjunto</span>
                        </div>
                        <button onClick={() => handleDeleteVideo(video.id)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200 fixed bottom-0 left-0 right-0 max-w-4xl mx-auto z-10 pb-8 sm:pb-4">
              <button onClick={handlePrev} disabled={currentCategoryIndex === 0 && currentItemIndex === 0} className="flex items-center gap-2 text-gray-600 disabled:opacity-50 font-medium px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors">
                <ChevronLeft size={20} /> Anterior
              </button>

              <div className="flex gap-2">
                <button onClick={() => setViewMode('categories')} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"><Grid3x3 size={24} /></button>
                <button onClick={handleNext} className="flex items-center gap-2 bg-[#0029D4] text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:bg-[#0021A0] active:scale-95 transition-all">
                  {currentItemIndex === currentCategory.items.length - 1 && currentCategoryIndex === orderedCategories.length - 1 ? 'Finalizar' : 'Siguiente'} <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

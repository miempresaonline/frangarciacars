import { supabase } from './supabase';
import { ChecklistCategory } from '../types/checklist';

export interface CategoryOrder {
  category_key: string;
  order_position: number;
}

export async function getCategoryOrder(): Promise<CategoryOrder[]> {
  const { data, error } = await supabase
    .from('checklist_category_order')
    .select('category_key, order_position')
    .order('order_position', { ascending: true });

  if (error) {
    console.error('Error fetching category order:', error);
    return [];
  }

  return data || [];
}

export async function updateCategoryOrder(orders: CategoryOrder[]): Promise<void> {
  const updates = orders.map((order) => ({
    category_key: order.category_key,
    order_position: order.order_position,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('checklist_category_order')
      .upsert(update, { onConflict: 'category_key' });

    if (error) {
      console.error('Error updating category order:', error);
      throw error;
    }
  }
}

export function sortCategoriesByOrder(
  categories: ChecklistCategory[],
  orderMap: CategoryOrder[]
): ChecklistCategory[] {
  if (orderMap.length === 0) {
    return categories.sort((a, b) => a.order - b.order);
  }

  const orderLookup = new Map(
    orderMap.map((o) => [o.category_key, o.order_position])
  );

  return [...categories].sort((a, b) => {
    const orderA = orderLookup.get(a.key) ?? a.order;
    const orderB = orderLookup.get(b.key) ?? b.order;
    return orderA - orderB;
  });
}

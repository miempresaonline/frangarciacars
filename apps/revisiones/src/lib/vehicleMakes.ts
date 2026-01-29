import { supabase } from './supabase';

export interface VehicleMake {
  id: string;
  name: string;
  name_normalized: string;
  logo_url?: string;
  relevance?: number;
}

export async function searchVehicleMakes(query: string, limit: number = 10): Promise<VehicleMake[]> {
  if (!query || query.trim().length === 0) {
    const { data, error } = await supabase
      .from('vehicle_makes')
      .select('id, name, name_normalized, logo_url')
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching vehicle makes:', error);
      return [];
    }

    return data || [];
  }

  const { data, error } = await supabase.rpc('search_vehicle_makes', {
    search_query: query.trim(),
    result_limit: limit,
  });

  if (error) {
    console.error('Error searching vehicle makes:', error);
    return [];
  }

  return data || [];
}

export async function getVehicleMakeById(id: string): Promise<VehicleMake | null> {
  const { data, error } = await supabase
    .from('vehicle_makes')
    .select('id, name, name_normalized, logo_url')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching vehicle make:', error);
    return null;
  }

  return data;
}

export async function getAllVehicleMakes(): Promise<VehicleMake[]> {
  const { data, error } = await supabase
    .from('vehicle_makes')
    .select('id, name, name_normalized, logo_url')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching all vehicle makes:', error);
    return [];
  }

  return data || [];
}

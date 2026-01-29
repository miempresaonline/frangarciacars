import { supabase } from './supabase';
import { logActivity } from './auth';
import type { UserRole, Profile } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  location?: string;
  assigned_admin_id?: string;
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  location?: string;
  active?: boolean;
  assigned_admin_id?: string;
}

export async function createUserWithProfile(data: CreateUserData) {
  const { data: result, error } = await supabase.functions.invoke('create-user', {
    body: {
      email: data.email,
      password: data.password,
      role: data.role,
      full_name: data.full_name,
      phone: data.phone,
      location: data.location,
      assigned_admin_id: data.assigned_admin_id,
    },
  });

  if (error) throw error;
  if (!result?.success) {
    throw new Error(result?.error || 'User creation failed');
  }

  return result.user;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function getUsersByRole(role: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .eq('active', true)
    .order('full_name');

  if (error) throw error;
  return data as Profile[];
}

export async function updateUserProfile(userId: string, updates: UpdateUserData) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;

  await logActivity(
    'user_updated',
    `Updated user profile: ${userId}`
  );
}

export async function toggleUserActive(userId: string, active: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ active })
    .eq('id', userId);

  if (error) throw error;

  await logActivity(
    active ? 'user_activated' : 'user_deactivated',
    `User ${userId} ${active ? 'activated' : 'deactivated'}`
  );
}

export async function getAdminUsers() {
  return getUsersByRole('admin');
}

export async function getReviewerUsers() {
  return getUsersByRole('reviewer');
}

export async function getClientUsers() {
  return getUsersByRole('client');
}

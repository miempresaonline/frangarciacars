import { supabase } from './supabase';
import type { AuthUser, UserRole } from '../types';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      throw new Error('Error al verificar el perfil del usuario');
    }

    if (!profile) {
      await supabase.auth.signOut();
      throw new Error('Perfil de usuario no encontrado');
    }

    if (!profile.active) {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
    }
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error getting auth user:', userError);
    return null;
  }

  if (!user) {
    console.log('No authenticated user found');
    return null;
  }

  console.log('Auth user found:', user.id, user.email);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  if (!profile) {
    console.error('Profile not found for user:', user.id);
    return null;
  }

  console.log('Profile loaded:', profile.role, profile.full_name);

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    profile: {
      full_name: profile.full_name,
      phone: profile.phone || undefined,
      location: profile.location || undefined,
      assigned_admin_id: profile.assigned_admin_id || undefined,
    },
  };
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  phone?: string,
  assignedAdminId?: string,
  location?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('User creation failed');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    role,
    full_name: fullName,
    email,
    phone,
    assigned_admin_id: assignedAdminId,
    location,
    active: true,
    metadata: {},
  });

  if (profileError) throw profileError;

  return data.user;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    phone?: string;
    location?: string;
    active?: boolean;
  }
) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function logActivity(
  action: string,
  description?: string,
  reviewId?: string,
  metadata?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    review_id: reviewId,
    action,
    description,
    metadata: metadata || {},
  });
}

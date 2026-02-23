import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@supabase/supabase-js';

export const authService = {
  // Initialize auth state
  async initialize() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await this.loadProfile(user);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().signOut();
      }
    });

    useAuthStore.getState().setLoading(false);
  },

  // Load user profile
  async loadProfile(user: User) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Creating profile for user:', user.id);
          return await this.createProfile(user);
        }
        return null;
      }

      if (profile) {
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setProfile(profile);
      }
      
      return profile;
    } catch (err) {
      console.error('Error loading profile:', err);
      return null;
    }
  },

  // Create user profile
  async createProfile(user: User) {
    try {
      const { data: profile, error } = await (supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'viewer' as any,
          organization_id: null,
        } as any)
        .select()
        .single() as any);

      if (error) {
        // If profile already exists (duplicate key), that's okay - use the existing one
        if (error.code === '23505') {
          console.log('Profile already exists for user:', user.id);
          // Create a basic profile object from auth user
          const basicProfile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'viewer',
            organization_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setProfile(basicProfile as any);
          return basicProfile;
        }
        console.error('Profile creation error:', error);
        return null;
      }

      if (profile) {
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setProfile(profile);
      }

      return profile;
    } catch (err) {
      console.error('Error creating profile:', err);
      return null;
    }
  },

  // Sign up
  async signUp(email: string, password: string, fullName: string) {
    void email;
    void password;
    void fullName;
    throw new Error('Self-registration is disabled. Please contact your administrator to create your account.');
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await this.loadProfile(data.user);
    }

    return data;
  },

  // Temporary sign in (development only)
  async temporarySignIn() {
    // For development: use a test account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'dev@structra.local',
      password: 'password123',
    });

    if (error) throw error;

    if (data.user) {
      await this.loadProfile(data.user);
    }

    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    useAuthStore.getState().signOut();
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // Get current user
  getCurrentUser() {
    return useAuthStore.getState().user;
  },

  // Get current profile
  getCurrentProfile() {
    return useAuthStore.getState().profile;
  },

  // Check if user is admin
  isAdmin() {
    const profile = this.getCurrentProfile();
    return profile?.role === 'admin';
  },

  // Check if user is engineer or above
  isEngineer() {
    const profile = this.getCurrentProfile();
    return profile?.role === 'admin' || profile?.role === 'engineer';
  },
};

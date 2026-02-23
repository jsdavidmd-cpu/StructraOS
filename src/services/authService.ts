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

  // Create dev account (development only)
  async createDevAccount() {
    const devEmail = 'dev@example.com';
    const devPassword = 'password123';
    const devName = 'Dev User';

    try {
      console.log('Creating dev account...');
      
      const { data, error } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          data: {
            full_name: devName,
          },
        },
      });

      if (error) throw error;

      console.log('Dev account created, user:', data.user?.id);
      
      // Create profile
      if (data.user?.id) {
        const { error: profileError } = await (supabase
          .from('profiles') as any)
          .insert({
            id: data.user.id,
            email: devEmail,
            full_name: devName,
            role: 'admin',
            organization_id: '795acdd9-9a69-4699-aaee-2787f7babce0',
          });

        if (profileError && !profileError.message?.includes('duplicate')) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error creating dev account:', err);
      throw err;
    }
  },

  // Temporary sign in (development only)
  async temporarySignIn() {
    // For development: simple direct login attempt
    const devEmail = 'dev@example.com';
    const devPassword = 'password123';

    try {
      console.log('Dev login: attempting sign in...');
      
      // Attempt direct sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

      if (error) {
        console.error('Dev sign-in failed:', error.message);
        
        // Try to create the account if it doesn't exist
        if (error.message?.includes('Invalid login credentials')) {
          console.log('Dev account not found, attempting to create...');
          try {
            await this.createDevAccount();
            console.log('Dev account created, retrying sign-in...');
            
            // Try sign-in again
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: devEmail,
              password: devPassword,
            });
            
            if (retryError) throw retryError;
            
            if (retryData.user) {
              await this.loadProfile(retryData.user);
            }
            return retryData;
          } catch (createErr: any) {
            throw new Error(`Failed to create dev account: ${createErr.message}`);
          }
        }
        
        throw error;
      }

      console.log('Dev login: sign-in successful, loading profile...');
      if (data.user) {
        await this.loadProfile(data.user);
      }

      console.log('Dev login complete!');
      return data;
    } catch (err: any) {
      console.error('Temporary login error:', err);
      throw new Error(err.message || 'Dev login failed');
    }
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

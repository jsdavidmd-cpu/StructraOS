import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  organization_id: string | null;
  email: string;
  full_name: string | null;
  role: 'admin' | 'project_manager' | 'engineer' | 'quantity_surveyor' | 'foreman' | 'viewer';
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null, profile: null }),
    }),
    {
      name: 'structra-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);

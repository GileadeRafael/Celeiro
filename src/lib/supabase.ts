import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Lazy initialization of the real Supabase client
let supabaseInstance: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
}

// Simulated Auth Database stored in localStorage to match Supabase behavior when unconfigured
interface MockUser {
  id: string;
  email: string;
  name: string;
  confirmed: boolean;
  passwordHash: string; // Simple mock string matching
  photoUrl: string;
}

export const mockAuthService = {
  getUsers(): MockUser[] {
    const data = localStorage.getItem('celeiro_mock_users');
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: MockUser[]) {
    localStorage.setItem('celeiro_mock_users', JSON.stringify(users));
  },

  getCurrentUser(): { name: string; email: string; photoUrl: string; confirmed: boolean } | null {
    const saved = localStorage.getItem('celeiro_user_profile');
    return saved ? JSON.parse(saved) : null;
  },

  setCurrentUser(user: { name: string; email: string; photoUrl: string; confirmed: boolean } | null) {
    if (user) {
      localStorage.setItem('celeiro_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('celeiro_user_profile');
    }
  },

  async signUp(email: string, password: string, name: string): Promise<{ data: any; error: any }> {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { data: null, error: { message: 'Este e-mail já está sendo utilizado.' } };
    }

    const newUser: MockUser = {
      id: Math.random().toString(36).substring(2, 11),
      email,
      name: name || email.split('@')[0],
      confirmed: true, // Auto confirmed as email verification is removed
      passwordHash: password, // Real-life password would be hashed
      photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`
    };

    users.push(newUser);
    this.saveUsers(users);

    return { 
      data: { user: { id: newUser.id, email: newUser.email, name: newUser.name, confirmed: true } }, 
      error: null 
    };
  },

  async signIn(email: string, password: string): Promise<{ data: any; error: any }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return { data: null, error: { message: 'E-mail ou senha incorretos.' } };
    }

    const profile = {
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      confirmed: true
    };
    this.setCurrentUser(profile);

    return { data: { user: profile }, error: null };
  },

  async verifyEmailMock(email: string): Promise<boolean> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex !== -1) {
      users[userIndex].confirmed = true;
      this.saveUsers(users);
      return true;
    }
    return false;
  },

  async updateProfile(email: string, photoUrl: string, newPassword?: string): Promise<{ data: any; error: any }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex !== -1) {
      users[userIndex].photoUrl = photoUrl;
      if (newPassword) {
        users[userIndex].passwordHash = newPassword;
      }
      this.saveUsers(users);

      const updatedProfile = {
        name: users[userIndex].name,
        email: email,
        photoUrl: photoUrl,
        confirmed: true
      };
      this.setCurrentUser(updatedProfile);

      return { data: { user: updatedProfile }, error: null };
    }
    return { data: null, error: { message: 'Usuário não encontrado.' } };
  }
};

// --- USER DATA PERSISTENCE SERVICE ---
export const userDataService = {
  // Helpers to read/write local storage for fallback/unconfigured modes
  getLocalData(email: string) {
    const key = `celeiro_user_${email.toLowerCase()}_data`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  saveLocalData(email: string, data: any) {
    const key = `celeiro_user_${email.toLowerCase()}_data`;
    const current = this.getLocalData(email) || {};
    const updated = { ...current, ...data };
    localStorage.setItem(key, JSON.stringify(updated));
  },

  // GET FAVORITES
  async getFavorites(email: string): Promise<string[]> {
    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('celeiro_user_data')
          .select('favorites')
          .eq('user_email', email.toLowerCase())
          .single();
        
        if (data && !error) {
          return data.favorites || [];
        }
      } catch (e) {
        console.warn('Supabase getFavorites failed, falling back to local storage', e);
      }
    }
    const local = this.getLocalData(email);
    return local?.favorites || [];
  },

  // SAVE FAVORITES
  async saveFavorites(email: string, favorites: string[]): Promise<void> {
    // 1. Always save locally first for instant access
    this.saveLocalData(email, { favorites });

    // 2. Save in Supabase
    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('celeiro_user_data')
          .upsert({ 
            user_email: email.toLowerCase(), 
            favorites 
          }, { onConflict: 'user_email' });
        
        if (error) {
          console.error('Supabase saveFavorites upsert error:', error);
        }
      } catch (e) {
        console.warn('Supabase saveFavorites failed:', e);
      }
    }
  },

  // GET HISTORY
  async getHistory(email: string): Promise<string[]> {
    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('celeiro_user_data')
          .select('playback_history')
          .eq('user_email', email.toLowerCase())
          .single();
        
        if (data && !error) {
          return data.playback_history || [];
        }
      } catch (e) {
        console.warn('Supabase getHistory failed, falling back to local storage', e);
      }
    }
    const local = this.getLocalData(email);
    return local?.playback_history || [];
  },

  // SAVE HISTORY
  async saveHistory(email: string, history: string[]): Promise<void> {
    this.saveLocalData(email, { playback_history: history });

    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('celeiro_user_data')
          .upsert({ 
            user_email: email.toLowerCase(), 
            playback_history: history 
          }, { onConflict: 'user_email' });
        
        if (error) {
          console.error('Supabase saveHistory upsert error:', error);
        }
      } catch (e) {
        console.warn('Supabase saveHistory failed:', e);
      }
    }
  },

  // GET PLAYLISTS
  async getPlaylists(email: string): Promise<any[]> {
    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('celeiro_user_data')
          .select('custom_playlists')
          .eq('user_email', email.toLowerCase())
          .single();
        
        if (data && !error) {
          return data.custom_playlists || [];
        }
      } catch (e) {
        console.warn('Supabase getPlaylists failed, falling back to local storage', e);
      }
    }
    const local = this.getLocalData(email);
    return local?.custom_playlists || [];
  },

  // SAVE PLAYLISTS
  async savePlaylists(email: string, playlists: any[]): Promise<void> {
    this.saveLocalData(email, { custom_playlists: playlists });

    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('celeiro_user_data')
          .upsert({ 
            user_email: email.toLowerCase(), 
            custom_playlists: playlists 
          }, { onConflict: 'user_email' });
        
        if (error) {
          console.error('Supabase savePlaylists upsert error:', error);
        }
      } catch (e) {
        console.warn('Supabase savePlaylists failed:', e);
      }
    }
  }
};


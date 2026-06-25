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
  }
};

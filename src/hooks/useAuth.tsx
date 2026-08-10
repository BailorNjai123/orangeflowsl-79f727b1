import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'planning_team' | 'procurement_team' | 'power_team' | 'rollout_team' | 'project_team';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: { full_name: string; email: string; phone: string; department: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_KEY = 'orangeflow-auth-cache';

interface AuthCache {
  user: User | null;
  role: AppRole | null;
  profile: AuthContextType['profile'];
}

function readCache(): AuthCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthCache) : null;
  } catch {
    return null;
  }
}

function writeCache(cache: AuthCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string, sessionUser: User | null) => {
    try {
      const [roleRes, profileRes] = await Promise.all([
        supabase.rpc('get_user_role', { _user_id: userId }),
        supabase.from('profiles').select('full_name, email, phone, department').eq('user_id', userId).single(),
      ]);
      const nextRole = (roleRes.data as AppRole | null) ?? null;
      const nextProfile = profileRes.data ?? null;
      if (nextRole) setRole(nextRole);
      if (nextProfile) setProfile(nextProfile);
      const cached = readCache();
      writeCache({
        user: sessionUser ?? cached?.user ?? null,
        role: nextRole ?? cached?.role ?? null,
        profile: nextProfile ?? cached?.profile ?? null,
      });
    } catch {
      // Offline or transient failure — keep whatever we already have cached.
      const cached = readCache();
      if (cached) {
        if (cached.role) setRole(cached.role);
        if (cached.profile) setProfile(cached.profile);
      }
    }
  };

  /** Restore the last known identity so the app is usable without a network. */
  const restoreFromCache = () => {
    const cached = readCache();
    if (!cached?.user) return false;
    setUser(cached.user);
    setRole(cached.role);
    setProfile(cached.profile);
    return true;
  };

  useEffect(() => {
    // Optimistically restore immediately — prevents an offline reload from
    // bouncing an authenticated user back to the login screen.
    restoreFromCache();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        writeCache({ user: session.user, role: readCache()?.role ?? null, profile: readCache()?.profile ?? null });
        setTimeout(() => fetchUserData(session.user.id, session.user), 0);
      } else if (event === 'SIGNED_OUT' && !isOffline()) {
        localStorage.removeItem(CACHE_KEY);
        setUser(null);
        setRole(null);
        setProfile(null);
      } else if (!restoreFromCache()) {
        setUser(null);
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id, session.user);
      } else {
        restoreFromCache();
      }
      setLoading(false);
    }).catch(() => {
      restoreFromCache();
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

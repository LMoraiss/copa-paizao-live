import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createProfileIfNeeded = async (user: User) => {
    try {
      console.log('🔍 createProfileIfNeeded called for user:', user.id, user.email);

      // First try to fetch existing profile
      console.log('📋 Attempting to fetch existing profile...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('📋 Fetch result:', { existingProfile, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', fetchError);
        throw new Error('Erro ao carregar perfil');
      }

      if (existingProfile) {
        console.log('✅ Found existing profile:', existingProfile);
        return existingProfile;
      }

      // If no profile exists, create one
      console.log('📝 Creating new profile for user:', user.id);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          role: 'user'
        })
        .select()
        .single();

      console.log('📝 Create result:', { newProfile, createError });

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        throw new Error('Erro ao criar perfil');
      }

      console.log('✅ Successfully created new profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('❌ createProfileIfNeeded error:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('📋 Initial session:', session);
        setSession(session);

        if (session?.user) {
          console.log('👤 User found in session, creating/fetching profile...');
          setUser(session.user);
          try {
            const profile = await createProfileIfNeeded(session.user);
            if (mounted) {
              setProfile(profile);
            }
          } catch (error) {
            console.error('❌ Error loading profile:', error);
            if (mounted) {
              setProfile(null);
              toast({
                title: "Erro de perfil",
                description: "Erro ao carregar perfil do usuário.",
                variant: "destructive",
              });
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          toast({
            title: "Erro de autenticação",
            description: "Erro ao inicializar autenticação. Tente novamente.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session);
        
        if (!mounted) return;
        
        setSession(session);

        if (session?.user) {
          setUser(session.user);
          
          // Use setTimeout to prevent blocking the auth callback
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const profile = await createProfileIfNeeded(session.user);
              if (mounted) {
                setProfile(profile);
              }
            } catch (error) {
              console.error('❌ Error handling auth state change:', error);
              if (mounted) {
                setProfile(null);
                toast({
                  title: "Erro de perfil",
                  description: "Erro ao carregar perfil do usuário.",
                  variant: "destructive",
                });
              }
            }
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // THEN initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        let errorMessage = 'Erro ao fazer login';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha inválidos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        }
        
        return { error: errorMessage };
      }

      console.log('✅ Sign in successful:', data);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });

      return {};
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 Attempting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        let errorMessage = 'Erro ao criar conta';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        }
        
        return { error: errorMessage };
      }

      console.log('✅ Sign up successful:', data);
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar a conta e fazer login.",
      });

      return {};
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      console.log('✅ Sign out successful');
      toast({
        title: "Logout realizado!",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('❌ Unexpected sign out error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
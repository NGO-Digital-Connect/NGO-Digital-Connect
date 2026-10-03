import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { UserAccount, UserRole, UserProfile } from '../types/models';
import { StorageService } from '../services/storageService';
import { SupabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_USERS } from '../data/seedData';

export type RealtimeStatus = 'LIVE' | 'SYNCED' | 'RECONNECTING' | 'OFFLINE';

interface AuthContextType {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  isLoadingAuth: boolean;
  authError: string | null;
  login: (email: string, password?: string) => Promise<UserAccount>;
  loginAsRole: (role: UserRole) => Promise<void>;
  register: (role: UserRole, email: string, password: string, profile: UserProfile) => Promise<UserAccount>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  can: (action: string) => boolean;
  isSupabaseConnected: boolean;
  realtimeStatus: RealtimeStatus;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => StorageService.getUsers());
  const allUsersRef = useRef<UserAccount[]>(allUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => StorageService.getCurrentUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(
    isSupabaseConfigured ? 'SYNCED' : 'OFFLINE'
  );

  // 1. Initial Load & Session Restoration
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoadingAuth(true);

      if (!isSupabaseConfigured) {
        setIsLoadingAuth(false);
        setRealtimeStatus('OFFLINE');
        return;
      }

      try {
        // Fetch authoritative profiles list from PostgreSQL
        const dbUsers = await SupabaseService.getUsers();
        if (isMounted && dbUsers && dbUsers.length > 0) {
          setAllUsers(dbUsers);
          setIsSupabaseConnected(true);
        }

        // Check active Supabase session
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn('[AuthContext] Session restore notice:', sessionErr.message);
        }

        if (session?.user && isMounted) {
          const authUser = await SupabaseService.getUserById(session.user.id);
          if (authUser) {
            setCurrentUser(authUser);
            StorageService.saveCurrentUser(authUser);
          } else {
            // Find by email in loaded users
            const matchedByEmail = dbUsers.find(
              u => u.email.toLowerCase() === session.user.email?.toLowerCase()
            );
            if (matchedByEmail) {
              setCurrentUser(matchedByEmail);
              StorageService.saveCurrentUser(matchedByEmail);
            }
          }
        } else {
          // If no active session, restore saved persona or first seed user
          const savedCurrent = StorageService.getCurrentUser();
          const matched = dbUsers.find(u => u.id === savedCurrent.id || u.role === savedCurrent.role);
          if (matched && isMounted) {
            setCurrentUser(matched);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing auth:', err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    };

    initializeAuth();

    // 2. Auth State Change Listener
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log(`[AuthContext] onAuthStateChange event: ${event}`);

        if (event === 'SIGNED_IN' && session?.user) {
          const freshUser = await SupabaseService.getUserById(session.user.id);
          if (freshUser && isMounted) {
            setCurrentUser(freshUser);
            StorageService.saveCurrentUser(freshUser);
          }
        } else if (event === 'SIGNED_OUT') {
          const fallback = allUsersRef.current[0] || SEED_USERS[0];
          setCurrentUser(fallback);
          StorageService.saveCurrentUser(fallback);
        }
      }
    );

    // 3. Realtime Profiles Subscription (Detects registrations across browsers)
    let profilesChannel: RealtimeChannel | null = null;
    if (isSupabaseConfigured) {
      profilesChannel = supabase
        .channel('realtime_profiles_stream')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
          },
          async (payload: { eventType: string; new?: { id?: string; email?: string } | null; old?: { id?: string } | null }) => {
            console.log('[AuthContext Realtime] profiles event:', payload.eventType, payload.new?.email);
            if (payload.eventType === 'INSERT' && payload.new?.id) {
              // Fetch full profile with role relations
              const newProfile = await SupabaseService.getUserById(payload.new.id);
              if (newProfile && isMounted) {
                setAllUsers(prev => {
                  const filtered = prev.filter(u => u.id !== newProfile.id);
                  return [newProfile, ...filtered];
                });
                setRealtimeStatus('LIVE');
              }
            } else if (payload.eventType === 'UPDATE' && payload.new?.id) {
              const updatedProfile = await SupabaseService.getUserById(payload.new.id);
              if (updatedProfile && isMounted) {
                setAllUsers(prev => prev.map(u => (u.id === updatedProfile.id ? updatedProfile : u)));
                setCurrentUser(prev => (prev.id === updatedProfile.id ? updatedProfile : prev));
                setRealtimeStatus('LIVE');
              }
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              const oldId = payload.old.id;
              setAllUsers(prev => prev.filter(u => u.id !== oldId));
            }
          }
        )
        .subscribe((status: string) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('LIVE');
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            setRealtimeStatus('RECONNECTING');
          }
        });
    }

    return () => {
      isMounted = false;
      authListener?.unsubscribe();
      if (profilesChannel) {
        supabase.removeChannel(profilesChannel);
      }
    };
  }, []);

  // Sync users to LocalStorage cache buffer (optional offline read cache)
  useEffect(() => {
    allUsersRef.current = allUsers;
    StorageService.saveUsers(allUsers);
  }, [allUsers]);

  // Real Supabase Auth Registration
  const register = async (
    role: UserRole,
    email: string,
    password: string,
    profile: UserProfile
  ): Promise<UserAccount> => {
    setAuthError(null);

    if (!isSupabaseConfigured) {
      // Local fallback mode when Supabase is not yet configured
      const localId = crypto.randomUUID();
      const newUser: UserAccount = {
        id: localId,
        email,
        role,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        profile,
      };

      setAllUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      StorageService.saveCurrentUser(newUser);
      return newUser;
    }

    // 1. Sign up with Supabase Auth (auth.users)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: profile.name,
          role,
          phone: profile.phone || '',
          city: profile.city,
          state: profile.state,
          country: profile.country || 'India',
          organizationName: profile.organizationName || '',
          designation: profile.designation || '',
          registrationNumber: profile.ngoDetails?.registrationNumber,
          mission: profile.ngoDetails?.mission,
          annualBudget: profile.csrDetails?.annualBudget,
          department: profile.governmentDetails?.department,
          availability: profile.volunteerDetails?.availability,
        },
      },
    });

    if (signUpError) {
      console.error('[AuthContext] Registration failed:', signUpError.message);
      setAuthError(signUpError.message);
      throw new Error(signUpError.message);
    }

    const authUserId = authData.user?.id;
    if (!authUserId) {
      const err = 'Registration completed but user ID was not returned by Supabase Auth.';
      setAuthError(err);
      throw new Error(err);
    }

    // 2. Persist role-specific information into normalized child tables
    await SupabaseService.saveRoleDetails(authUserId, role, profile);

    // 3. Fetch authoritative database record created by PostgreSQL trigger
    let realAccount: UserAccount | null = null;
    for (let attempts = 0; attempts < 3; attempts++) {
      realAccount = await SupabaseService.getUserById(authUserId);
      if (realAccount) break;
      await new Promise(res => setTimeout(res, 300));
    }

    if (!realAccount) {
      // Construct fallback record with exact auth UUID if trigger was delayed
      realAccount = {
        id: authUserId,
        email: email.trim(),
        role,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        profile,
      };
    }

    // 4. Update React State with authoritative database record
    setAllUsers(prev => [realAccount!, ...prev.filter(u => u.id !== realAccount!.id)]);
    setCurrentUser(realAccount);
    StorageService.saveCurrentUser(realAccount);

    return realAccount;
  };

  // Real Supabase Auth Login
  const login = async (email: string, password?: string): Promise<UserAccount> => {
    setAuthError(null);

    if (isSupabaseConfigured && password) {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('[AuthContext] Login error:', signInError.message);
        setAuthError(signInError.message);
        throw new Error(signInError.message);
      }

      const userAccount = await SupabaseService.getUserById(authData.user.id);
      if (!userAccount) {
        throw new Error('User profile record not found in Supabase.');
      }

      setCurrentUser(userAccount);
      StorageService.saveCurrentUser(userAccount);
      return userAccount;
    }

    // Fallback: match persona in memory / demo list
    const found = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      StorageService.saveCurrentUser(found);
      return found;
    }

    const notFoundErr = `No user account found for email: ${email}`;
    setAuthError(notFoundErr);
    throw new Error(notFoundErr);
  };

  // 1-Click Role Testing Switcher
  const loginAsRole = async (role: UserRole) => {
    setAuthError(null);
    const found = allUsers.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      StorageService.saveCurrentUser(found);
    }
  };

  // Real Supabase Auth Sign Out
  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[AuthContext] Supabase signOut notice:', e);
      }
    }
    const defaultUser = allUsers[0] || SEED_USERS[0];
    setCurrentUser(defaultUser);
    StorageService.saveCurrentUser(defaultUser);
  };

  const updateProfile = useCallback(async (partialProfile: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          ...partialProfile,
        },
      };
      return updated;
    });

    setAllUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, profile: { ...u.profile, ...partialProfile } } : u))
    );

    // Persist to Supabase
    if (isSupabaseConfigured) {
      await SupabaseService.updateProfile(currentUser.id, partialProfile);
    }
  }, [currentUser.id]);

  const can = (action: string): boolean => {
    const role = currentUser.role;
    switch (action) {
      case 'SUBMIT_CASE':
        return role === 'BENEFICIARY' || role === 'ADMIN';
      case 'MANAGE_CASES':
        return role === 'NGO' || role === 'ADMIN';
      case 'CREATE_PROJECT':
        return role === 'NGO' || role === 'ADMIN';
      case 'CREATE_OPPORTUNITY':
        return role === 'NGO' || role === 'ADMIN';
      case 'APPLY_VOLUNTEER':
        return role === 'VOLUNTEER';
      case 'DONATE_PROJECT':
        return role === 'DONOR' || role === 'CSR';
      case 'LOG_UTILIZATION':
        return role === 'NGO';
      case 'MONITOR_INSTITUTION':
        return role === 'GOVERNMENT' || role === 'ADMIN';
      case 'VERIFY_NGO':
      case 'MODERATE_CONTENT':
        return role === 'ADMIN';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoadingAuth,
        authError,
        login,
        loginAsRole,
        register,
        logout,
        updateProfile,
        can,
        isSupabaseConnected,
        realtimeStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

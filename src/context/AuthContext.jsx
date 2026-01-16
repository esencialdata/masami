import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // 1. Optimistic Init (Check LocalStorage synchronously)
    // Supabase keys are usually `sb-<projectRef>-auth-token`
    // We can't know the project ref easily here without parsing URL/Env, but we can check if we have ANY session in memory
    // Actually, simply defaulting 'loading' to false if we suspect we are logged in from a previous run is safer.
    // Better strategy: "Assume logged in" if we find our custom cache keys? No, strictly auth.
    // Let's use a heuristic: Default loading to TRUE only if NO local storage keys exist at all?
    // Safer: Just run getSession but DO NOT block the UI if it hangs.

    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // Will attempt to unblock fast
    const [profile, setProfile] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

    useEffect(() => {
        const hash = window.location.hash;
        const search = window.location.search;
        const isRedirect = (hash && (
            hash.includes('access_token') ||
            hash.includes('type=recovery') ||
            hash.includes('type=signup') ||
            hash.includes('type=invite')
        )) || (search && search.includes('code='));

        // Handle OTP Errors
        if (hash && hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1));
            setAuthError(params.get('error_description')?.replace(/\+/g, ' '));
            setLoading(false);
            return;
        }

        console.log('🔍 Initializing Auth (Optimistic)...');

        // KEY CHANGE: Race Condition Breaker
        // If Supabase takes > 1s, just assume we might be offline and let the app render (if we have cached data).
        // If we really aren't logged in, ProtectedRoute will catch it later or data wont load (but cached data WILL show).
        const fallbackTimer = setTimeout(() => {
            if (loading) {
                console.log('⚠️ Auth check slow - Unblocking UI (Optimistic Render)');
                setLoading(false);
            }
        }, 800);

        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(fallbackTimer);
            console.log('Session Check Result:', session?.user?.id || 'No User');

            if (session) {
                setSession(session);
                setUser(session.user);
                fetchProfileAndTenant(session.user.id); // This is async, don't wait for it to stop loading
            }

            // Only stop loading if we haven't already forced it via timeout
            setLoading(false);
        }).catch(err => {
            console.error("Auth Exception:", err);
            setLoading(false);
        });


        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('📢 AUTH EVENT:', event);
            console.log('👤 SESSION USER:', session?.user?.id);

            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryFlow(true);
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Only fetch if we don't have profile yet or if the user CHANGED
                // But for safety in this debugging phase, fetch always
                console.log('🔄 Fetching Profile/Tenant for:', session.user.id);
                await fetchProfileAndTenant(session.user.id);
            } else {
                console.log('❌ No Session User - Clearing Data');
                setProfile(null);
                setTenant(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Auto-Recover Session on Focus (Fix for infinite loading on resume)
    useEffect(() => {
        const handleFocus = () => {
            console.log('👀 Window Focused - Refreshing Session...');
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) console.error('Error refreshing session on focus:', error);
                if (session?.user) {
                    // If we have a session, ensure we have the token
                    console.log('✅ Session active on focus');
                } else {
                    console.log('⚠️ No session on focus - possibly expired?');
                }
            });
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') handleFocus();
        });

        return () => {
            window.removeEventListener('focus', handleFocus);
            // removing visibilitychange with anonymous function is tricky, but this is a singleton effectively
        };
    }, []);

    const fetchProfileAndTenant = async (userId) => {
        // Safety Timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.error('⏰ Fetch timed out - forcing app load');
            setLoading(false);
        }, 5000);

        try {
            console.log('👤 Fetching Profile for:', userId);
            // Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) console.error('❌ Profile Error:', profileError);
            else console.log('✅ Profile Found:', profile?.id);

            if (profile) {
                setProfile(profile);
                // Fetch Tenant
                if (profile.tenant_id) {
                    console.log('🏢 Fetching Tenant:', profile.tenant_id);
                    const { data: tenant, error: tenantError } = await supabase
                        .from('tenants')
                        .select('*, plan_status, trial_ends_at')
                        .eq('id', profile.tenant_id)
                        .single();

                    if (tenantError) console.error('❌ Tenant Error:', tenantError);

                    if (tenant) {
                        console.log('✅ Tenant Loaded:', tenant.name, '| Status:', tenant.plan_status);
                        setTenant(tenant);
                    }
                } else {
                    console.log('⚠️ Profile has no tenant_id');
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // State updates handled by onAuthStateChange
    };

    const value = {
        user,
        session,
        profile,
        tenant,
        loading,
        isRecoveryFlow,
        authError,
        signOut,
        refreshProfile: () => user && fetchProfileAndTenant(user.id),
        loginManual: async (session) => {
            console.log('⚡ Manual Login Triggered');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfileAndTenant(session.user.id);
            }
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

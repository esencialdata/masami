import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

    useEffect(() => {
        // 1. Check active session
        const hash = window.location.hash;
        const search = window.location.search;

        const isRedirect = (hash && (
            hash.includes('access_token') ||
            hash.includes('type=recovery') ||
            hash.includes('type=signup') ||
            hash.includes('type=invite')
        )) || (search && search.includes('code='));

        // Handle OTP Errors specially
        if (hash && hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1)); // remove #
            const errCode = params.get('error_code');
            const errMsg = params.get('error_description')?.replace(/\+/g, ' ');

            console.warn('🚨 Auth Redirect Error:', errCode, errMsg);
            setAuthError(errMsg);
            setLoading(false); // Stop loading to show error
            return;
        }

        if (isRedirect) {
            console.log('Auth redirect detected, waiting for event...');
            // Force a session check after a delay if redirect event doesn't fire
            setTimeout(() => {
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                        console.log('✅ Recovered session after redirect delay');
                        setSession(session);
                        setUser(session.user);
                        fetchProfileAndTenant(session.user.id);
                    }
                });
            }, 2000);
        }

        console.log('🔍 Initializing Auth Context...');

        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('🔍 Initial getSession result:', session ? 'FOUND' : 'NULL');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfileAndTenant(session.user.id);
            } else if (!isRedirect) {
                setLoading(false);
            }
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

    const fetchProfileAndTenant = async (userId) => {
        try {
            // Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profile) {
                setProfile(profile);
                // Fetch Tenant
                if (profile.tenant_id) {
                    const { data: tenant, error: tenantError } = await supabase
                        .from('tenants')
                        .select('*, plan_status, trial_ends_at') // Explicitly ensure these
                        .eq('id', profile.tenant_id)
                        .single();

                    if (tenant) {
                        console.log('🏢 Tenant Loaded:', tenant.name, '| Status:', tenant.plan_status);
                        setTenant(tenant);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
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

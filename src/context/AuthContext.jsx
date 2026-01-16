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
    const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

    useEffect(() => {
        // 1. Check active session
        // Only set loading false if NO hash is present (handling redirect/recovery)
        // We broaden the check to catch 'signup', 'invite', 'recovery', and standard tokens
        // AND PKCE 'code' in search params
        const hash = window.location.hash;
        const search = window.location.search;

        const isRedirect = (hash && (
            hash.includes('access_token') ||
            hash.includes('error') ||
            hash.includes('type=recovery') ||
            hash.includes('type=signup') ||
            hash.includes('type=invite')
        )) || (search && search.includes('code='));

        if (isRedirect) {
            console.log('Auth redirect detected, waiting for event...');
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
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
                        .select('*')
                        .eq('id', profile.tenant_id)
                        .single();
                    if (tenant) setTenant(tenant);
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
        signOut,
        refreshProfile: () => user && fetchProfileAndTenant(user.id)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

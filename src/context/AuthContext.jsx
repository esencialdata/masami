import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        // Only set loading false if NO hash is present (handling redirect/recovery)
        const isRedirect = window.location.hash && (
            window.location.hash.includes('access_token') ||
            window.location.hash.includes('error') ||
            window.location.hash.includes('type=recovery')
        );

        if (isRedirect) {
            // Let onAuthStateChange handle it
            console.log('Auth redirect detected, waiting for event...');
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfileAndTenant(session.user.id);
            } else if (!isRedirect) {
                // Only stop loading if we aren't waiting for a redirect hash to process
                setLoading(false);
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfileAndTenant(session.user.id);
            } else {
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
        signOut,
        refreshProfile: () => user && fetchProfileAndTenant(user.id)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

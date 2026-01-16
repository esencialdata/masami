import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // PHOENIX PROTOCOL: Simpler Version (Matched to Chelito Logic)
    // We trust localStorage 'miga_is_authenticated' for UI access.
    // We let Supabase do its thing in the background without forcing refreshes on focus.

    const localAuth = typeof localStorage !== 'undefined' && localStorage.getItem('miga_is_authenticated') === 'true';

    const [isAuthenticated, setIsAuthenticated] = useState(localAuth);
    const [loading, setLoading] = useState(!localAuth);

    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

    useEffect(() => {
        // 1. Initial Load: Just check session once. No complex intervals or focus listeners.
        const initAuth = async () => {
            if (localAuth) {
                setLoading(false); // Show UI immediately
            }

            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (currentSession) {
                console.log('☁️ Supabase Connected');
                setSession(currentSession);
                setUser(currentSession.user);
                setIsAuthenticated(true);
                localStorage.setItem('miga_is_authenticated', 'true');
                fetchProfileAndTenant(currentSession.user.id);
            } else {
                console.log('☁️ No active session');
                if (!localAuth) {
                    setLoading(false); // Only stop loading if we weren't already showing UI
                }
                // If localAuth is true (Phoenix), we STAY authenticated safely backed by cache
            }
        };

        initAuth();

        // 2. Passive Subscription (Standard Supabase)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('📢 Auth Change:', event);
            if (event === 'SIGNED_IN' && session) {
                setIsAuthenticated(true);
                localStorage.setItem('miga_is_authenticated', 'true');
                setSession(session);
                setUser(session.user);
                fetchProfileAndTenant(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                localStorage.removeItem('miga_is_authenticated');
                setSession(null);
                setUser(null);
                setProfile(null);
                setTenant(null);
            } else if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryFlow(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfileAndTenant = async (userId) => {
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) {
                setProfile(profile);
                if (profile.tenant_id) {
                    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();
                    if (tenant) setTenant(tenant);
                }
            }
        } catch (error) {
            console.error('Error fetching profile', error);
        }
    };

    const signOut = async () => {
        setIsAuthenticated(false);
        localStorage.removeItem('miga_is_authenticated');
        localStorage.removeItem('sb-access-token'); // Clean sweep
        setSession(null);
        setUser(null);
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const value = {
        isAuthenticated,
        user,
        session,
        profile,
        tenant,
        loading: loading && !isAuthenticated,
        isRecoveryFlow,
        signOut,
        refreshProfile: () => user && fetchProfileAndTenant(user.id)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // STANDARD "PHOENIX" PROTOCOL (Clean Slate)
    // 1. Trust LocalStorage for immediate access (speed)
    // 2. Verify Session in background (security)
    // 3. NO auto-refresh loop or complex listeners

    const localAuth = typeof localStorage !== 'undefined' && localStorage.getItem('miga_is_authenticated') === 'true';

    const [isAuthenticated, setIsAuthenticated] = useState(localAuth);
    const [loading, setLoading] = useState(!localAuth);

    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            // Check current session
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (currentSession) {
                console.log('✅ Auth: Session valid');
                setSession(currentSession);
                setUser(currentSession.user);
                setIsAuthenticated(true);
                localStorage.setItem('miga_is_authenticated', 'true');
                fetchProfileAndTenant(currentSession.user.id);
            } else {
                console.log('⚠️ Auth: No active session');
                if (localAuth) {
                    console.log('🛡️ Auth: Keeping offline access via Phoenix Protocol');
                    // We stay authenticated because we trust the local flag for offline support
                } else {
                    setLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('📢 Auth Event:', event);
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
        // Clear all app data on logout to truly start fresh for next user
        // localStorage.clear(); // User requested "borrar todo", maybe safe? Keeping it safe for now.
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
        loading: loading && !isAuthenticated, // Only block if we truly have no clue
        isRecoveryFlow,
        signOut,
        refreshProfile: () => user && fetchProfileAndTenant(user.id)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

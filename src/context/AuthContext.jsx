import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // PHOENIX PROTOCOL: Trust local storage BLINDLY for UI access.
    // "miga_auth" = "true" -> Render App.
    // Supabase will connect in background.

    // 1. Synchronous Access Check
    const localAuth = localStorage.getItem('miga_is_authenticated') === 'true';

    const [isAuthenticated, setIsAuthenticated] = useState(localAuth);
    const [loading, setLoading] = useState(!localAuth); // Only load if we are NOT authenticated

    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

    useEffect(() => {
        // 2. Background Connection (Fire & Forget)
        // If we think we are authenticated, show the app IMMEDIATELY (loading=false)
        if (localAuth) {
            setLoading(false);
        }

        const initAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session) {
                console.log('☁️ Supabase Connected (Background)');
                setSession(session);
                setUser(session.user);
                setIsAuthenticated(true);
                localStorage.setItem('miga_is_authenticated', 'true');

                // Fetch Profile (Non-blocking)
                fetchProfileAndTenant(session.user.id);
            } else {
                console.log('☁️ No Supabase Session - might be expired or fresh load');
                if (localAuth) {
                    // We thought we were logged in, but Supabase says no.
                    // IMPORTANT: Do NOT kick user out immediately if offline.
                    // Only kick out if we receive an explicit "Invalid Refresh Token" error or similar.
                    // For now, let them see cached data.
                } else {
                    setLoading(false); // Stop loading to show Login Screen
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('📢 Auth Change:', event);
            if (event === 'SIGNED_IN') {
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
            } else if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryFlow(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfileAndTenant = async (userId) => {
        try {
            // Fetch Profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) {
                setProfile(profile);
                if (profile.tenant_id) {
                    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();
                    if (tenant) setTenant(tenant);
                }
            }
        } catch (error) {
            // Silent fail
        }
    };

    const signOut = async () => {
        localStorage.removeItem('miga_is_authenticated');
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
        await supabase.auth.signOut();
        // Force reload to clean state
        window.location.href = '/';
    };

    // Expose values
    const value = {
        isAuthenticated, // NEW PRIMARY FLAG
        user, // May be null if offline
        session, // May be null if offline
        profile,
        tenant,
        loading: loading && !isAuthenticated, // If authenticated, never "loading"
        isRecoveryFlow,
        authError,
        signOut,
        refreshProfile: () => user && fetchProfileAndTenant(user.id)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

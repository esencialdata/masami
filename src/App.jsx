import React, { useState, useEffect } from 'react';
import { supabase } from './services/api';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ClientList from './components/clients/ClientList';
import OrdersView from './components/orders/OrdersView';
import ProductList from './components/products/ProductList';
import Settings from './components/settings/Settings';
import ReportsView from './components/reports/ReportsView';
import LandingPage from './components/landing/LandingPage';
import OnboardingWizard from './components/auth/OnboardingWizard';
import SubscriptionGuard from './components/auth/SubscriptionGuard';

import InstallPrompt from './components/pwa/InstallPrompt';

// --- COMPONENTS DE AUTENTICACIÓN (SaaS) ---

const LoginScreen = ({ onRegisterClick, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-brand-coffee/10">
        <div className="flex justify-start mb-4">
          <button onClick={onBackToLanding} className="text-sm text-brand-coffee/50 hover:text-brand-gold flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
          </button>
        </div>
        <img src="/app_icon.svg" alt="Miga Logo" className="w-16 h-16 mx-auto mb-6 rounded-2xl shadow-lg shadow-brand-gold/20" />
        <h1 className="text-2xl font-bold text-brand-coffee mb-2">Bienvenido a Miga</h1>
        <p className="text-brand-coffee/60 mb-8 text-sm">Tu sistema operativo de panadería</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left space-y-1">
            <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ej. panaderia@miga.com"
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all placeholder:text-gray-300"
            />
          </div>
          <div className="text-left space-y-1">
            <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-gold text-brand-coffee font-bold py-4 rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dashed border-gray-100 text-sm text-brand-coffee/60">
          ¿Aun no tienes cuenta?
          <button onClick={onRegisterClick} className="text-brand-gold font-bold hover:underline ml-1">
            Prueba Gratis 7 Días
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onLoginClick, onBackToLanding }) => {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', businessName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName } }
      });
      if (authError) throw authError;

      // Check if session was created immediately (Email Auth disabled)
      if (data.session) {
        // Auto-login will be handled by onAuthStateChange in App component
      } else if (data.user) {
        // User created but no session => Email Confirmation Required
        setVerificationSent(true);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-brand-coffee/10">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-coffee mb-2">¡Revisa tu Correo!</h1>
          <p className="text-brand-coffee/60 mb-8 text-sm">
            Hemos enviado un enlace de confirmación a <strong>{formData.email}</strong>.
            <br /><br />
            Por favor, haz clic en el enlace para activar tu cuenta y comenzar a hornear.
          </p>
          <button
            onClick={onLoginClick}
            className="w-full bg-brand-coffee text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all"
          >
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-brand-coffee/10">
        <div className="flex justify-start mb-4">
          <button onClick={onBackToLanding} className="text-sm text-brand-coffee/50 hover:text-brand-gold flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
          </button>
        </div>
        <img src="/app_icon.svg" alt="Miga Logo" className="w-16 h-16 mx-auto mb-6 rounded-2xl shadow-lg shadow-brand-gold/20" />
        <h1 className="text-2xl font-bold text-brand-coffee mb-2">Comienza Gratis</h1>
        <p className="text-brand-coffee/60 mb-6 text-sm">Prueba Miga por 7 días sin costo</p>

        <form onSubmit={handleRegister} className="space-y-3 text-left">
          <div>
            <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Nombre Completo</label>
            <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Nombre del Negocio</label>
            <input required type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Correo</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Contraseña</label>
            <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all" />
          </div>

          {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-brand-gold text-brand-coffee font-bold py-3.5 rounded-lg hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-lg shadow-brand-gold/20 mt-2">
            {loading ? 'Creando cuenta...' : 'Comenzar Prueba Gratis'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          ¿Ya tienes cuenta? <button onClick={onLoginClick} className="text-brand-gold font-bold hover:underline ml-1">Inicia Sesión</button>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authView, setAuthView] = useState('landing'); // landing, login, register
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());
  const [initializing, setInitializing] = useState(true);

  // Helper to fetch profile + tenant
  const fetchProfile = async (userId) => {
    try {
      // Race DB query against a 3s timeout to prevent hanging
      const query = supabase
        .from('profiles')
        .select('*, tenant:tenants(*)')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([
        query,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000))
      ]);

      if (!error && data) {
        setUserProfile(data);
        return data;
      }
    } catch (e) {
      console.warn("Profile fetch skipped/failed:", e.message);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    if (supabase) {
      // 1. Initial Session Check (Standard Supabase Logic)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);

        if (session) {
          // Attempt profile load, but don't block forever
          fetchProfile(session.user.id).finally(() => {
            if (mounted) setInitializing(false);
          });
          setActiveTab('dashboard');
        } else {
          setInitializing(false);
        }
      });

      // 2. Auth Listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        // Handle explicit sign-in/out
        setSession(session);

        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setAuthView('landing');
          setInitializing(false);
        } else if (event === 'SIGNED_IN' && session) {
          // On explicit sign-in, we might want to wait for profile
          setInitializing(true);
          fetchProfile(session.user.id).finally(() => {
            if (mounted) setInitializing(false);
          });
          setActiveTab('dashboard');
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setInitializing(false);
    }
  }, []);

  const handleTransactionAdded = () => {
    setLastUpdated(Date.now());
  };

  const onWizardComplete = async () => {
    if (session) {
      setInitializing(true); // Mostrar loading mientras recargamos
      await fetchProfile(session.user.id);
      setInitializing(false);
    }
  };


  // SAFETY: If Supabase config is missing
  if (!supabase) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-800">Error de Configuración</h1>
          <p className="text-red-600 mt-2">No se encontró la conexión a Supabase.</p>
        </div>
      </div>
    );
  }


  // LOADING STATE
  if (initializing) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-brand-coffee/60 font-medium animate-pulse">Cargando Miga...</p>
      </div>
    );
  }

  // LOGOUT STATE -> SHOW LANDING / AUTH
  if (!session) {
    if (authView === 'landing') return <LandingPage onLogin={() => setAuthView('login')} onGetStarted={() => setAuthView('register')} />;
    if (authView === 'register') return <RegisterScreen onLoginClick={() => setAuthView('login')} onBackToLanding={() => setAuthView('landing')} />;
    // Default: Login
    return <LoginScreen onRegisterClick={() => setAuthView('register')} onBackToLanding={() => setAuthView('landing')} />;
  }

  // SAAS FLOW: ONBOARDING WIZARD
  // Si hay sesión, pero NO tenemos tenant_id en el perfil, mostramos el Wizard
  if (userProfile && !userProfile.tenant_id) {
    return <OnboardingWizard onComplete={onWizardComplete} />;
  }

  // LOGGED IN STATE -> DASHBOARD
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard refreshTrigger={lastUpdated} userProfile={userProfile} />;
      case 'orders': return <OrdersView />;
      case 'clients': return <ClientList />;
      case 'products': return <ProductList />;
      case 'settings': return <Settings />;
      case 'reports': return <ReportsView />;
      default: return <Dashboard refreshTrigger={lastUpdated} />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // State updates handled by onAuthStateChange
  };

  return (
    <SubscriptionGuard tenant={userProfile?.tenant}>
      <InstallPrompt />
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTransactionAdded={handleTransactionAdded}
        onLogout={handleLogout}
        userProfile={userProfile}
      >
        {renderContent()}
      </Layout>
    </SubscriptionGuard>
  );
}

export default App;

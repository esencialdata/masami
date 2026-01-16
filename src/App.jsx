import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import { useAuth } from './context/AuthContext';

import ClientList from './components/clients/ClientList';
import OrdersView from './components/orders/OrdersView';

import ProductList from './components/products/ProductList';
import Settings from './components/settings/Settings';
import ReportsView from './components/reports/ReportsView';

import LandingPage from './components/landing/LandingPage';
import ResetPasswordScreen from './components/auth/ResetPasswordScreen';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import SubscriptionGuard from './components/auth/SubscriptionGuard';

function App() {
  const { user, loading, signOut, isRecoveryFlow, profile, refreshProfile } = useAuth();

  // Local state for UI flow only (not auth state)
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Auto-detect invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite')) {
      setShowRegister(true);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());

  // Failsafe State
  const [setupError, setSetupError] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleTransactionAdded = () => {
    setLastUpdated(Date.now());
  };

  // DEBUG: Global State Tracker
  const DebugBar = () => (
    <div className="fixed top-0 left-0 w-full bg-black/80 text-white text-[10px] p-1 z-[9999] flex gap-4 justify-center font-mono pointer-events-none">
      <span>LOADING: {loading ? 'YES' : 'NO'}</span>
      <span>USER: {user ? user.id.slice(0, 6) + '...' : 'NULL'}</span>
      <span>PROFILE: {profile ? profile.role : 'NULL'}</span>
      <span>TENANT: {tenant ? tenant.name : 'NULL'}</span>
    </div>
  );

  // 1. Initial Loading State
  // Don't show anything until we are sure about the session
  if (loading) {
    return (
      <>
        <DebugBar />
        <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-coffee animate-pulse">Cargando Miga...</div>
      </>
    );
  }

  // 2. Auth Error Flow (Link Expired, etc)
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-t-8 border-red-500 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl text-red-600">link_off</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-coffee mb-2">Enlace no válido</h2>
          <p className="text-brand-coffee/60 mb-6">{authError === 'Email link is invalid or has expired' ? 'Este enlace de confirmación ya expiró o ya fue usado.' : authError}</p>

          <button
            onClick={() => {
              window.location.hash = ''; // Clear error
              window.location.reload();
            }}
            className="w-full bg-brand-coffee text-white font-bold py-3 rounded-xl hover:bg-brand-coffee/90 transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // 3. Password Recovery Flow
  if (isRecoveryFlow) {
    return <ResetPasswordScreen />;
  }



  // 2. Unauthenticated State
  if (!user) {
    if (showRegister) {
      return (
        <RegisterScreen
          onLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      );
    }
    if (showLogin) {
      return (
        <LoginScreen
          onBack={() => setShowLogin(false)}
          onRegister={() => { setShowLogin(false); setShowRegister(true); }}
          onLogin={() => {
            // rely on reactive auth state change
            // window.location.href = '/'; 
          }}
        />
      );
    }
    // Landing Page
    return (
      <>
        <DebugBar />
        <LandingPage
          onGetStarted={() => setShowRegister(true)}
          onLogin={() => setShowLogin(true)}
        />
      </>
    );
  }

  // 3. Authenticated but Incomplete Setup (Zombie User)
  if (user && !profile) {
    console.log('⚠️ FAILSAFE TRIGGERED: User exists but no profile');
    const handleForceSetup = async () => {
      try {
        setIsSettingUp(true);
        setSetupError(null);

        // Derive Business Name from Metadata or Default
        const businessName = user.user_metadata?.business_name || 'Mi Panadería';

        const { data, error } = await import('./services/api').then(m => m.supabase.rpc('create_tenant_and_owner', {
          tenant_name: businessName,
          owner_id: user.id
        }));

        if (error) throw error;

        // refresh
        await refreshProfile();
        // Force reload if context doesn't update fast enough
        window.location.reload();

      } catch (err) {
        console.error("Setup failed:", err);
        setSetupError(err.message || 'Error al configurar cuenta.');
      } finally {
        setIsSettingUp(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream p-4 text-center">
        {/* DEBUG OVERLAY */}
        <div className="absolute top-0 left-0 bg-black text-xs text-white p-2 opacity-50 z-50">
          User: {user?.id} | Profile: {profile ? 'Yes' : 'NULL'}
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-brand-coffee/10">
          <img src="/app_icon.svg" className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-coffee mb-2">Finalizando Configuración</h2>
          <p className="text-brand-coffee/60 mb-6">Tu cuenta fue creada, pero estamos preparando tu espacio de trabajo.</p>

          {setupError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {setupError}
            </div>
          )}

          <button
            onClick={handleForceSetup}
            disabled={isSettingUp}
            className="w-full bg-brand-gold text-white font-bold py-3 rounded-xl hover:bg-brand-gold/90 transition-all flex justify-center items-center gap-2"
          >
            {isSettingUp ? 'Configurando...' : 'Completar Instalación'}
          </button>
        </div>
      </div>
    );
  }

  // Authenticated App
  return (
    <SubscriptionGuard>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={signOut}>
        {activeTab === 'dashboard' && <Dashboard key={lastUpdated} refreshTrigger={lastUpdated} />}
        {activeTab === 'pedidos' && <OrdersView />}
        {activeTab === 'clientes' && <ClientList />}
        {activeTab === 'inventario' && <ProductList />}
        {activeTab === 'reportes' && <ReportsView />}
        {activeTab === 'configuracion' && <Settings />}
      </Layout>
    </SubscriptionGuard>
  );
}

export default App;

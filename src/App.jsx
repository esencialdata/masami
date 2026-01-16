import React, { useState, useEffect } from 'react';
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
  const { isAuthenticated, loading, signOut, isRecoveryFlow, profile, refreshProfile, authError, user } = useAuth(); // Use isAuthenticated

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

  // 1. Initial Loading State
  // Don't show anything until we are sure about the session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-coffee animate-pulse">Cargando Miga...</div>
    );
  }

  // 2. Auth Error Flow (Link Expired, etc)
  if (authError) {
    // ... (Error UI kept same)
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-t-8 border-red-500 text-center">
          {/* ... Content ... */}
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

  // 2. Unauthenticated State (Based on simplified flag)
  if (!isAuthenticated) {
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
            // FORCE Local Storage Flag on successful login event
            localStorage.setItem('miga_is_authenticated', 'true');
            // window.location.reload(); // Context will pick it up
          }}
        />
      );
    }
    // Landing Page
    return (
      <>
        <LandingPage
          onGetStarted={() => setShowRegister(true)}
          onLogin={() => setShowLogin(true)}
        />
      </>
    );
  }

  // (Rest of App - Authenticated)
  // Check for Zombie User (Authenticated but no profile loaded YET)
  // If we are authenticated locally but "user" is null (offline), we should still show the Layout (cached mode).
  // So: Only block if we HAVE a user but NO profile (broken sync), OR just skip this check for offline robustness.
  // Ideally: If we are offline, 'user' is null, 'profile' is null. We should show Layout anyway.

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

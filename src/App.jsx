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
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import SubscriptionGuard from './components/auth/SubscriptionGuard';

function App() {
  const { user, loading, signOut } = useAuth();

  // Local state for UI flow only (not auth state)
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());

  const handleTransactionAdded = () => {
    setLastUpdated(Date.now());
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-coffee">Cargando Miga...</div>;
  }

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
        />
      );
    }
    // Landing Page
    return (
      <LandingPage
        onGetStarted={() => setShowRegister(true)}
        onLogin={() => setShowLogin(true)}
      />
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

import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';

import ClientList from './components/clients/ClientList';
import OrdersView from './components/orders/OrdersView';

import ProductList from './components/products/ProductList';
import Settings from './components/settings/Settings';
import ReportsView from './components/reports/ReportsView';

import LandingPage from './components/landing/LandingPage';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cdm_auth_token') === 'chelitoysantiago';
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('cdm_auth_token', 'chelitoysantiago'); // Keep original auth token logic for now
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleRegister = (formData) => {
    // Here logic to create account
    localStorage.setItem('cdm_auth_token', 'chelitoysantiago'); // Assume successful registration logs in
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
  }

  const handleTransactionAdded = () => {
    setLastUpdated(Date.now());
  };

  if (!isAuthenticated && !showLogin && !showRegister) {
    return (
      <LandingPage
        onGetStarted={() => setShowRegister(true)}
        onLogin={() => setShowLogin(true)}
      />
    );
  }

  if (showLogin) {
    return <LoginScreen onLogin={handleLogin} onBack={() => setShowLogin(false)} onRegister={() => { setShowLogin(false); setShowRegister(true); }} />;
  }

  if (showRegister) {
    return (
      <RegisterScreen
        onLogin={() => { setShowRegister(false); setShowLogin(true); }}
        onRegister={handleRegister}
      />
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('cdm_auth_token');
    setIsAuthenticated(false);
    setShowLogin(false);
    setShowRegister(false); // Ensure register screen is also hidden on logout
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard refreshTrigger={lastUpdated} />;
      case 'orders': return <OrdersView />;
      case 'clients': return <ClientList />;
      case 'products': return <ProductList />;
      case 'settings': return <Settings />;
      case 'reports': return <ReportsView />;
      default: return <Dashboard refreshTrigger={lastUpdated} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onTransactionAdded={handleTransactionAdded}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;

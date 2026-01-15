import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';

import ClientList from './components/clients/ClientList';
import OrdersView from './components/orders/OrdersView';

import ProductList from './components/products/ProductList';
import Settings from './components/settings/Settings';
import ReportsView from './components/reports/ReportsView';

import LandingPage from './components/landing/LandingPage';

// Simple Login Component
const LoginScreen = ({ onLogin, onBack }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pass === 'chelitoysantiago') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-brand-coffee/5 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 text-brand-coffee/50 hover:text-brand-gold transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <img src="/app_icon.svg" className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-sm border border-brand-coffee/5" alt="Logo" />
        <h1 className="text-2xl font-bold text-brand-coffee mb-2">Bienvenido a Miga</h1>
        <p className="text-brand-coffee/60 mb-6 text-sm">Gestiona tu negocio de forma inteligente</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError(false); }}
            placeholder="Clave de acceso"
            className={`w-full p-4 rounded-xl border text-center text-lg outline-none transition-all bg-brand-cream text-brand-coffee ${error ? 'border-danger bg-red-50 text-danger' : 'border-brand-coffee/10 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold'}`}
          />
          {error && <p className="text-danger text-xs font-bold animate-pulse">Clave incorrecta</p>}
          <button
            type="submit"
            className="w-full bg-brand-gold text-brand-coffee font-bold py-4 rounded-xl hover:bg-yellow-600 transition-colors shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cdm_auth_token') === 'chelitoysantiago';
  });

  const [showLogin, setShowLogin] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());

  const handleLogin = () => {
    localStorage.setItem('cdm_auth_token', 'chelitoysantiago');
    setIsAuthenticated(true);
  };

  const handleTransactionAdded = () => {
    setLastUpdated(Date.now());
  };

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginScreen onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('cdm_auth_token');
    setIsAuthenticated(false);
    setShowLogin(false);
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

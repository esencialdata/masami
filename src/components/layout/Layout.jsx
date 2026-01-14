import React from 'react';
import { LayoutDashboard, Users, Settings, Package, Calendar, BarChart3 } from 'lucide-react';
import { TransactionFABS } from '../transactions/TransactionFABS';

const Layout = ({ children, activeTab, setActiveTab, onTransactionAdded, onLogout }) => {
    return (
        <div className="min-h-screen bg-background-light text-text-main-light flex transition-colors duration-300">
            {/* Sidebar - Desktop/Tablet */}
            <aside className="hidden md:flex w-64 flex-col bg-surface-light border-r border-border-light h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
                <div className="p-8 flex items-center gap-3">
                    {/* Placeholder for Logo if svg not suitable for dark mode, or use brightness filter */}
                    <img src="/logo_chelito.svg" alt="Masami" className="h-16 w-auto" />
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <SidebarLink
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        isActive={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarLink
                        icon={<Calendar size={20} />}
                        label="Agenda"
                        isActive={activeTab === 'orders'}
                        onClick={() => setActiveTab('orders')}
                    />
                    <SidebarLink
                        icon={<Users size={20} />}
                        label="Clientes"
                        isActive={activeTab === 'clients'}
                        onClick={() => setActiveTab('clients')}
                    />
                    <SidebarLink
                        icon={<Package size={20} />}
                        label="Inventario"
                        isActive={activeTab === 'products'}
                        onClick={() => setActiveTab('products')}
                    />
                    <SidebarLink
                        icon={<BarChart3 size={20} />}
                        label="Reportes"
                        isActive={activeTab === 'reports'}
                        onClick={() => setActiveTab('reports')}
                    />
                    <div className="pt-8 px-4">
                        <span className="text-xs font-bold text-text-sec-light uppercase tracking-widest">Sistema</span>
                    </div>
                    <SidebarLink
                        icon={<Settings size={20} />}
                        label="Configuración"
                        isActive={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="p-4 border-t border-border-light">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-black/5 text-text-sec-light transition-colors group"
                    >
                        <img src="/app_icon.svg" alt="User" className="w-10 h-10 rounded-full border border-border-light p-1" />
                        <div className="text-left">
                            <p className="text-sm font-bold text-text-main-light group-hover:text-primary transition-colors">Masami User</p>
                            <p className="text-xs opacity-70">Cerrar Sesión</p>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-surface-light p-4 shadow-sm z-50 flex items-center justify-center border-b border-border-light transition-colors duration-300">
                <img src="/logo_chelito.svg" alt="Masami" className="h-12 w-auto" />
            </header>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 min-h-screen overflow-x-hidden">
                <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-500">
                    {children}
                </div>
            </main>

            <TransactionFABS onTransactionAdded={onTransactionAdded} />

            {/* Bottom Nav - Mobile Only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-light border-t border-border-light shadow-lg z-50 pb-safe transition-colors duration-300">
                <div className="flex justify-around items-center h-16">
                    <NavButton
                        icon={<LayoutDashboard size={24} />}
                        label="Inicio"
                        isActive={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavButton
                        icon={<Calendar size={24} />}
                        label="Agenda"
                        isActive={activeTab === 'orders'}
                        onClick={() => setActiveTab('orders')}
                    />
                    <NavButton
                        icon={<Users size={24} />}
                        label="Clientes"
                        isActive={activeTab === 'clients'}
                        onClick={() => setActiveTab('clients')}
                    />
                    <NavButton
                        icon={<Package size={24} />}
                        label="Stock"
                        isActive={activeTab === 'products'}
                        onClick={() => setActiveTab('products')}
                    />
                </div>
            </nav>
        </div>
    );
};

const SidebarLink = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent
            ${isActive
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'text-text-sec-light hover:bg-black/5 hover:text-text-main-light'
            }`}
    >
        {icon}
        <span>{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow shadow-primary" />}
    </button>
);

const NavButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-primary font-bold scale-105' : 'text-text-sec-light'}
            `}
    >
        {icon}
        <span className="text-[10px]">{label}</span>
    </button>
);

export default Layout;


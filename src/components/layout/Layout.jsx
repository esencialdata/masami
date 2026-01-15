import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, Package, Croissant, LogOut, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children, activeTab, setActiveTab, onTransactionAdded, onLogout }) => {
    const { profile, tenant } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Default to 'owner' if mock or loading, but theoretically profile is loaded
    const role = profile?.role || 'owner';

    // RBAC: Menu Items Definition
    const MENU_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner'] }, // Hidden for Baker/Sales who see specific views?
        // Actually Baker can see Dashboard if we strip financial widgets, but prompt says "Ocultar Finanzas".
        { id: 'pedidos', label: 'Pedidos', icon: Calendar, roles: ['owner', 'baker', 'sales'] },
        { id: 'clientes', label: 'Clientes', icon: Users, roles: ['owner', 'sales'] },
        { id: 'inventario', label: 'Inventario', icon: Package, roles: ['owner', 'baker'] },
        // Note: Inventario here implies Products/Recipes. Sales should NOT see this.
        { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: ['owner'] },
        { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['owner'] },
    ];

    // *Fix for Icons*: The import list has Package, Croissant.
    // Let's map properly.
    const getIcon = (id) => {
        switch (id) {
            case 'dashboard': return LayoutDashboard;
            case 'pedidos': return Calendar;
            case 'clientes': return Users;
            case 'inventario': return Package;
            case 'reportes': return BarChart3;
            case 'configuracion': return Settings;
            default: return Package;
        }
    };

    // Filter Items
    const filterItems = (items) => {
        return items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(role);
        });
    };

    const visibleItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner'] },
        { id: 'pedidos', label: 'Pedidos', icon: Calendar, roles: ['owner', 'baker', 'sales'] },
        { id: 'clientes', label: 'Clientes', icon: Users, roles: ['owner', 'sales'] },
        { id: 'inventario', label: 'Inventario', icon: Package, roles: ['owner', 'baker'] },
        { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: ['owner'] },
        { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['owner'] }
    ].filter(item => item.roles.includes(role));

    // Handle initial tab if current tab is restricted
    // This logic ideally belongs in App.jsx or useEffect, but for navigation rendering:

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 h-screen fixed left-0 top-0 z-50">
                <div className="p-6 flex items-center gap-3">
                    <img src="/logo_chelito.svg" alt="Miga" className="h-16 w-auto" />
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium text-sm
                                    ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                        <img src="/app_icon.svg" alt="User" className="w-10 h-10 rounded-full border border-gray-100 p-1" />
                        <div className="text-left overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{tenant?.name || 'Mi Panadería'}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
                        </div>
                        <LogOut size={16} className="ml-auto text-gray-400" />
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white p-4 shadow-sm z-50 flex items-center justify-center border-b border-gray-100">
                <img src="/logo_chelito.svg" alt="Miga" className="h-16 w-auto" />
            </header>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-28 md:pt-8 bg-background min-h-screen">
                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-safe">
                <div className="flex justify-around items-center h-16 px-2">
                    {visibleItems.slice(0, 5).map((item) => { // Limit to 5 for mobile space
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary font-bold' : 'text-gray-500'}`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-xs">{item.label}</span>
                            </button>
                        );
                    })}
                    {/* Logout for mobile? hidden in settings usually */}
                </div>
            </nav>
        </div>
    );
};

export default Layout;

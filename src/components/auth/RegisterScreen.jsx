import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/api';

const DEFAULT_INGREDIENTS = [
    { name: 'Harina de Trigo', current_cost: 16.50, unit: 'kg', min_alert: 50 },
    { name: 'Azúcar Estándar', current_cost: 28.00, unit: 'kg', min_alert: 20 },
    { name: 'Huevo (Caja)', current_cost: 850.00, unit: 'pza', min_alert: 2 },
    { name: 'Leche Entera', current_cost: 24.50, unit: 'lt', min_alert: 20 },
    { name: 'Mantequilla s/sal', current_cost: 185.00, unit: 'kg', min_alert: 10 },
    { name: 'Levadura Fresca', current_cost: 85.00, unit: 'kg', min_alert: 2 },
    { name: 'Sal Refinada', current_cost: 12.00, unit: 'kg', min_alert: 5 },
    { name: 'Aceite Vegetal', current_cost: 45.00, unit: 'lt', min_alert: 10 },
    { name: 'Margarina Danés', current_cost: 65.00, unit: 'kg', min_alert: 10 },
    { name: 'Mejorante Pan', current_cost: 120.00, unit: 'kg', min_alert: 1 },
    { name: 'Polvo para Hornear', current_cost: 95.00, unit: 'kg', min_alert: 2 },
    { name: 'Chocolate Semi', current_cost: 220.00, unit: 'kg', min_alert: 5 },
    { name: 'Cocoa en Polvo', current_cost: 180.00, unit: 'kg', min_alert: 2 },
    { name: 'Canela Molida', current_cost: 350.00, unit: 'kg', min_alert: 1 },
    { name: 'Vainilla (Esencia)', current_cost: 150.00, unit: 'lt', min_alert: 2 },
    { name: 'Mermelada Fresa', current_cost: 85.00, unit: 'kg', min_alert: 5 },
    { name: 'Queso Crema', current_cost: 140.00, unit: 'kg', min_alert: 5 },
    { name: 'Jamón de Pavo', current_cost: 160.00, unit: 'kg', min_alert: 5 },
    { name: 'Queso Manchego', current_cost: 210.00, unit: 'kg', min_alert: 5 },
    { name: 'Ajonjolí', current_cost: 110.00, unit: 'kg', min_alert: 2 }
];

export default function RegisterScreen({ onLogin }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inviteParams, setInviteParams] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const inviteId = params.get('invite');
        const role = params.get('role');
        if (inviteId) {
            setInviteParams({ tenantId: inviteId, role: role || 'baker' });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. SignUp User with Metadata
            // This triggers the 'handle_new_user' DB function which creates Profile & Tenant automatically
            const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        business_name: inviteParams ? null : formData.businessName, // Sent only if creating new tenant
                        invite_tenant_id: inviteParams?.tenantId,
                        invite_role: inviteParams?.role
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (user) {
                // Success! 
                // Initial session might be shaky until trigger completes, but usually works fine.
                // We reload to force app re-init with correct context (profile usually created by now)

                // Optional: Short delay or check if profile exists, but reload is safest for full context
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al registrar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4 font-display">
            <div className="bg-surface-light p-8 rounded-3xl shadow-xl w-full max-w-md border border-brand-coffee/10">
                <button
                    onClick={onLogin}
                    className="mb-6 flex items-center text-brand-coffee/60 hover:text-brand-coffee transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="ml-1 text-sm font-medium">Volver</span>
                </button>

                <img src="/app_icon.svg" className="w-16 h-16 mx-auto mb-6 rounded-2xl shadow-sm border border-brand-coffee/5" alt="Logo" />

                {inviteParams ? (
                    <>
                        <h1 className="text-2xl font-bold text-center text-brand-coffee mb-2">Únete al Equipo</h1>
                        <p className="text-center text-brand-coffee/60 mb-8 text-sm">
                            Registráte para unirte a la panadería como <span className="font-bold uppercase text-brand-gold">{inviteParams.role}</span>
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-center text-brand-coffee mb-2">Crea tu cuenta</h1>
                        <p className="text-center text-brand-coffee/60 mb-8 text-sm">Prueba Miga gratis por 7 días</p>
                    </>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-coffee/80 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/20 bg-background-light focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                            placeholder="Juan Pérez"
                        />
                    </div>

                    {!inviteParams && (
                        <div>
                            <label className="block text-sm font-medium text-brand-coffee/80 mb-1">Nombre del Negocio</label>
                            <input
                                type="text"
                                name="businessName"
                                required
                                value={formData.businessName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-brand-coffee/20 bg-background-light focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                                placeholder="Panadería La Espiga"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-brand-coffee/80 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/20 bg-background-light focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-coffee/80 mb-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/20 bg-background-light focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-gold/20 transform transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creando cuenta...' : (inviteParams ? 'Unirse al Equipo' : 'Comenzar Prueba Gratis')}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-brand-coffee/5">
                    <p className="text-sm text-brand-coffee/60">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            onClick={onLogin}
                            className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors"
                        >
                            Inicia Sesión
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

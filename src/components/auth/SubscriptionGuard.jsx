import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SubscriptionGuard({ children }) {
    const { tenant, loading } = useAuth();

    if (loading) return null; // Or a spinner

    if (!tenant) {
        // Should theoretically not happen here if protected by Auth, 
        // but just in case, allow App.js to handle the "No Tenant" flow
        return <>{children}</>;
    }

    const { plan_status, trial_ends_at } = tenant;
    const now = new Date();
    const trialEnd = new Date(trial_ends_at);
    const isExpired = now > trialEnd && plan_status !== 'active';

    // DEBUG LOG
    console.log('🛡️ SUBSCRIPTION CHECK:', {
        id: tenant.id,
        plan: plan_status,
        ends: trial_ends_at,
        isExpired
    });

    if (isExpired) {
        return (
            <div className="fixed inset-0 z-50 bg-brand-coffee/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center border-t-8 border-brand-gold relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#C5A572 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-gold">lock_clock</span>
                        </div>

                        <h2 className="text-3xl font-bold text-brand-coffee mb-2">Prueba Finalizada</h2>
                        <p className="text-brand-coffee/60 mb-8 text-lg">
                            Esperamos que Miga te haya sido útil. Para seguir gestionando tu panadería, necesitas activar tu plan.
                        </p>

                        <div className="bg-brand-cream/30 rounded-xl p-6 mb-8 border border-brand-coffee/5 text-left">
                            <h3 className="font-bold text-brand-coffee mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-gold">star</span>
                                Tu suscripción incluye:
                            </h3>
                            <ul className="space-y-3 text-sm text-brand-coffee/80">
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Usuarios y Recetas ilimitadas
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Control de Inventario y Costos
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Soporte Prioritario por WhatsApp
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => window.location.href = '/settings/billing'} // Or integrate Stripe here
                            className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-brand-gold/30 transition-all hover:scale-[1.02]"
                        >
                            Activar Plan Ahora
                        </button>

                        <p className="mt-4 text-xs text-brand-coffee/40">
                            ¿Tienes dudas? <a href="#" className="underline hover:text-brand-gold">Contáctanos</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

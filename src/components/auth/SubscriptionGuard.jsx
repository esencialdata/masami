import React from 'react';
import { supabase } from '../../services/api';

/**
 * Wraps content and checks if the current tenant has an active plan or valid trial.
 * If expired, shows a blocking Paywall.
 */
const SubscriptionGuard = ({ tenant, children }) => {
    // 1. Check if tenant exists
    // FAIL-OPEN: If tenant is null (e.g. profile loading failed or RLS blocked), allow access to dashboard.
    // This prevents the "White Screen of Death".
    if (!tenant) return children;

    // 2. Check Expiration
    const isExpired = () => {
        if (tenant.plan_status === 'active') return false;

        // Safety for null dates
        if (!tenant.trial_ends_at) return false;

        const end = new Date(tenant.trial_ends_at);
        const now = new Date();

        // Expired if current time > end time
        return now > end;
    };

    if (isExpired()) {
        return (
            <div className="fixed inset-0 z-50 bg-brand-coffee/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border-t-4 border-brand-gold">
                    <div className="w-20 h-20 bg-brand-cream rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-brand-coffee">timer_off</span>
                    </div>

                    <h2 className="text-2xl font-bold text-brand-coffee mb-2">Prueba Finalizada</h2>
                    <p className="text-brand-coffee/70 mb-8">
                        ¡Esperamos que hayas disfrutado tus 7 días con Miga! 🥐
                        <br /><br />
                        Para seguir horneando y gestionando tu negocio, necesitas activar tu suscripción.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => alert("Flow de pago próximamente...")}
                            className="w-full bg-brand-gold text-brand-coffee font-bold py-4 rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-lg"
                        >
                            Suscribirme Ahora
                        </button>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="text-sm text-brand-coffee/50 hover:text-brand-coffee font-medium"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If not expired, render the app!
    return children;
};

export default SubscriptionGuard;

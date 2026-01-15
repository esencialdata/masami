import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SubscriptionGuard({ children }) {
    const { tenant, loading } = useAuth();

    if (loading) return null;

    if (!tenant) {
        // Fallback if tenant not loaded yet or error
        return children;
    }

    const { plan_status, trial_ends_at } = tenant;
    const isTrialExpired = new Date() > new Date(trial_ends_at);
    const isActive = plan_status === 'active';

    if (isTrialExpired && !isActive) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-brand-gold">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-red-500">lock_clock</span>
                    </div>
                    <h2 className="text-2xl font-bold text-brand-coffee mb-2">Tu prueba ha terminado</h2>
                    <p className="text-brand-coffee/70 mb-8 leading-relaxed">
                        Esperamos que hayas disfrutado Miga. Para continuar horneando sin límites y acceder a tus recetas, suscríbete al Plan Panadero.
                    </p>

                    <button
                        onClick={() => window.location.href = 'https://buy.stripe.com/test_link'}
                        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                    >
                        Suscribirse ($899/mes)
                    </button>

                    <p className="mt-4 text-xs text-brand-coffee/40">
                        ¿Necesitas ayuda? Contacta a soporte.
                    </p>
                </div>
            </div>
        );
    }

    return children;
}

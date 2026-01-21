import React, { useState } from 'react';
import { supabase } from '../../services/api';

const OnboardingWizard = ({ onComplete }) => {
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Creating/Seeding
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!businessName.trim()) return;

        setLoading(true);
        setStep(2);
        setError(null);

        try {
            // Llamamos a la "Función Mágica" que crea Tenant + Profile + Seed Data
            const { data, error } = await supabase.rpc('create_tenant_with_owner', {
                business_name: businessName
            });

            if (error) throw error;

            // Exito!
            alert("¡EXITO! Tenant Creado: " + JSON.stringify(data));
            await new Promise(r => setTimeout(r, 2000));

            onComplete(); // Actualiza el estado global en App.jsx para redirigir al Dashboard

        } catch (err) {
            console.error("Error creating tenant:", err);
            // ALERTA DE BROWSER PARA DEBUGGING AGRESIVO
            alert("ERROR DETECTADO:\n" + (err.message || JSON.stringify(err)));

            // GUARDAMOS EL ERROR COMPLETO
            setError(err);
            setStep(1); // Volver al input
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-brand-coffee/10 relative overflow-hidden">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-brand-gold transition-all duration-1000 ease-in-out"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    ></div>
                </div>

                <div className="w-16 h-16 bg-brand-gold rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-gold/20">
                    <span className="material-symbols-outlined text-3xl">store</span>
                </div>

                {step === 1 ? (
                    <>
                        <h1 className="text-2xl font-bold text-brand-coffee mb-2">¡Bienvenido Chef! 👨‍🍳</h1>
                        <p className="text-brand-coffee/60 mb-6 text-sm">
                            Para comenzar, ¿cómo se llama tu negocio?
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-bold text-brand-coffee/50 uppercase ml-1">Nombre de la Panadería</label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="ej. Panadería La Esperanza"
                                    autoFocus
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all placeholder:text-gray-300 text-lg"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100 flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2 font-bold">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        Ocurrió un error:
                                    </div>
                                    <pre className="whitespace-pre-wrap font-mono text-[10px] w-full bg-white/50 p-2 rounded text-left">
                                        {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
                                    </pre>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!businessName.trim() || loading}
                                className="w-full bg-brand-gold text-brand-coffee font-bold py-4 rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Comenzar Aventura 🚀
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="py-8">
                        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-bold text-brand-coffee mb-2">Horneando tu espacio...</h2>
                        <p className="text-brand-coffee/60 text-sm animate-pulse">
                            Preparando inventario inicial...<br />
                            Configurando hornos...<br />
                            Limpiando mesas...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;

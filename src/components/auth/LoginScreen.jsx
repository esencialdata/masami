import React, { useState } from 'react';
import { supabase } from '../../services/api';

export default function LoginScreen({ onLogin, onBack, onRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Success handler usually managed by AuthContext via onAuthStateChange
            // But we can trigger a UI feedback or just wait for App to re-render
            // onLogin can be used for UI transitions if needed, though App usually handles it via `user` check
            // Success handler
            if (onLogin) {
                onLogin();
            }

        } catch (err) {
            console.error('Login error:', err);
            // Show specific error for debugging (translate common ones)
            let msg = 'Credenciales incorrectas o usuario no encontrado.';
            if (err.message.includes('Email not confirmed')) msg = 'Por favor confirma tu correo electrónico.';
            if (err.message.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 transition-colors duration-300 font-display">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-brand-coffee/5 relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 text-brand-coffee/50 hover:text-brand-gold transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}

                <img src="/app_icon.svg" className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-sm border border-brand-coffee/5" alt="Logo" />
                <h1 className="text-2xl font-bold text-brand-coffee mb-2">Bienvenido a Miga</h1>
                <p className="text-brand-coffee/60 mb-8 text-sm">Gestiona tu negocio de forma inteligente</p>

                {error && (
                    <div className="mb-4 flex flex-col gap-2">
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>

                        {error.includes('confirma tu correo') && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setLoading(true);
                                    const { error: resendError } = await supabase.auth.resend({
                                        type: 'signup',
                                        email: email,
                                        options: { emailRedirectTo: window.location.origin }
                                    });
                                    setLoading(false);
                                    if (resendError) setError(resendError.message);
                                    else setError('¡Correo reenviado! Revisa tu bandeja.');
                                }}
                                className="text-xs font-bold text-brand-gold hover:underline"
                            >
                                Reenviar correo de confirmación
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            required
                            autocomplete="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(null); }}
                            placeholder="Correo electrónico"
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/10 bg-brand-cream/50 text-brand-coffee placeholder:text-brand-coffee/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            required
                            autocomplete="current-password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(null); }}
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/10 bg-brand-cream/50 text-brand-coffee placeholder:text-brand-coffee/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-gold text-brand-cream font-bold py-3.5 px-4 rounded-xl hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>

                    <div className="flex justify-center mt-2">
                        <button
                            type="button"
                            onClick={async () => {
                                if (!email) {
                                    setError('Escribe tu correo primero para resetear la contraseña.');
                                    return;
                                }
                                setLoading(true);
                                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                                    redirectTo: window.location.origin,
                                });
                                setLoading(false);
                                if (resetError) setError(resetError.message);
                                else setError('Correo de recuperación enviado.');
                            }}
                            className="text-xs text-brand-coffee/50 hover:text-brand-gold transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-brand-coffee/5">
                    <p className="text-sm text-brand-coffee/60">
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={onRegister}
                            className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors"
                        >
                            Crear cuenta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

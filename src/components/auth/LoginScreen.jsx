import React, { useState } from 'react';

export default function LoginScreen({ onLogin, onBack, onRegister }) {
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pass === 'chelitoysantiago') {
            onLogin(e);
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-brand-coffee/5 relative">
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
                        className="w-full bg-brand-gold text-brand-cream font-bold py-4 rounded-xl hover:bg-brand-gold/90 transition-colors shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Entrar
                    </button>
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

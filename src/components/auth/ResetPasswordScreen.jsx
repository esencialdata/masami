import React, { useState } from 'react';
import { supabase } from '../../services/api';

export default function ResetPasswordScreen({ onPasswordUpdated }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage('¡Contraseña actualizada con éxito!');
            setTimeout(() => {
                if (onPasswordUpdated) onPasswordUpdated();
                // Force root navigation to clear hash and reset state
                window.location.href = '/';
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al actualizar contraseña');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-display">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-brand-coffee/5">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl text-brand-gold">lock_reset</span>
                </div>

                <h1 className="text-2xl font-bold text-brand-coffee mb-2">Nueva Contraseña</h1>
                <p className="text-brand-coffee/60 mb-8 text-sm">Establece una nueva contraseña para tu cuenta.</p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        {message}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Escribe tu nueva contraseña"
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/10 bg-brand-cream/50 text-brand-coffee placeholder:text-brand-coffee/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-gold text-brand-cream font-bold py-3.5 px-4 rounded-xl hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
                        >
                            {loading ? 'Guardando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

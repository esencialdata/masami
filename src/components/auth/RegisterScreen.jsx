import React, { useState } from 'react';

export default function RegisterScreen({ onLogin, onRegister }) {
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, we would validate and send to backend
        // For now, we simulate successful registration and login
        onRegister(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                <h1 className="text-2xl font-bold text-center text-brand-coffee mb-2">Crea tu cuenta</h1>
                <p className="text-center text-brand-coffee/60 mb-8 text-sm">Prueba Miga gratis por 7 días</p>

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
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-brand-coffee/20 bg-background-light focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-gold/20 transform transition-all active:scale-[0.98] mt-2"
                    >
                        Comenzar Prueba Gratis
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

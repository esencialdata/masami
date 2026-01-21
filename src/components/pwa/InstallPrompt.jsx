import React, { useState, useEffect } from 'react';
import { X, Share, MoreVertical, PlusSquare, Download } from 'lucide-react';

const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState(''); // 'ios' or 'android' or 'other'
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        // 1. Check if app is already installed (Standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) return;

        // 2. Check if user already dismissed it recently (e.g., 7 days)
        const dismissedTimestamp = localStorage.getItem('miga_install_dismissed');
        if (dismissedTimestamp) {
            const daysSinceDismissal = (Date.now() - parseInt(dismissedTimestamp)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissal < 7) return;
        }

        // 3. Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) {
            setPlatform('ios');
            setShowPrompt(true);
        } else if (isAndroid) {
            setPlatform('android');
            // Wait for beforeinstallprompt event for better UX, or show manual if not fired immediately
            // (Chrome on Android often fires this)
        }
    }, []);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setPlatform('android');

            // Check dismissal again to be safe
            const dismissedTimestamp = localStorage.getItem('miga_install_dismissed');
            if (dismissedTimestamp) {
                const daysSinceDismissal = (Date.now() - parseInt(dismissedTimestamp)) / (1000 * 60 * 60 * 24);
                if (daysSinceDismissal < 7) return;
            }

            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('miga_install_dismissed', Date.now().toString());
        setDeferredPrompt(null);
    };

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up pb-safe">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 md:max-w-md md:mx-auto">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <Download className="text-primary" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Instala Miga App</h3>
                            <p className="text-xs text-gray-500">Mejor experiencia, sin internet.</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    {platform === 'ios' && (
                        <div className="space-y-2">
                            <p>Para instalar en tu iPhone/iPad:</p>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li className="flex items-center gap-1">
                                    Toca el botón <span className="font-bold text-blue-500 flex items-center gap-1">Compartir <Share size={14} /></span>
                                </li>
                                <li className="flex items-center gap-1">
                                    Busca y selecciona <span className="font-bold flex items-center gap-1">Agregar a Inicio <PlusSquare size={14} /></span>
                                </li>
                            </ol>
                        </div>
                    )}

                    {platform === 'android' && (
                        <div className="space-y-3">
                            {deferredPrompt ? (
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-primary/30"
                                >
                                    Instalar Ahora
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p>Para instalar en Android:</p>
                                    <ol className="list-decimal pl-4 space-y-1">
                                        <li className="flex items-center gap-1">
                                            Toca el menú <span className="font-bold text-gray-600 flex items-center gap-1">More <MoreVertical size={14} /></span>
                                        </li>
                                        <li>
                                            Selecciona <span className="font-bold">Instalar aplicación</span>
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}

                    {platform !== 'ios' && platform !== 'android' && (
                        <p>Instala nuestra app desde el menú de tu navegador para un acceso más rápido.</p>
                    )}
                </div>
            </div>

            <style sx="true">{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default InstallPrompt;

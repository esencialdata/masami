import React, { useState } from 'react';
import { supabase } from '../../services/api';

const LandingPage = ({ onLogin, onGetStarted }) => {
    // Toggle for annual/monthly pricing
    const [isAnnual, setIsAnnual] = useState(false);

    // FAQ State
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="font-display bg-brand-cream text-brand-coffee selection:bg-brand-gold/30 selection:text-brand-coffee overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-coffee/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-12 flex items-center justify-center">
                            <img src="/logo-miga.svg" alt="Miga" className="h-full w-auto object-contain" />
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Características', id: 'features' },
                            { label: 'Precios', id: 'pricing' },
                            { label: 'Testimonios', id: 'testimonials' },
                            { label: 'FAQ', id: 'faq' }
                        ].map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="text-sm font-medium text-brand-coffee/80 hover:text-brand-gold transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(item.id);
                                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="text-sm font-medium text-brand-coffee/80 hover:text-brand-gold transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="bg-brand-gold text-brand-cream text-sm font-bold py-2.5 px-6 rounded-full hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
                        >
                            Prueba Gratis
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                {/* Decor pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-orange-200/10 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-8 text-center lg:text-left z-10">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-brand-coffee">
                                Deja de adivinar, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-orange-500">empieza a ganar.</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-brand-coffee/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                El primer sistema de ‘Inteligencia de Cocina’ para panaderías y dark kitchens. Controla tus costos y optimiza tu producción en tiempo real.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onGetStarted}
                                className="bg-brand-gold hover:bg-yellow-600 text-brand-coffee text-base font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(211,158,23,0.3)] transition-all hover:-translate-y-1"
                            >
                                Prueba Gratis por 7 Días
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 items-center lg:items-start">
                            <p className="text-xs font-medium text-brand-coffee/50 uppercase tracking-wider">No requiere tarjeta de crédito</p>
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-brand-coffee/5 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-brand-gold text-[20px]">schedule</span>
                                    <span className="text-sm font-semibold text-brand-coffee">Ahorra tiempo</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-brand-coffee/5 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-brand-gold text-[20px]">savings</span>
                                    <span className="text-sm font-semibold text-brand-coffee">Protege márgenes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:h-[600px] flex items-center justify-center perspective-[1000px]">
                        {/* Phone Mockup */}
                        <div className="relative w-[300px] h-[600px] bg-brand-cream rounded-[40px] border-8 border-brand-coffee shadow-2xl overflow-hidden transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500 box-border ring-1 ring-black/5">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-brand-coffee rounded-b-2xl z-20"></div>
                            {/* Screen Content */}
                            <div className="w-full h-full bg-brand-cream relative overflow-y-auto pt-8">
                                {/* Mock Header */}
                                <div className="px-4 py-2 flex justify-between items-center border-b border-brand-coffee/5">
                                    <span className="material-symbols-outlined text-brand-coffee">menu</span>
                                    <span className="text-sm font-bold text-brand-coffee">Miga</span>
                                    <div className="w-6 h-6 bg-brand-gold rounded-full"></div>
                                </div>
                                {/* Mock Dashboard */}
                                <div className="p-4 space-y-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-coffee/5">
                                        <h4 className="text-xs text-brand-coffee/60 uppercase">Producción de Hoy</h4>
                                        <div className="text-2xl font-bold text-brand-coffee mt-1">1,240 pzas</div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-brand-gold w-[70%] h-full rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                            <span className="material-symbols-outlined text-orange-500 mb-2">trending_up</span>
                                            <div className="text-xs text-brand-coffee/60">Ventas</div>
                                            <div className="font-bold text-brand-coffee">$12,450</div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <span className="material-symbols-outlined text-green-600 mb-2">attach_money</span>
                                            <div className="text-xs text-brand-coffee/60">Costo</div>
                                            <div className="font-bold text-brand-coffee">$4,200</div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-brand-coffee/5">
                                        <h4 className="text-sm font-bold text-brand-coffee">Pedidos Pendientes</h4>
                                        <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                                            <div className="bg-brand-gold/20 p-2 rounded-lg text-brand-gold font-bold text-xs">HH</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-brand-coffee">Huma Hotel Boutique</div>
                                                <div className="text-xs text-gray-400">200 Conchas</div>
                                            </div>
                                            <span className="text-xs font-bold text-orange-500">En Horno</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 font-bold text-xs">SC</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-brand-coffee">Señora Cárdenas</div>
                                                <div className="text-xs text-gray-400">Cheesecake grande</div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">Espera</span>
                                        </div>
                                    </div>
                                    {/* Mock FAB */}
                                    <div className="absolute bottom-6 right-6 w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center shadow-lg text-brand-coffee">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card Decoration */}
                        <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-xl shadow-lg border border-brand-coffee/5 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500">Merma Reducida</div>
                                    <div className="text-lg font-bold text-brand-coffee">-15%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agitation Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-brand-coffee">¿Te suena familiar?</h2>
                        <p className="text-brand-coffee/70 max-w-2xl mx-auto">Si manejas una panadería, probablemente te enfrentas a estos dolores de cabeza todos los días.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-brand-cream p-8 rounded-2xl border border-brand-coffee/5 hover:border-brand-gold/50 transition-colors group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-3xl">question_mark</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-brand-coffee">El Misterio del Dinero</h3>
                            <p className="text-brand-coffee/70 leading-relaxed">Nunca sabes exactamente cuánto ganaste realmente al final del día después de pagar insumos y nómina.</p>
                        </div>

                        <div className="bg-brand-cream p-8 rounded-2xl border border-brand-coffee/5 hover:border-brand-gold/50 transition-colors group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-3xl">receipt_long</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-brand-coffee">La Servilleta Matemática</h3>
                            <p className="text-brand-coffee/70 leading-relaxed">Cálculos manuales rápidos en papel que llevan a errores costosos y precios mal calculados.</p>
                        </div>

                        <div className="bg-brand-cream p-8 rounded-2xl border border-brand-coffee/5 hover:border-brand-gold/50 transition-colors group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-3xl">list_alt</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-brand-coffee">El Caos de los Pedidos</h3>
                            <p className="text-brand-coffee/70 leading-relaxed">Pedidos perdidos en WhatsApp, post-its volando y producción desorganizada que genera estrés.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20 bg-brand-cream-dark/30 relative overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-brand-coffee">
                                Tu libreta de usos múltiples, <br />
                                <span className="text-brand-gold">ahora es Digital e Inteligente.</span>
                            </h2>
                            <p className="text-brand-coffee/70 text-lg">
                                Deja de luchar con hojas de cálculo complicadas o libretas manchadas de harina. Miga centraliza todo tu negocio en un solo lugar.
                            </p>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-brand-coffee/5 shadow-sm">
                                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                                        <span className="material-symbols-outlined text-red-500">close</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-coffee">Otros Sistemas / Manual</h4>
                                        <p className="text-sm text-brand-coffee/60">Información dispersa y difícil de analizar.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border-l-4 border-brand-gold shadow-md transform translate-x-4 transition-transform">
                                    <div className="bg-brand-gold/20 p-2 rounded-full shrink-0">
                                        <span className="material-symbols-outlined text-brand-gold">check</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-coffee">Sistema Miga</h4>
                                        <p className="text-sm text-brand-coffee/60">Control total, costos automáticos y paz mental.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl group border border-brand-coffee/5">
                            <div className="absolute inset-0 bg-brand-coffee/80 flex flex-col items-center justify-center text-center p-8 z-10">
                                <span className="material-symbols-outlined text-6xl text-brand-gold mb-4">sync_saved_locally</span>
                                <h3 className="text-2xl font-bold text-white mb-2">Sincronización Total</h3>
                                <p className="text-white/80">Inventario, Recetas y Ventas hablando el mismo idioma.</p>
                            </div>
                            {/* Abstract Pattern background since we can't reliably load unsplash here without net access being blocked in some envs - just using CSS pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-coffee-light to-brand-coffee opacity-50"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-brand-gold font-bold tracking-wider uppercase text-sm mb-2 block">Público Objetivo</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-brand-coffee mb-6 leading-tight">
                            Diseñado para creadores exigentes
                        </h2>
                        <p className="text-xl text-brand-coffee/60">
                            Miga se adapta a tu modelo de negocio, eliminando el caos operativo desde el primer día.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card 1 */}
                        <div className="p-8 rounded-3xl bg-brand-cream border border-brand-coffee/5 hover:border-brand-gold/30 transition-all group hover:shadow-lg hover:-translate-y-1">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">storefront</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-coffee mb-3">Panaderías Clásicas</h3>
                            <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                Estandariza tus recetas y controla la producción diaria de mostrador para reducir mermas.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-8 rounded-3xl bg-brand-cream border border-brand-coffee/5 hover:border-brand-gold/30 transition-all group hover:shadow-lg hover:-translate-y-1">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">local_shipping</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-coffee mb-3">Dark Kitchens</h3>
                            <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                Gestión experta de rutas de entrega, logística y costos ocultos en modelos solo delivery.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-8 rounded-3xl bg-brand-cream border border-brand-coffee/5 hover:border-brand-gold/30 transition-all group hover:shadow-lg hover:-translate-y-1">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">cake</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-coffee mb-3">Repostería Fina</h3>
                            <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                Cotizador preciso para pasteles de diseño donde el tiempo y el detalle son dinero.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="p-8 rounded-3xl bg-brand-cream border border-brand-coffee/5 hover:border-brand-gold/30 transition-all group hover:shadow-lg hover:-translate-y-1">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">home_work</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-coffee mb-3">Home Bakers</h3>
                            <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                Profesionaliza tu pasión. Separa tus finanzas personales y calcula precios reales.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 Pillars Section (Zig-Zag) */}
            <section className="py-20 bg-white overflow-hidden" id="features">
                <div className="max-w-7xl mx-auto px-6 space-y-32">

                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-brand-gold font-bold tracking-wider uppercase text-sm">Características Principales</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-4 text-brand-coffee leading-tight">
                            El sistema operativo que tu panadería necesita
                        </h2>
                    </div>

                    {/* Block 1: Recipe Engineering */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center border border-brand-coffee/5 shadow-sm">
                                <span className="material-symbols-outlined text-3xl text-brand-gold">science</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-brand-coffee">No es magia, es Ingeniería.</h3>
                            <p className="text-lg text-brand-coffee/70 leading-relaxed">
                                Deja de calcular al tanteo. Miga desglosa tus costos al centavo, permitiéndote ajustar precios con confianza y detectar fugas invisibles.
                            </p>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            {/* Visual: Cost Breakdown Mockup */}
                            <div className="bg-brand-cream rounded-3xl p-6 border border-brand-coffee/5 shadow-2xl relative transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-white rounded-2xl shadow-sm border border-brand-coffee/5 overflow-hidden">
                                    <div className="p-4 border-b border-brand-coffee/5 flex justify-between items-center bg-brand-gold/5">
                                        <div className="font-bold text-brand-coffee">Rosca de Reyes Tradicional</div>
                                        <div className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Costo: $43.00</div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 text-brand-coffee/80">
                                                <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                                                Harina de Trigo (500g)
                                            </div>
                                            <span className="font-mono text-brand-coffee/60">$8.50</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 text-brand-coffee/80">
                                                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                                Mantequilla Gloria (150g)
                                            </div>
                                            <span className="font-mono text-brand-coffee/60">$28.20</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 text-brand-coffee/80">
                                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                Huevo Líquido (3pz)
                                            </div>
                                            <span className="font-mono text-brand-coffee/60">$6.30</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-dashed border-brand-coffee/10 flex justify-between items-center">
                                            <span className="text-xs font-bold text-brand-coffee/50 uppercase tracking-widest">Precio Sugerido (3x)</span>
                                            <span className="font-bold text-brand-coffee">$129.00</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Floating Badge */}
                                <div className="absolute -bottom-4 -left-4 bg-brand-coffee text-brand-gold px-4 py-2 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    Costeado
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Production Planner */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center border border-brand-coffee/5 shadow-sm">
                                <span className="material-symbols-outlined text-3xl text-brand-gold">calendar_month</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-brand-coffee">Tu Jefe de Producción Digital.</h3>
                            <p className="text-lg text-brand-coffee/70 leading-relaxed">
                                Genera automáticamente tu lista de horneado basada en pedidos reales. Nunca más hornearás de menos (perdiendo ventas) ni de más (tirando dinero).
                            </p>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            {/* Visual: Baking List Mockup */}
                            <div className="bg-brand-coffee rounded-3xl p-6 shadow-2xl relative transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-inner">
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                        <span className="font-bold text-brand-coffee">Producción: Martes 14</span>
                                        <span className="text-xs text-brand-coffee/50 bg-white border border-gray-200 px-2 py-1 rounded-full">Turno AM</span>
                                    </div>
                                    <div className="p-0">
                                        {[
                                            { item: 'Conchas Vainilla', qty: 50, done: true },
                                            { item: 'Croissants', qty: 32, done: false },
                                            { item: 'Baguette Tradicional', qty: 15, done: false },
                                            { item: 'Muffins Choco', qty: 24, done: false }
                                        ].map((row, i) => (
                                            <div key={i} className={`flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-brand-cream/30 transition-colors ${row.done ? 'bg-brand-cream/10' : ''}`}>
                                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${row.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                    {row.done && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-medium ${row.done ? 'text-gray-400 line-through' : 'text-brand-coffee'}`}>{row.item}</div>
                                                </div>
                                                <div className={`font-bold ${row.done ? 'text-gray-400' : 'text-brand-gold'}`}>{row.qty} pzas</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 3: Financial Intelligence */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center border border-brand-coffee/5 shadow-sm">
                                <span className="material-symbols-outlined text-3xl text-brand-gold">trending_up</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-brand-coffee">Escudo contra la Inflación.</h3>
                            <p className="text-lg text-brand-coffee/70 leading-relaxed">
                                ¿Subió el azúcar? Te avisamos al instante. Visualiza tu utilidad neta en tiempo real y detecta qué productos son tus estrellas y cuáles tus lastres.
                            </p>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            {/* Visual: Dashboard/Alert Mockup */}
                            <div className="bg-white rounded-3xl p-8 border border-brand-coffee/10 shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10"></div>

                                <div className="mb-6">
                                    <div className="text-sm text-brand-coffee/60 mb-1">Utilidad Neta (Hoy)</div>
                                    <div className="text-4xl font-extrabold text-brand-coffee">$2,840.00</div>
                                    <div className="text-green-500 text-sm font-bold flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-lg">arrow_upward</span> +12% vs ayer
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-start gap-3 animate-pulse duration-1000">
                                        <div className="bg-red-100 p-2 rounded-full mt-1">
                                            <span className="material-symbols-outlined text-red-500 text-sm">priority_high</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-brand-coffee text-sm">Alerta de Insumo</div>
                                            <p className="text-xs text-brand-coffee/70 mt-0.5">El precio del <strong>Azúcar Estándar</strong> subió un 15%. Actualiza tus costos.</p>
                                        </div>
                                    </div>

                                    <div className="h-32 flex items-end justify-between gap-2 px-2 pb-2 border-b border-brand-coffee/5">
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="w-full bg-brand-gold rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Secondary Grid Section (Bento Grid) */}
            <section className="py-24 bg-brand-cream/30">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-brand-coffee">Todo lo que necesitas para operar sin caos</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-2xl border border-brand-coffee/5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                            <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">delete_forever</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-brand-coffee mb-2">Reporte de Mermas</h4>
                                <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                    Registra desperdicios al momento. Convierte el 'se me quemó' en un dato financiero para reducir pérdidas.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-2xl border border-brand-coffee/5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                            <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">check_circle</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-brand-coffee mb-2">Rutinas de Cierre</h4>
                                <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                    Checklists digitales para asegurar que hornos y gas se apaguen siempre antes de irse.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-2xl border border-brand-coffee/5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                            <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">local_shipping</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-brand-coffee mb-2">Logística Inteligente</h4>
                                <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                    Organiza repartos por Colonias y Zonas para optimizar tus rutas de entrega.
                                </p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white p-8 rounded-2xl border border-brand-coffee/5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                            <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                                <span className="material-symbols-outlined text-brand-gold text-2xl">inventory_2</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-brand-coffee mb-2">Control de Stock</h4>
                                <p className="text-brand-coffee/70 text-sm leading-relaxed">
                                    Alertas automáticas antes de que te quedes sin empaques o insumos críticos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 bg-brand-coffee text-brand-cream relative overflow-hidden" id="testimonials">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d39e17 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <span className="material-symbols-outlined text-6xl text-brand-gold/40 mb-6">format_quote</span>
                    <blockquote className="text-2xl md:text-3xl font-medium leading-normal mb-10 text-brand-cream">
                        "Desde que usamos Miga, redujimos nuestra merma un 18% en el primer mes. Es como tener un gerente de costos trabajando 24/7, pero sin que se coma el pan."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-brand-gold p-1 bg-brand-coffee">
                            <div className="w-full h-full rounded-full bg-brand-coffee-light overflow-hidden flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-brand-cream/20">person</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-lg text-brand-gold">Chelito de Montiel</div>
                            <div className="text-sm text-brand-cream/60">"Chelito de Montiel, Pan Artesanal Europeo"</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-brand-cream relative" id="pricing">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-coffee">Planes diseñados para panaderos</h2>
                        <p className="text-brand-coffee/70 mb-8">Elige la herramienta que mejor se adapte al tamaño de tu horno.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-2xl border border-brand-coffee/10 flex flex-col hover:border-brand-coffee/20 transition-all">
                            <h3 className="text-lg font-bold text-brand-coffee/60 uppercase tracking-widest mb-2">Emprendedor</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-brand-coffee">{isAnnual ? '$399' : '$499'}</span>
                                <span className="text-brand-coffee/60">/mes</span>
                            </div>
                            <p className="text-sm text-brand-coffee/70 mb-8">Ideal para dark kitchens y panaderías caseras que inician.</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['50 Recetas', 'Costeo Básico', '1 Usuario'].map(feat => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-brand-coffee/80">
                                        <span className="material-symbols-outlined text-green-500 text-lg">check</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onGetStarted} className="w-full py-3 px-4 rounded-lg border-2 border-brand-coffee/20 text-brand-coffee font-bold hover:bg-brand-coffee hover:text-white transition-colors">
                                Comenzar Prueba de 7 Días
                            </button>
                        </div>

                        {/* Card 2 (Highlighted) */}
                        <div className="bg-white p-8 rounded-2xl border-2 border-brand-gold relative shadow-xl shadow-brand-gold/10 transform md:-translate-y-4 flex flex-col">
                            <div className="absolute top-0 right-0 bg-brand-gold text-brand-coffee text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MÁS POPULAR</div>
                            <h3 className="text-2xl font-bold mb-2 text-brand-coffee">Plan Panadero</h3>
                            <div className="text-5xl font-extrabold mb-2 text-brand-gold">{isAnnual ? '$749' : '$899'}<span className="text-xl text-brand-coffee/40 font-medium">/mes</span></div>
                            <p className="text-brand-coffee/60 mb-6">Perfecto para negocios en crecimiento</p>

                            <ul className="space-y-4 mb-8 text-left">
                                {['Recetas ilimitadas', 'Cálculo de costos automático', 'Gestión de inventario simple', 'Lista de compras inteligente', 'Soporte por WhatsApp'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-brand-coffee/80">
                                        <div className="w-5 h-5 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                                            <span className="material-symbols-outlined text-xs font-bold">check</span>
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={onGetStarted}
                                className="w-full bg-brand-gold text-brand-cream font-bold py-4 rounded-xl hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20 hover:-translate-y-1 block"
                            >
                                Comenzar Prueba de 7 Días
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white" id="faq">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12 text-brand-coffee">Preguntas Frecuentes</h2>
                    <div className="space-y-4">
                        {[
                            { q: "¿Qué necesito para usar Miga?", a: "Solo necesitas un dispositivo con acceso a internet (computadora, tablet o celular). No necesitas instalar nada, todo funciona en la nube." },
                            { q: "¿Es difícil cargar mis recetas?", a: "Para nada. Hemos diseñado un asistente de carga rápida. Además, nuestro equipo de soporte te ayuda a migrar tus primeros productos para que empieces con el pie derecho." },
                            { q: "¿Funciona si no soy una panadería?", a: "Sí, Miga funciona excelente para pizzerías, dark kitchens, repostería fina y cualquier negocio que base su producción en recetas y transformación de insumos." }
                        ].map((item, idx) => (
                            <div key={idx} className="group bg-brand-cream rounded-xl p-4 cursor-pointer border border-brand-coffee/5" onClick={() => toggleFaq(idx)}>
                                <div className="flex items-center justify-between gap-1.5 text-brand-coffee font-bold">
                                    <h3 className="text-lg">{item.q}</h3>
                                    <span className={`material-symbols-outlined transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                                <div className={`grid transition-all duration-300 ease-in-out ${activeFaq === idx ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <p className="leading-relaxed text-brand-coffee/70">{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-brand-coffee text-brand-cream pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand-cream">¿Listo para sacarle toda la miga a tu negocio?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <button
                                onClick={onGetStarted}
                                className="bg-brand-gold hover:bg-yellow-600 text-brand-coffee text-lg font-bold py-3 px-10 rounded-xl transition-all shadow-glow hover:-translate-y-1"
                            >
                                Prueba Gratis 7 Días
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-brand-cream/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 opacity-80">
                            <img src="/logo-miga.svg" alt="Miga Logo" className="w-6 h-6 object-contain" />
                            <span className="font-bold text-xl">Miga</span>
                        </div>
                        <div className="flex gap-8 text-sm text-brand-cream/60">
                            <a href="#" className="hover:text-brand-gold transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-brand-gold transition-colors">Términos</a>
                            <a href="#" className="hover:text-brand-gold transition-colors">Soporte</a>
                        </div>
                        <div className="text-sm text-brand-cream/40">
                            © 2024 Miga Tech. Hecho con harina y código.
                        </div>
                    </div>

                    {/* DEBUG TOOL */}
                    <div className="mt-8 text-center text-xs text-white/20">
                        <button
                            onClick={async () => {
                                alert('Verificando sesión...');
                                const { data, error } = await supabase.auth.getUser();
                                if (error) alert('Error: ' + error.message);
                                else if (data?.user) alert('Sesión OK: ' + data.user.email);
                                else alert('No hay sesión activa (NULL)');
                            }}
                            className="hover:text-white underline"
                        >
                            [Debug] Verificar Estado de Sesión
                        </button>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

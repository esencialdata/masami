import React, { useState } from 'react';

const LandingPage = ({ onLogin }) => {
    // Toggle for annual/monthly pricing
    const [isAnnual, setIsAnnual] = useState(false);

    // FAQ State
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="font-display bg-brand-cream text-brand-coffee selection:bg-brand-gold/30 selection:text-brand-coffee overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-coffee/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 text-brand-gold flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">bakery_dining</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-brand-coffee">MasaMi</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {['Características', 'Precios', 'Testimonios', 'FAQ'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace('á', 'a')}`}
                                className="text-sm font-medium text-brand-coffee/80 hover:text-brand-gold transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(item.toLowerCase().replace('á', 'a'));
                                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="hidden sm:block text-sm font-semibold text-brand-coffee hover:text-brand-gold transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={onLogin}
                            className="bg-brand-gold hover:bg-yellow-600 text-brand-coffee font-bold py-2.5 px-6 rounded-full text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                        >
                            Empieza Gratis
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
                                onClick={onLogin}
                                className="bg-brand-gold hover:bg-yellow-600 text-brand-coffee text-base font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(211,158,23,0.3)] transition-all hover:-translate-y-1"
                            >
                                Empieza Gratis por 14 Días
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
                                    <span className="text-sm font-bold text-brand-coffee">MasaMi</span>
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
                                Deja de luchar con hojas de cálculo complicadas o libretas manchadas de harina. MasaMi centraliza todo tu negocio en un solo lugar.
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
                                        <h4 className="font-bold text-brand-coffee">Sistema MasaMi</h4>
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
                            MasaMi se adapta a tu modelo de negocio, eliminando el caos operativo desde el primer día.
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

            {/* Features Section */}
            <section className="py-20 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-brand-gold font-bold tracking-wider uppercase text-sm">Características Principales</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 text-brand-coffee">Todo lo que necesitas para crecer</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-brand-cream rounded-2xl overflow-hidden border border-brand-coffee/5 hover:shadow-lg transition-all">
                            <div className="p-8 pb-0">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-brand-coffee">
                                    <span className="material-symbols-outlined text-brand-gold">science</span> Ingeniería de Receta
                                </h3>
                                <p className="text-brand-coffee/70 mb-6">Calcula el costo exacto de cada gramo. Ajusta rendimientos y detecta fugas de dinero en tus formulaciones.</p>
                            </div>
                            <div className="bg-white mx-8 mt-2 rounded-t-xl border border-b-0 border-brand-coffee/10 h-48 p-4 shadow-sm">
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                                    <div className="space-y-2 mt-2">
                                        <div className="flex justify-between text-xs text-gray-400 border-b pb-1"><span>Harina Trigo</span><span>$12.50/kg</span></div>
                                        <div className="flex justify-between text-xs text-gray-400 border-b pb-1"><span>Mantequilla</span><span>$85.00/kg</span></div>
                                        <div className="flex justify-between text-xs text-gray-400 border-b pb-1"><span>Huevo</span><span>$42.00/kg</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-brand-cream rounded-2xl overflow-hidden border border-brand-coffee/5 hover:shadow-lg transition-all">
                            <div className="p-8 pb-0">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-brand-coffee">
                                    <span className="material-symbols-outlined text-brand-gold">calendar_month</span> Planificador de Producción
                                </h3>
                                <p className="text-brand-coffee/70 mb-6">Genera listas de producción diarias basadas en pedidos reales y proyecciones de venta.</p>
                            </div>
                            <div className="bg-white mx-8 mt-2 rounded-t-xl border border-b-0 border-brand-coffee/10 h-48 p-4 shadow-sm">
                                <div className="grid grid-cols-4 gap-2 h-full">
                                    <div className="bg-brand-gold/10 rounded-lg p-2 flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-brand-gold">LUN</span>
                                        <div className="w-full h-1 bg-brand-gold rounded"></div>
                                        <div className="w-full h-1 bg-brand-gold/50 rounded"></div>
                                    </div>
                                    {['MAR', 'MIE', 'JUE'].map(day => (
                                        <div key={day} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                            <div className="w-full h-1 bg-gray-300 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-brand-cream rounded-2xl overflow-hidden border border-brand-coffee/5 hover:shadow-lg transition-all">
                            <div className="p-8 pb-0">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-brand-coffee">
                                    <span className="material-symbols-outlined text-brand-gold">trending_up</span> Detector de Inflación
                                </h3>
                                <p className="text-brand-coffee/70 mb-6">MasaMi te alerta cuando el precio de un insumo sube y afecta tu margen de ganancia.</p>
                            </div>
                            <div className="bg-white mx-8 mt-2 rounded-t-xl border border-b-0 border-brand-coffee/10 h-48 p-4 relative shadow-sm">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-md border border-red-100 p-3 rounded-lg flex items-center gap-3 w-5/6">
                                    <div className="bg-red-100 p-2 rounded-full text-red-500">
                                        <span className="material-symbols-outlined text-sm">warning</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-brand-coffee">Alerta de Precio</div>
                                        <div className="text-[10px] text-gray-500">Azúcar subió un 5%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-brand-cream rounded-2xl overflow-hidden border border-brand-coffee/5 hover:shadow-lg transition-all">
                            <div className="p-8 pb-0">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-brand-coffee">
                                    <span className="material-symbols-outlined text-brand-gold">local_shipping</span> Logística Inteligente
                                </h3>
                                <p className="text-brand-coffee/70 mb-6">Organiza rutas de entrega y gestión de inventario para dark kitchens y múltiples sucursales.</p>
                            </div>
                            <div className="bg-white mx-8 mt-2 rounded-t-xl border border-b-0 border-brand-coffee/10 h-48 p-0 overflow-hidden shadow-sm relative">
                                <div className="w-full h-full bg-gray-200 relative">
                                    <div className="absolute top-8 left-12 w-3 h-3 bg-brand-gold rounded-full ring-4 ring-brand-gold/30"></div>
                                    <div className="absolute bottom-12 right-20 w-3 h-3 bg-brand-coffee rounded-full"></div>
                                    {/* Map-like lines */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <path d="M 60 44 Q 150 100 250 150" stroke="#d39e17" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                                    </svg>
                                </div>
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
                        "Desde que usamos MasaMi, redujimos nuestra merma un 18% en el primer mes. Es como tener un gerente de costos trabajando 24/7, pero sin que se coma el pan."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-brand-gold p-1 bg-brand-coffee">
                            <div className="w-full h-full rounded-full bg-brand-coffee-light overflow-hidden flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-brand-cream/20">person</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-lg text-brand-gold">Chelito de Montiel</div>
                            <div className="text-sm text-brand-cream/60">Dueña de "La Artesana"</div>
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

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className={`text-sm font-bold ${!isAnnual ? 'text-brand-coffee' : 'text-brand-coffee/60'}`}>Mensual</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-14 h-8 bg-brand-coffee rounded-full relative transition-colors focus:outline-none ring-1 ring-brand-coffee/10"
                            >
                                <div className={`absolute left-1 top-1 bg-brand-gold w-6 h-6 rounded-full transition-transform ${isAnnual ? 'translate-x-6' : ''}`}></div>
                            </button>
                            <span className={`text-sm font-bold ${isAnnual ? 'text-brand-coffee' : 'text-brand-coffee/60'}`}>
                                Anual <span className="text-brand-gold text-xs ml-1">(Ahorra 2 meses)</span>
                            </span>
                        </div>
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
                            <button onClick={onLogin} className="w-full py-3 px-4 rounded-lg border-2 border-brand-coffee/20 text-brand-coffee font-bold hover:bg-brand-coffee hover:text-white transition-colors">
                                Elegir Emprendedor
                            </button>
                        </div>

                        {/* Card 2 (Highlighted) */}
                        <div className="bg-white p-8 rounded-2xl border-2 border-brand-gold relative shadow-xl shadow-brand-gold/10 transform md:-translate-y-4 flex flex-col">
                            <div className="absolute top-0 right-0 bg-brand-gold text-brand-coffee text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MÁS POPULAR</div>
                            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-widest mb-2">Maestro</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-brand-coffee">{isAnnual ? '$749' : '$899'}</span>
                                <span className="text-brand-coffee/60">/mes</span>
                            </div>
                            <p className="text-sm text-brand-coffee/70 mb-8">Para panaderías establecidas con equipo de producción.</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['Recetas Ilimitadas', 'Planificador de Producción', 'Alertas de Inflación', '3 Usuarios + Contador'].map(feat => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-brand-coffee">
                                        <span className="material-symbols-outlined text-brand-gold text-lg">check</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={onLogin}
                                className="w-full py-3 px-4 rounded-lg bg-brand-gold text-brand-coffee font-bold hover:bg-yellow-600 transition-colors shadow-lg shadow-brand-gold/20"
                            >
                                Elegir Maestro
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
                            { q: "¿Qué necesito para usar MasaMi?", a: "Solo necesitas un dispositivo con acceso a internet (computadora, tablet o celular). No necesitas instalar nada, todo funciona en la nube." },
                            { q: "¿Es difícil cargar mis recetas?", a: "Para nada. Hemos diseñado un asistente de carga rápida. Además, nuestro equipo de soporte te ayuda a migrar tus primeros productos para que empieces con el pie derecho." },
                            { q: "¿Funciona si no soy una panadería?", a: "Sí, MasaMi funciona excelente para pizzerías, dark kitchens, repostería fina y cualquier negocio que base su producción en recetas y transformación de insumos." }
                        ].map((item, idx) => (
                            <div key={idx} className="group bg-brand-cream rounded-xl p-4 cursor-pointer border border-brand-coffee/5" onClick={() => toggleFaq(idx)}>
                                <div className="flex items-center justify-between gap-1.5 text-brand-coffee font-bold">
                                    <h3 className="text-lg">{item.q}</h3>
                                    <span className={`material-symbols-outlined transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === idx ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
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
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-2xl">¿Listo para sacarle toda la miga a tu negocio?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <button
                                onClick={onLogin}
                                className="bg-brand-gold hover:bg-yellow-600 text-brand-coffee text-lg font-bold py-3 px-10 rounded-xl transition-all shadow-glow hover:-translate-y-1"
                            >
                                Prueba Gratis 14 Días
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-brand-cream/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 opacity-80">
                            <span className="material-symbols-outlined text-brand-gold">bakery_dining</span>
                            <span className="font-bold text-xl">MasaMi</span>
                        </div>
                        <div className="flex gap-8 text-sm text-brand-cream/60">
                            <a href="#" className="hover:text-brand-gold transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-brand-gold transition-colors">Términos</a>
                            <a href="#" className="hover:text-brand-gold transition-colors">Soporte</a>
                        </div>
                        <div className="text-sm text-brand-cream/40">
                            © 2024 MasaMi Tech. Hecho con harina y código.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

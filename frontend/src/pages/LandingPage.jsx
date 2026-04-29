import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    MapPin,
    FileText,
    Database,
    CalendarClock,
    Activity, MapIcon, Truck, Receipt, Box, PlusCircle, LayoutDashboard,
    ChevronLeft, ChevronRight
} from 'lucide-react';

const features = [
    {
        title: "Logística Inteligente",
        description: "Mapa em tempo real para monitorar entregas e recolhas. Otimize rotas e reduza custos operacionais.",
        icon: <MapPin size={32} />,
        image: "/screenshots/logistica.png"
    },
    {
        title: "Gestão Financeira",
        description: "Controle total sobre faturas em aberto e histórico de pagamentos automatizado.",
        icon: <Receipt size={32} />,
        image: "/screenshots/financeiro.png"
    },
    {
        title: "Agendamentos Precisos",
        description: "Evite conflitos e maximize a taxa de ocupação dos seus equipamentos.",
        icon: <CalendarClock size={32} />,
        image: "/screenshots/agendamentos.png"
    },
    {
        title: "App Totalmente Mobile-friendly",
        description: "Site responsivo e otimizado para mobile.",
        icon: <Activity size={32} />,
        image: "/screenshots/mobile-friendly.png"
    }
];

const LandingPage = () => {
    const [activeFeature, setActiveFeature] = useState(0);

    const nextFeature = () => {
        setActiveFeature((prev) => (prev + 1) % features.length);
    };

    const prevFeature = () => {
        setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
    };

    useEffect(() => {
        const timer = setInterval(nextFeature, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-blue-500/30">

            {/* NAVBAR MINIMALISTA */}
            <nav className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white tracking-widest uppercase">
                            Dumply<span className="text-blue-500">.</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400">
                        <a href="#plataforma" className="hover:text-white transition-colors">Plataforma</a>
                        <a href="#solucoes" className="hover:text-white transition-colors">Soluções</a>
                        <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/auth/login" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
                            Entrar
                        </Link>
                        <Link to="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
                            Solicitar Cotação
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION - FOCADA NO PRODUTO */}
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 lg:pt-32 lg:pb-32 flex flex-col lg:flex-row items-center gap-16 relative">

                {/* TEXTO - ESQUERDA */}
                <div className="w-full lg:w-1/2 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
                        <Activity size={12} className="text-blue-500" />
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Dumply Manager v1.8 — Beta Test</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1] mb-6 italic">
                        O SISTEMA DE OPERAÇÃO PARA LOCADORAS<span className="text-blue-500">.</span>
                    </h1>

                    <p className="text-base text-gray-400 leading-relaxed max-w-lg mb-10 font-medium">
                        Centralize sua logística, contratos e financeiro em um único terminal. O Dumply foi projetado para transformar a gestão de ativos físicos em uma operação digital de alta performance.
                    </p>

                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to="/auth/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95">
                                Solicitar Cotação
                                <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
                {/* CARROSSEL DE PREVIEW - DIREITA */}
                <div className="w-full lg:w-1/2 relative group">
                    {/* Efeito de brilho atrás do carrossel */}
                    <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full group-hover:bg-blue-600/30 transition-all duration-1000"></div>

                    <div className="relative bg-gray-900 border border-white/10 rounded-4xl h-87.5 md:h-112.5 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                        {/* Barra Superior Estilo Browser */}
                        <div className="bg-gray-800/50 border-b border-white/5 px-6 py-3 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                {features[activeFeature].title}
                            </div>
                        </div>

                        {/* Imagem da Tela */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeFeature}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="relative h-full w-full"
                            >
                                <img
                                    src={features[activeFeature].image}
                                    alt={features[activeFeature].title}
                                    className="w-full h-full object-cover object-top"
                                />

                                {/* Overlay de degradê para suavizar a parte inferior */}
                                <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none"></div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Botões de Navegação */}
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                            <button
                                onClick={prevFeature}
                                className="p-2 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto hover:bg-blue-600 hover:border-blue-500"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextFeature}
                                className="p-2 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto hover:bg-blue-600 hover:border-blue-500"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Barras de Local (Navigation Dots/Bars) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {features.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveFeature(i)}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        activeFeature === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </main>

            {/* SEÇÃO DE PREÇOS E PLANOS */}
            <section id="planos" className="border-t border-white/5 bg-[#0a0a0a] py-24 relative overflow-hidden justify-center">
                {/* Decoração de fundo opcional */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter italic">
                            ESCALA SOB MEDIDA<span className="text-blue-500">.</span>
                        </h2>
                        <p className="text-gray-400 text-sm max-w-xl mx-auto font-medium">
                            Um plano simples e transparente para operar sua locadora com o Dumply. Sem limites de ativos e sem complexidade.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-blue-600/5 border border-blue-500/30 p-10 rounded-3xl flex flex-col relative max-w-md w-full shadow-2xl shadow-blue-600/10">
                            <div className="mb-8 text-center">
                                <h3 className="text-white text-xl font-bold mb-1 text-blue-400">Plano Único Dumply</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest font-mono">Todas as funcionalidades incluídas</p>
                            </div>

                            <div className="mb-10 flex items-baseline justify-center gap-2">
                                <span className="text-5xl font-black text-white italic">R$ 69,99</span>
                                <span className="text-gray-400 text-xs font-medium">/mês</span>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {['Ativos Ilimitados', 'Logística com Mapas em Tempo Real', 'Dashboard Financeiro Completo', 'Integração com API', 'Suporte Prioritário'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                                        <Activity size={14} className="text-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link to="auth/register" className="w-full py-4 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 text-center">
                                Começar Agora
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-12 text-xs text-gray-400 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-400">Dumply<span className="text-blue-500">.</span></span>
                        <span className="ml-2">© 2026 — Gestão de Equipamentos e Locações</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
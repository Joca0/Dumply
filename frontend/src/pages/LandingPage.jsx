import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    MapPin,
    FileText,
    Database,
    CalendarClock,
    Activity, MapIcon, Truck, Receipt, Box, PlusCircle, LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
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
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Dumply Manager v1.8 — Beta Test</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1] mb-6 italic">
                        O SISTEMA DE OPERAÇÃO PARA LOCADORAS<span className="text-blue-500">.</span>
                    </h1>

                    <p className="text-base text-gray-400 leading-relaxed max-w-lg mb-10 font-medium">
                        Centralize sua logística, contratos e financeiro em um único terminal. O Dumply foi projetado para transformar a gestão de ativos físicos em uma operação digital de alta performance.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link to="/auth/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95">
                            Solicitar Cotação
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
                {/* VISUAL/MOCKUP - DIREITA (Simulando o Dashboard Real) */}
                <div className="w-full lg:w-1/2 relative group">
                    {/* Efeito de brilho atrás do mockup */}
                    <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full group-hover:bg-blue-600/30 transition-all duration-1000"></div>

                    <div className="relative bg-gray-950 border border-white/10 rounded-[2rem] p-4 shadow-2xl overflow-hidden scale-95 lg:scale-100 transition-transform duration-700 group-hover:scale-[1.02]">

                        {/* Barra superior da janela (Browser Style) */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                            </div>
                            <div className="bg-gray-900 px-3 py-1 rounded-lg border border-white/5 text-[10px] text-gray-500 font-mono">
                                app.dumply.com/dashboard
                            </div>
                        </div>

                        {/* MINI DASHBOARD CONTENT - REPLICA REAL DO DASHBOARD.JSX */}
                        <div className="space-y-6 transform scale-[0.85] origin-top">

                            {/* 1. Header do Mockup (Fiel ao Dashboard.jsx) */}
                            <header className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-600 rounded-lg">
                                        <LayoutDashboard size={16} className="text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-white tracking-tight">Dashboard Dumply<span className="text-blue-500">.</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[8px] font-bold">
                                    <PlusCircle size={12} />
                                    Nova Operação
                                </div>
                            </header>

                            {/* 2. GRID PRINCIPAL (REPLICA DO LAYOUT REAL) */}
                            <div className="grid grid-cols-12 gap-3">

                                {/* CARD PRINCIPAL - OPERAÇÃO (7 colunas) */}
                                <div className="col-span-7 bg-gray-900 border border-gray-800 rounded-[1.5rem] p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 translate-x-4 -translate-y-4">
                                        <Truck size={100} />
                                    </div>
                                    <div className="relative z-10">
                                        <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">Locações Ativas</span>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-3xl font-black text-white italic">42</span>
                                            <span className="text-[8px] text-blue-400 font-medium">Em campo</span>
                                        </div>
                                        <div className="mt-4 inline-flex items-center gap-1 bg-white text-blue-600 px-3 py-1 rounded-lg text-[7px] font-bold">
                                            Monitorar <ArrowRight size={10} />
                                        </div>
                                    </div>
                                </div>

                                {/* COLUNA LATERAL (5 colunas) */}
                                <div className="col-span-5 flex flex-col gap-3">
                                    <div className="bg-gray-900 border border-gray-800 rounded-[1.5rem] p-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[6px] font-bold text-gray-500 uppercase">Saídas</span>
                                            <CalendarClock size={10} className="text-gray-400" />
                                        </div>
                                        <div className="text-xl font-black text-white">12</div>
                                    </div>
                                    <div className="bg-gray-900 border border-gray-800 rounded-[1.5rem] p-3 border-amber-500/20">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[6px] font-bold text-gray-500 uppercase">Aberto</span>
                                            <Receipt size={10} className="text-amber-500/50" />
                                        </div>
                                        <div className="text-xl font-black text-amber-500">R$ 14k</div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. NAVEGAÇÃO RÁPIDA (REPLICA DO GRID DE ICONES) */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-px flex-1 bg-gray-900"></div>
                                    <span className="text-[6px] font-bold text-gray-700 uppercase tracking-widest">Navegação</span>
                                    <div className="h-px flex-1 bg-gray-900"></div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { icon: MapIcon, color: 'text-indigo-400' },
                                        { icon: Truck, color: 'text-amber-400' },
                                        { icon: Receipt, color: 'text-emerald-400' },
                                        { icon: Box, color: 'text-blue-400' }
                                    ].map((item, i) => (
                                        <div key={i} className="aspect-square bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-center group-hover:border-gray-700 transition-colors">
                                            <item.icon size={14} className={item.color} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* SEÇÃO DE FEATURES TÉCNICAS */}
            <section id="funcionalidades" className="border-t border-white/5 bg-[#0a0a0a] py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16">
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter italic">OPERAÇÃO EM TEMPO REAL<span className="text-blue-500">.</span></h2>
                        <p className="text-gray-500 text-sm max-w-2xl font-medium">Projetado para lidar com o ciclo de vida completo de ativos físicos, da saída do pátio até o faturamento final.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl hover:border-blue-500/30 transition-all group">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin size={24} className="text-blue-500" />
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Logística Inteligente</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Mapa em tempo real para monitorar entregas e recolhas. Otimize rotas e reduza custos operacionais com geolocalização nativa.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl hover:border-amber-500/30 transition-all group">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Receipt size={24} className="text-amber-500" />
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Gestão Financeira</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Controle total sobre faturas em aberto e histórico de pagamentos. Automatize a cobrança e tenha previsibilidade de caixa.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <CalendarClock size={24} className="text-indigo-500" />
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Agendamentos Precisos</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Evite conflitos e maximize a taxa de ocupação dos seus equipamentos com um sistema de reserva e disponibilidade inteligente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO DE PREÇOS E PLANOS */}
            <section id="planos" className="border-t border-white/5 bg-[#0a0a0a] py-24 relative overflow-hidden justify-center">
                {/* Decoração de fundo opcional */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter italic">
                            ESCALA SOB MEDIDA<span className="text-blue-500">.</span>
                        </h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium">
                            Um plano simples e transparente para operar sua locadora com o Dumply. Sem limites de ativos e sem complexidade.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-blue-600/5 border border-blue-500/30 p-10 rounded-[2.5rem] flex flex-col relative max-w-md w-full shadow-2xl shadow-blue-600/10">
                            <div className="mb-8 text-center">
                                <h3 className="text-white text-xl font-bold mb-1 text-blue-400">Plano Único Dumply</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest font-mono">Todas as funcionalidades incluídas</p>
                            </div>

                            <div className="mb-10 flex items-baseline justify-center gap-2">
                                <span className="text-5xl font-black text-white italic">R$ 69,99</span>
                                <span className="text-gray-500 text-xs font-medium">/mês</span>
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
            <footer className="border-t border-white/5 py-12 text-xs text-gray-500 bg-[#0a0a0a]">
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
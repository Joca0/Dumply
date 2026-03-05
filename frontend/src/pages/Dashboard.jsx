import React, { useEffect, useState } from 'react';
import { getDashboardStats, completeWelcome } from '../api';
import {
  Package,
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Truck,
  Users,
  Box,
  Receipt,
  PlusCircle, CalendarClock, BarChart3, Clock, ArrowRight, Zap, BarChart2
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext.jsx";
import WelcomeStep from "@/pages/WelcomeStep.jsx";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalRentals: 0, openInvoices: 0 });
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Se o usuário estiver logado e for o primeiro login, mostra o modal
    if (user && user.firstLogin) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleCloseWelcome = async () => {
    try {
      await completeWelcome(); // Chama o back-end para marcar como visto
      await refreshUser(); // Atualiza os dados do usuário no contexto global
      setShowWelcome(false); // Fecha o modal :)
    } catch (error) {
      console.error("Erro ao finalizar boas-vindas", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardStats();
        setStats({
          totalRentals: res.data.totalActiveRentals || 0,
          openInvoices: res.data.openInvoicesCount || 0,
          totalScheduled: res.data.totalScheduledRentals || 0
        });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const menuItems = [
    { title: 'Logística', sub: 'Mapa em tempo real', to: '/map', icon: <MapIcon size={24} />, color: 'text-indigo-400' },
    { title: 'Locações', sub: 'Contratos ativos', to: '/rentals', icon: <Truck size={24} />, color: 'text-amber-400' },
    { title: 'Faturas', sub: 'Financeiro', to: '/invoices', icon: <Receipt size={24} />, color: 'text-emerald-400' },
    { title: 'Agendamentos', sub: 'Contratos agendados', to: '/scheduled', icon: <CalendarClock size={24} />, color: 'text-indigo-400'},
    { title: 'Equipamentos', sub: 'Base de equipamentos', to: '/equipments', icon: <Box size={24} />, color: 'text-blue-400' },
    { title: 'Clientes', sub: 'Base de dados', to: '/customers', icon: <Users size={24} />, color: 'text-purple-400' },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-blue-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
    );
  }

  return (
      <div className="relative">
        {/* Se showWelcome for true, exibe o componente como um overlay fixo */}
        {showWelcome && (
            <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <WelcomeStep onComplete={handleCloseWelcome} />
            </div>
        )}
        <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-950 text-white">

          {/* 1. TOP BAR REFINADA */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <LayoutDashboard size={24} className="fill-white" />
                </div>
                <span className="font-bold tracking-tight text-white">Dashboard Dumply<span className="text-blue-500">.</span></span>
              </h2>
            </div>

            <div className="flex gap-3">
              <Link to="/rentals/new" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                <PlusCircle size={20} />
                Nova Operação
              </Link>
            </div>
          </header>

          {/* 2. GRID PRINCIPAL (ESTILO COMMAND CENTER) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">

            {/* CARD PRINCIPAL - OPERAÇÃO (6 colunas) */}
            <div className="lg:col-span-7 bg-linear-to-br bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 p-4 opacity-15 translate-x-10 -translate-y-10">
                <Truck size={280} />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-white/80 font-bold uppercase text-xs tracking-[0.2em]">Locações Ativas</h3>
                  <div className="flex items-baseline gap-4 mt-2">
                    <span className="text-7xl font-black text-white">{stats.totalRentals}</span>
                    <span className="text-blue-200 font-medium">Equipamentos em campo</span>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <Link to="/rentals" className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:shadow-xl transition-all">
                    Monitorar Locações <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>

            {/* COLUNA LATERAL */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Agendamentos - Estilo Clean */}
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 hover:border-gray-700 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Próximas Saídas</span>
                    <h4 className="text-4xl font-black text-white mt-2 group-hover:text-blue-400 transition-colors">{stats.totalScheduled}</h4>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Entregas agendadas</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-2xl text-gray-400">
                    <CalendarClock size={28} />
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 hover:border-amber-500/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pendências Financeiras</span>
                    <h4 className="text-4xl font-black text-amber-500 mt-2">{stats.openInvoices}</h4>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Faturas em aberto</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                    <Receipt size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. NAVEGAÇÃO EM GRID "ICON-CENTRIC" */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-2 font-mono">NAVEGAÇÃO RÁPIDA</h4>
              <div className="h-px flex-1 bg-gray-900 mx-6"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {menuItems.map((item) => (
                  <Link key={item.to} to={item.to} className="group flex flex-col items-center bg-gray-900/20 border border-gray-900 p-6 rounded-4xl hover:bg-gray-900 hover:border-gray-800 transition-all text-center">
                    <div className={`${item.color} bg-current/5 w-16 h-16 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {React.cloneElement(item.icon, { size: 28 })}
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight">{item.title}</span>
                    <span className="text-gray-600 text-[10px] font-medium mt-1 uppercase tracking-tighter">{item.sub.split(' ')[0]}</span>
                  </Link>
              ))}
            </div>
          </section>

        {/* FOOTER INFO */}
        <footer className="mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600">
          <p className="text-xs font-medium tracking-tight">© 2026 Dumply Software - Gestão de Equipamentos e Locações</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-tighter">
            <span className="hover:text-gray-400 cursor-pointer">Suporte (DESENVOLVIMENTO)</span>
            <span className="hover:text-gray-400 cursor-pointer">Documentação (DESENVOLVIMENTO)</span>
          </div>
        </footer>
      </div>
      </div>
  );
};

export default Dashboard;
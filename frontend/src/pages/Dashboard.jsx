import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';
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
  PlusCircle, CalendarClock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalRentals: 0, openInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardStats();
        setStats({
          totalRentals: res.data.totalActiveRentals || 0,
          openInvoices: res.data.openInvoicesCount || 0
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
      <div className="p-4 md:p-10 max-w-400 mx-auto min-h-screen bg-gray-950">

        {/* HEADER SECTON */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Sistema Online</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <LayoutDashboard className="text-blue-500" size={32} />
              Dashboard
            </h2>
            <p className="text-gray-500 mt-2 font-medium">Bem-vindo à central administrativa <span className="text-blue-500/80">Dumply</span>.</p>
          </div>

          <Link to="/rentals/new" className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
            <PlusCircle size={20} />
            Nova Locação
          </Link>
        </header>

        {/* METRICS GRID (BENTO BOX) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

          {/* TOTAL ALUGUÉL */}
          <div className="lg:col-span-2 relative overflow-hidden bg-gray-900 border border-gray-800 p-8 rounded-[2rem] group transition-all hover:border-blue-500/30">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={140} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Operação Ativa</span>
                <h3 className="text-5xl font-black text-white mt-4">{stats.totalRentals}</h3>
                <p className="text-gray-400 mt-2 font-medium">Equipamentos alocados em clientes no momento.</p>
              </div>
              <Link to="/rentals" className="mt-8 flex items-center gap-2 text-blue-400 font-bold text-sm hover:gap-3 transition-all">
                Ver detalhes das locações <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* TOTAL FATURAS */}
          <div className="relative overflow-hidden bg-gray-900 border border-gray-800 p-8 rounded-4xl group transition-all hover:border-amber-500/30">
            <div className="relative z-10">
              <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <FileText size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Financeiro</span>
              <h3 className="text-5xl font-black text-white mt-4">{stats.openInvoices}</h3>
              <p className="text-gray-400 mt-2 font-medium italic">Faturas aguardando pagamento.</p>

              <Link to="/invoices" className="mt-8 inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors">
                Gerenciar Cobranças
              </Link>
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-6 ml-2">Navegação Rápida</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {menuItems.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:bg-gray-800 hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className={`${item.color} bg-current/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(item.icon, { className: item.color })}
                  </div>
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{item.sub}</p>

                  <div className="absolute top-4 right-4 text-gray-700 group-hover:text-blue-500 transition-colors">
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
            ))}
          </div>
        </div>

        {/* FOOTER INFO */}
        <footer className="mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600">
          <p className="text-xs font-medium tracking-tight">© 2026 Dumply Software - Gestão de Resíduos & Locações</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-tighter">
            <span className="hover:text-gray-400 cursor-pointer">Suporte (DESENVOLVIMENTO)</span>
            <span className="hover:text-gray-400 cursor-pointer">Documentação (DESENVOLVIMENTO)</span>
          </div>
        </footer>
      </div>
  );
};

export default Dashboard;
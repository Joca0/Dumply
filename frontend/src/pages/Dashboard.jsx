import React, { useEffect, useState } from 'react';
import { getRentals, getEquipments, getInvoices } from '../api';
import { Package, DollarSign, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalRentals: 0, totalRevenue: 0, openInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalsRes, equipmentsRes, invoicesRes] = await Promise.all([
          getRentals(), 
          getEquipments(),
          getInvoices()
        ]);
        const activeRentals = Array.isArray(rentalsRes.data) ? rentalsRes.data.filter(r => r.status === 'ACTIVE') : [];
        const revenue = activeRentals.reduce((acc, curr) => acc + (curr.charge || 0), 0);
        
        const pendingInvoices = Array.isArray(invoicesRes.data) ? invoicesRes.data.filter(i => i.status === 'PENDING') : [];

        setStats({
          totalRentals: activeRentals.length,
          totalRevenue: revenue,
          openInvoices: pendingInvoices.length
        });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const menus = [
    { title: 'Novo Aluguel', description: 'Registre uma nova locação', to: '/rentals/new', color: 'bg-blue-600' },
    { title: 'Mapa', description: 'Veja a localização dos equipamentos', to: '/map', color: 'bg-indigo-600' },
    { title: 'Equipamentos', description: 'Consulte e gerencie seus equipamentos', to: '/equipments', color: 'bg-slate-700' },
    { title: 'Clientes', description: 'Consulte sua base de clientes', to: '/customers', color: 'bg-slate-700' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">Painel de Controle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link to="/rentals" className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center hover:border-blue-500/50 transition-colors group">
          <div className="bg-blue-600/20 p-4 rounded-lg mr-4 text-blue-500 group-hover:bg-blue-600/30 transition-colors">
            <Package size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Equipamentos Alocados</p>
            <p className="text-3xl font-bold">{stats.totalRentals}</p>
          </div>
        </Link>

        <Link to="/invoices" className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center hover:border-yellow-500/50 transition-colors group">
          <div className="bg-yellow-600/20 p-4 rounded-lg mr-4 text-yellow-500 group-hover:bg-yellow-600/30 transition-colors">
            <FileText size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Faturas Abertas</p>
            <p className="text-3xl font-bold">{stats.openInvoices}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menus.map((menu) => (
          <Link key={menu.to} to={menu.to} className={`${menu.color} p-6 rounded-xl hover:opacity-90 transition-opacity flex flex-col justify-between group`}>
            <div>
              <h3 className="text-xl font-bold mb-2">{menu.title}</h3>
              <p className="text-sm text-gray-200/80">{menu.description}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
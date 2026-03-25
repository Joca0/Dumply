import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  Home,
  Map as MapIcon,
  Truck,
  CalendarClock,
  Users,
  Box,
  Receipt,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const rolePermissions = {
    DRIVER: ['/map', '/assigned'],
    ADMIN: ['/map', '/dashboard', '/rentals', '/customers', '/equipments', '/invoices', '/scheduled'],
    OWNER: ['/map', '/dashboard', '/rentals', '/customers', '/equipments', '/invoices', '/scheduled'],
  };

  const isAllowed = (to) => {
    if (!user) return false;
    if (['ADMIN', 'OWNER', 'MANAGER'].includes(user.role)) return true;
    return rolePermissions[user.role]?.includes(to);
  };



  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Monitora resize para comportamento responsivo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: Respeita a escolha do usuário, mas garante visibilidade inicial se grande
        // (Lógica opcional, aqui mantemos o estado atual)
      } else {
        setSidebarOpen(false); // Fecha sidebar em telas menores que lg
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuGroups = [
    {
      label: 'Visão Geral',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/map', icon: MapIcon, label: 'Mapa em Tempo Real' },
        { to: '/assigned', icon: Truck, label: 'Atribuições' },
      ]
    },
    {
      label: 'Operação',
      items: [
        { to: '/rentals', icon: Truck, label: 'Locações Ativas' },
        { to: '/scheduled', icon: CalendarClock, label: 'Agendamentos' },
        { to: '/customers', icon: Users, label: 'Base de Clientes' },
        { to: '/equipments', icon: Box, label: 'Inventário' },
      ]
    },
    {
      label: 'Equipe',
      items: [
        { to: '/drivers', icon: Truck, label: 'Motoristas' },
        { to: '/managers', icon: Users, label: 'Gerentes' },
      ]
    },
    {
      label: 'Financeiro',
      items: [
        { to: '/invoices', icon: Receipt, label: 'Faturas' },
      ]
    },
    {
      label: 'Criação',
      items: [
        { to: '/customers/new', icon: Users, label: 'Novo Cliente' },
        { to: '/drivers/new', icon: Truck, label: 'Novo Motorista' },
        { to: '/equipments/new', icon: Box, label: 'Novo Equipamento' },
      ]
    }
  ];

  const quickActions = [
    { to: '/rentals/new', label: 'Novo Aluguel' },
    { to: '/customers/new', label: 'Novo Cliente' },
    { to: '/drivers/new', label: 'Novo Motorista' },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
      <div className="flex h-screen bg-gray-950 overflow-hidden text-gray-100 font-sans">

        {/* --- SIDEBAR (DESKTOP) --- */}
        <aside
            className={`
          hidden lg:flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out relative z-20
          ${isSidebarOpen ? 'w-72' : 'w-20'}
        `}
        >
          {/* TOPO AREA DA LOGO */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
            {isSidebarOpen ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl tracking-tight text-white">Dumply<span className="text-blue-500">.</span></span>
                  </div>
                  <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-500 hover:text-white transition-colors"
                  >
                    <Menu size={20} />
                  </button>
                </>
            ) : (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                    title="Expandir Menu"
                >
                  <Menu size={20} />
                </button>
            )}
          </div>

          {/* SCROLL NAV */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">

            {/* BOTÕES DE NAVEGAÇÃO */}
            {isSidebarOpen && user?.role !== 'DRIVER' && (
                <div className="px-3 mb-6">
                  <NavLink to="/rentals/new" className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                    <Plus size={20} />
                    <span>Criar Locação</span>
                  </NavLink>
                </div>
            )}

            {/* BOTÕES DE AÇÃO COLAPSADO */}
            {!isSidebarOpen && (
                <div className="flex justify-center mb-6">
                  <NavLink to="/rentals/new" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 transition-all" title="Nova Locação">
                    <Plus size={20} />
                  </NavLink>
                </div>
            )}

            {/* GRUPOS PARA NAVEGAÇÃO */}
            {menuGroups.map((group, idx) => {
              const filteredItems = group.items.filter(item => isAllowed(item.to));
              if (filteredItems.length === 0) return null;

              return (
                <div key={idx}>
                  {isSidebarOpen && (
                      <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        {group.label}
                      </h3>
                  )}
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            title={!isSidebarOpen ? item.label : ''}
                            className={({ isActive }) =>
                                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                }`
                            }
                        >
                          {({ isActive }) => (
                              <>
                                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-full" />}
                                <item.icon size={20} className={`min-w-[20px] ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}


                                {!isSidebarOpen && (
                                    <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-gray-700">
                                      {item.label}
                                    </div>
                                )}
                              </>
                          )}
                        </NavLink>
                    ))}
                  </div>
                  {idx < menuGroups.length - 1 && <div className="my-4 border-t border-gray-800/50 mx-3" />}
                </div>
              );
            })}
          </div>

          {/* USUÁRIO LOGADO */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>

              {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
              )}

              {isSidebarOpen && (
                  <button onClick={logout} className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors" title="Sair">
                    <LogOut size={18} />
                  </button>
              )}
            </div>
          </div>
        </aside>


        {/* --- MOBILE HEADER & DRAWER --- */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-40 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">D</span>
            </div>
            <span className="font-bold text-lg text-white">Dumply.</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-300 bg-gray-800 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

              <div className="absolute right-0 top-0 bottom-0 w-72 bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                  <span className="font-bold text-lg text-white">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* AÇÕES MOBILE */}
                  {user?.role !== 'DRIVER' && (
                      <div className="grid grid-cols-2 gap-3">
                        {quickActions.map(action => (
                            <NavLink
                                key={action.to}
                                to={action.to}
                                className="flex flex-col items-center justify-center bg-gray-800 p-3 rounded-xl border border-gray-700 hover:border-blue-500 text-center gap-2"
                            >
                              <Plus size={20} className="text-blue-500"/>
                              <span className="text-xs font-bold text-gray-300">{action.label}</span>
                            </NavLink>
                        ))}
                      </div>
                  )}

                  {menuGroups.map((group, idx) => {
                    const filteredItems = group.items.filter(item => isAllowed(item.to));
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={idx}>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{group.label}</h3>
                          <div className="space-y-1">
                            {filteredItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                                        }`
                                    }
                                >
                                  <item.icon size={20} />
                                  <span className="font-medium">{item.label}</span>
                                </NavLink>
                            ))}
                          </div>
                        </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                  <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span className="font-bold">Sair da Conta</span>
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-auto relative lg:pt-0 pt-16 custom-scrollbar">
          <Outlet />
        </main>
      </div>
  );
};

export default Layout;
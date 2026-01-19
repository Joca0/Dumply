import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, PlusCircle, FolderSearch, MapPin, Menu, X, FileText, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Layout = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { user, loading , logout } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/map', icon: MapPin, label: 'Mapa' },
    { to: '/rentals', icon: FolderSearch, label: 'Aluguéis' },
    { to: '/customers', icon: FolderSearch, label: 'Clientes' },
    { to: '/equipments', icon: FolderSearch, label: 'Equipamentos' },
    { to: '/invoices', icon: FileText, label: 'Faturas e Relatórios' },
    { to: '/rentals/new', icon: PlusCircle, label: 'Novo Aluguel' },
    { to: '/customers/new', icon: PlusCircle, label: 'Novo Cliente' },
    { to: '/equipments/new', icon: PlusCircle, label: 'Novo Equipamento' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Header da Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col no-print`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {isOpen && <h1 className="text-xl font-bold text-blue-500 tracking-tight">Dumply.</h1>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-700 rounded-lg">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Links da Sidebar */}
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `flex items-center p-3 mb-3 rounded-lg transition-colors ${
                            isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`
                    }
                >
                  <item.icon size={20} className={isOpen ? 'mr-3' : 'mx-auto'} />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
            ))}
          </div>
        </nav>
        {/* Perfil */}
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center ${isOpen ? 'p-3 bg-gray-900/50 border border-gray-700 rounded-xl' : 'justify-center'}`}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-inner">
              <UserCircle size={24} />
            </div>

            {isOpen && (
                <div className="ml-3 flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate text-left">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate text-left">{user?.role}</p>
                </div>
            )}

            {isOpen && (
                <button onClick={logout}
                        title="Sair"
                        className="ml-2 p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                  <LogOut size={16} />
                </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
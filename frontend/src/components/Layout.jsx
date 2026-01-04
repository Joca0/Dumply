import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, PlusCircle, Search, MapPin, Menu, X, FileText } from 'lucide-react';

const Layout = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/map', icon: MapPin, label: 'Mapa' },
    { to: '/rentals', icon: Search, label: 'Aluguéis' },
    { to: '/customers', icon: Search, label: 'Clientes' },
    { to: '/equipments', icon: Search, label: 'Equipamentos' },
    { to: '/invoices', icon: FileText, label: 'Faturas' },
    { to: '/customers/new', icon: PlusCircle, label: 'Novo Cliente' },
    { to: '/equipments/new', icon: PlusCircle, label: 'Novo Equipamento' },
    { to: '/rentals/new', icon: PlusCircle, label: 'Novo Aluguel' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col no-print`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {isOpen && <h1 className="text-xl font-bold text-blue-500">Dumply</h1>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-700 rounded-lg">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon size={20} className={isOpen ? 'mr-3' : 'mx-auto'} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
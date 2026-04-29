import React, { useState, useEffect } from 'react';
import { getManagers, deleteUser } from '../api';
import {
  Search,
  User,
  Users,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Fingerprint
} from 'lucide-react';
import { useAlert } from "@/components/ui/MainAlert.jsx";
import { Link } from 'react-router-dom';
import { toast } from "sonner";

const ManagerList = () => {
  const { showConfirm } = useAlert();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await getManagers();
      setManagers(res.data);
    } catch (err) { 
      console.error(err); 
      toast.error('Erro ao carregar gerentes.');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchManagers(); }, []);

  const handleDelete = async (id) => {
    showConfirm(
        'Tem certeza?',
        'Você deseja excluir este gerente? Esta ação não pode ser desfeita.',
        async () => {
          try {
            await deleteUser(id);
            toast.success('Gerente excluído com sucesso!');
            fetchManagers();
          } catch (err) { toast.error('Erro ao excluir gerente.'); }
        }
    )
  };

  const filteredManagers = managers.filter(manager => 
    manager.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && managers.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="text-blue-500" />
              Gerentes do Sistema
            </h2>
            <p className="text-gray-400 text-sm">Gerencie os usuários com permissões administrativas.</p>
          </div>
          <Link to="/managers/new" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-lg shadow-blue-900/20 w-full md:w-auto">
            Novo Gerente
          </Link>
        </div>

        {/* BUSCA */}
        <div className="mb-6">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Nome, documento ou e-mail..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* VERSÃO MOBILE (CARDS) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredManagers.map((manager) => (
              <div key={manager.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{manager.fullName}</h3>
                      <p className="text-gray-400 text-xs">{manager.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/managers/edit/${manager.id}`} className="p-2 text-blue-400 bg-blue-400/10 rounded-lg">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(manager.id)} className="p-2 text-red-400 bg-red-400/10 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2"><Fingerprint size={14}/> Doc</span>
                    <span className="text-gray-300 font-mono">{manager.document}</span>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* VERSÃO DESKTOP (TABELA) */}
        <div className="hidden md:block bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden shadow-xl">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
            <tr className="bg-gray-800/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Gerente</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Documento</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">E-mail</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 text-right">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
            {filteredManagers.map((manager) => (
                <tr key={manager.id} className="group hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg"><User size={18} /></div>
                      <span className="font-semibold text-gray-100">{manager.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">{manager.document}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{manager.email}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/managers/edit/${manager.id}`} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"><Edit2 size={18} /></Link>
                      <button onClick={() => handleDelete(manager.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
          {filteredManagers.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-600 mb-4">
                  <Users size={32} />
                </div>
                <p className="text-gray-400 font-medium text-lg">Nenhum gerente encontrado</p>
              </div>
          )}
        </div>
      </div>
  );
};

export default ManagerList;

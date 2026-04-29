import React, { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../api';
import {
  Search,
  User,
  Users,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Fingerprint, 
  Box,
  MoreHorizontal
} from 'lucide-react';
import { useAlert } from "@/components/ui/MainAlert.jsx";
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';

const CustomerList = () => {
  const { showConfirm } = useAlert();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchCustomers(0); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchCustomers = async (currentPage) => {
    setLoading(true);
    try {
      const res = await getCustomers(currentPage, 10, searchTerm);
      const data = res.data.content;

      setCustomers(data);
      setTotalPages(res.data.totalPages);
      setPage(currentPage);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(page); }, [page]);

  const handleDelete = async (id) => {
    showConfirm(
        'Tem certeza?',
        'Você deseja excluir este cliente?',
        async () => {
          try {
            await deleteCustomer(id);
            toast.success('Cliente excluído com sucesso!');
            fetchCustomers(page);
          } catch (err) { toast.error('Erro ao excluir cliente.'); }
        }
    )
  };

  if (loading && customers.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-8 max-w-400 mx-auto min-h-screen">
        {/* CABEÇALHO (Otimizado para mobile) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="text-blue-500 hidden md:block" />
              Base de Clientes
            </h2>
            <p className="text-gray-400 text-sm">Gerenciamento de base cadastral.</p>
          </div>
          <div className="grid grid-cols-2 md:flex w-full md:w-auto gap-3 no-print">
            <Link to="/customers/new" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-lg shadow-blue-900/20">
              Novo Cliente
            </Link>
          </div>
        </div>

        {/* BUSCA */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 no-print">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Nome ou documento..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* VERSÃO MOBILE (CARDS) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {customers.map((customer) => (
              <div key={customer.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{customer.fullName}</h3>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                        <Building2 size={12} />
                        {customer.companyName || 'Pessoa Física'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/customers/edit/${customer.id}`} className="p-2 text-blue-400 bg-blue-400/10 rounded-lg">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-red-400 bg-red-400/10 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2"><Fingerprint size={14}/> Doc</span>
                    <span className="text-gray-300 font-mono">{customer.document}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2"><Phone size={14}/> Celular</span>
                    <span className="text-gray-300">{customer.phone || customer.contact}</span>
                  </div>
                  {customer.email && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><Mail size={14}/> E-mail</span>
                        <span className="text-gray-300 truncate max-w-[180px]">{customer.email}</span>
                      </div>
                  )}
                </div>
              </div>
          ))}
        </div>

        {/* VERSÃO DESKTOP (TABELA) - Oculta em telas menores que md */}
        <div className="hidden md:block bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden shadow-xl">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
            <tr className="bg-gray-800/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Cliente</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Empresa</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Contato</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Documento</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 text-right no-print">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
            {customers.map((customer) => (
                <tr key={customer.id} className="group transition-colors hover:bg-white/2">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg"><User size={18} /></div>
                      <span className="font-semibold text-gray-100">{customer.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{customer.companyName || '---'}</td>
                  <td className="p-4">
                    <div className="text-sm text-gray-300">{customer.phone || customer.contact}</div>
                    <div className="text-xs text-gray-400 italic">{customer.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">{customer.document}</span>
                  </td>
                  <td className="p-4 text-right no-print">
                    <div className="flex justify-end gap-1">
                      <Link to={`/customers/edit/${customer.id}`} title="Editar" className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"><Edit2 size={18} /></Link>
                      <button onClick={() => handleDelete(customer.id)} title="Excluir" className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
          {customers.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-600 mb-4">
                  <Users size={32} />
                </div>
                <p className="text-gray-400 font-medium text-lg">Nenhum cliente cadastrado</p>
              </div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-2 py-4 gap-4 no-print">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Página <span className="text-gray-200">{page + 1}</span> de <span className="text-gray-200">{totalPages || 1}</span>
        </span>
          <div className="flex w-full sm:w-auto gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-20 border border-gray-700">
              <ChevronLeft size={16} /> Anterior
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-20 border border-gray-700">
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* LOADING OVERLAY (Ao trocar de página) */}
        {loading && customers.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800/90 backdrop-blur-md border border-gray-700 text-gray-200 px-5 py-2.5 rounded-full shadow-2xl">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-xs font-bold tracking-wide">ATUALIZANDO...</span>
            </div>
        )}
      </div>
  );
};

export default CustomerList;
import React, { useState, useEffect } from 'react';
import { getEquipments, deleteEquipment } from '../api';
import {Search, Box, Edit2, Trash2, ChevronLeft, ChevronRight, Tag, Hash, AlertCircle, Receipt} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { useAlert } from "@/components/ui/MainAlert.jsx";

const EquipmentList = () => {
  const { showConfirm } = useAlert();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEquipments(0);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchEquipments = async (currentPage) => {
    setLoading(true);
    try {
      const res = await getEquipments(currentPage, 10, searchTerm);
      setEquipments(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments(page);
  }, [page]);

  const handleDelete = async (id) => {
    showConfirm(
        'Tem certeza?',
        'Você deseja excluir este equipamento?',
        async () => {
          try {
            await deleteEquipment(id);
            toast.success('Equipamento excluído com sucesso!');
            fetchEquipments(page);
          } catch (err) {
            toast.error('Erro ao excluir. O equipamento pode estar vinculado a um aluguel.');
          }
        }
    )
  };

  //Estilização dos status
  const getStatusBadge = (status) => {
    const styles = {
      AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      RENTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const labels = { AVAILABLE: 'Disponível', RENTED: 'Alugado', MAINTENANCE: 'Manutenção' };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.MAINTENANCE}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'AVAILABLE' ? 'bg-emerald-400 animate-pulse' : 'bg-current opacity-60'}`} />
          {labels[status] || status}
      </span>
    );
  };

  if (loading && equipments.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-8 max-w-400 mx-auto min-h-screen">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Box className="text-blue-500 hidden md:block" />
              Inventário
            </h2>
            <p className="text-gray-400 text-sm mt-1">Controle de inventário e disponibilidade de equipamentos.</p>
          </div>
          <Link to="/equipments/new" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center shadow-lg shadow-blue-900/20">
            Novo Equipamento
          </Link>
        </div>

        {/* BUSCA */}
        <div className="mb-8 no-print">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
                type="text"
                placeholder="Nome ou número de série..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MOBILE: GRID DE CARDS BEM MELHOR QUE O ANTIGO :) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {equipments.map((eq) => (
              <div key={eq.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-800 text-gray-400 p-2.5 rounded-xl border border-gray-700">
                      <Box size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{eq.name}</h3>
                      <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{eq.category || 'Geral'}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/equipments/edit/${eq.id}`} className="p-2 text-blue-400 bg-blue-400/10 rounded-lg">
                      <Edit2 size={16} />
                    </Link>
                    <button
                        onClick={() => handleDelete(eq.id)}
                        disabled={eq.status === 'RENTED'}
                        className="p-2 text-red-400 bg-red-400/10 rounded-lg disabled:opacity-20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">Série</span>
                    <span className="text-xs font-mono text-gray-300">{eq.serialNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">Status</span>
                    {getStatusBadge(eq.status)}
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* TABELA */}
        <div className="hidden md:block bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden shadow-xl">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
            <tr className="bg-gray-800/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Equipamento</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Número de Série</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Categoria</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 text-right no-print">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
            {equipments.map((eq) => (
                <tr key={eq.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-800 text-gray-500 p-2 rounded-lg group-hover:text-blue-400 transition-colors">
                        <Box size={18} />
                      </div>
                      <span className="font-semibold text-gray-100">{eq.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                  <span className="font-mono text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
                    {eq.serialNumber}
                  </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{eq.category || '-'}</td>
                  <td className="p-4">{getStatusBadge(eq.status)}</td>
                  <td className="p-4 text-right no-print">
                    <div className="flex justify-end gap-1">
                      <Link to={`/equipments/edit/${eq.id}`} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </Link>
                      <button
                          onClick={() => handleDelete(eq.id)}
                          disabled={eq.status === 'RENTED'}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors disabled:opacity-10"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>

          {equipments.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-600 mb-4">
                  <Box size={32} />
                </div>
                <p className="text-gray-400 font-medium text-lg">Nenhum equipamento cadastrado</p>
              </div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-2 py-4 gap-4 no-print">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Página <span className="text-gray-200">{page + 1}</span> de <span className="text-gray-200">{totalPages || 1}</span>
        </span>
          <div className="flex w-full sm:w-auto gap-2">
            <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-20 border border-gray-700 active:scale-95 transition-all"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-20 border border-gray-700 active:scale-95 transition-all"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* LOADING OVERLAY (Ao trocar de página) */}
        {loading && equipments.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800/90 backdrop-blur-md border border-gray-700 text-gray-200 px-5 py-2.5 rounded-full shadow-2xl">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-xs font-bold tracking-wide">ATUALIZANDO...</span>
            </div>
        )}
      </div>
  );
};

export default EquipmentList;
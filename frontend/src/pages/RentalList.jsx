import React, { useState, useEffect, useCallback } from 'react';
import { getRentals, returnRental } from '../api';
import {
  Search,
  CheckCircle,
  Calendar,
  Edit2,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  Truck,
  Clock,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Link } from "react-router-dom";
import { useAlert } from "@/components/ui/MainAlert.jsx";
import { usePDFDownload } from "@/hooks/usePDFDownload.jsx";
import { toast } from "sonner";

const RentalList = () => {
  const { showConfirm } = useAlert();
  const { handleDownloadPDF: downloadPDF} = usePDFDownload();
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState(null);

  // Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRentals();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedMonth, selectedStatus, page]);

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm,
        month: selectedMonth,
        status: selectedStatus === 'all' ? '' : selectedStatus,
      };
      const res = await getRentals(page, 10, filters);
      setRentals(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar aluguéis:", err);
      setLoading(false);
    }
  }, [page, searchTerm, selectedMonth, selectedStatus]);

  const handleReturn = async (id) => {
    showConfirm(
        'Tem certeza?',
        'Você deseja finalizar o aluguel?',
        async () => {
          setProcessingId(id);
          try {
            await returnRental(id);
            toast.success("Aluguel finalizado com sucesso!");
            fetchRentals();
          } catch (err) {
            toast.error("Erro ao finalizar aluguel.");
          } finally {
            setProcessingId(null);
          }
        }
    )
  };

  const handleDownloadPDF = () => {
    downloadPDF('printable', 'lista-de-alugueis')
  }

  const getStatusBadge = (status) => {
    const isMobile = window.innerWidth < 768;

    if (status === 'ACTIVE') {
      return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
            {isMobile ? 'ATIVO' : 'EM ANDAMENTO'}
        </span>
      );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
        FINALIZADO
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (loading && rentals.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-8 max-w-400 mx-auto min-h-screen">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="text-blue-500 hidden md:block" />
              Gestão de Locações
            </h2>
            <p className="text-gray-400 text-sm mt-1">Monitore contratos ativos, devoluções e histórico.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3 no-print">
            <button
                onClick={() => handleDownloadPDF()}
                className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-gray-700 transition-all"
            >
              <Download size={18} />
              <span className="hidden md:inline">Relatório PDF</span>
            </button>
            <Link
                to="/rentals/new"
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <span className="text-lg leading-none mb-0.5">+</span> Novo Aluguel
            </Link>
          </div>
        </div>

        {/* FILTROS (no-print) */}
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl mb-6 backdrop-blur-sm no-print">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

            {/* Busca */}
            <div className="md:col-span-5 relative">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                <Search size={10} /> Buscar
              </label>
              <div className="relative">
                <input
                    type="text"
                    placeholder="Cliente, documento ou endereço..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-gray-600" size={16} />
              </div>
            </div>

            {/* Mês */}
            <div className="md:col-span-3">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                <Calendar size={10} /> Mês de Inicio
              </label>
              <input
                  type="month"
                  placeholder="AAAA-MM"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="md:col-span-4">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                <Filter size={10} /> Situação
              </label>
              <div className="relative">
                <select
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="ACTIVE">Apenas Ativos</option>
                  <option value="FINISHED">Apenas Finalizados</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                  <Filter size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MOBILE: VIEW EM CARDS --- */}
        <div className="md:hidden space-y-4 mb-8">
          {rentals.map((rental) => (
              <div key={rental.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                {/* Faixa lateral colorida baseada no status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${rental.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-700'}`} />

                <div className="flex justify-between items-start mb-3 pl-2">
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{rental.customer?.fullName}</h3>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">{rental.customer?.document || 'Sem documento'}</p>
                  </div>
                  {getStatusBadge(rental.status)}
                </div>

                <div className="pl-2 space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Truck size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm font-medium">{rental.equipment?.name || 'Item Removido'}</p>
                      <p className="text-[10px] text-gray-500 uppercase">N/S: {rental.equipment?.serialNumber || '--'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{rental.fullAddress}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-800/50">
                    <div className="text-xs">
                      <span className="text-gray-600 font-bold uppercase block text-[9px]">Início</span>
                      <span className="text-gray-300 font-mono">{formatDate(rental.startDate)}</span>
                    </div>
                    {rental.endDate && (
                        <div className="text-xs">
                          <span className="text-gray-600 font-bold uppercase block text-[9px]">Fim</span>
                          <span className="text-gray-300 font-mono">{formatDate(rental.endDate)}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Ações Mobile */}
                <div className="grid grid-cols-4 gap-2 pl-2">
                  {rental.status === 'ACTIVE' && (
                      <button
                          onClick={() => handleReturn(rental.id)}
                          disabled={processingId === rental.id}
                          className="col-span-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {processingId === rental.id ? <div className="animate-spin h-3 w-3 border-2 border-emerald-400 border-t-transparent rounded-full"/> : <CheckCircle size={14} />} {processingId === rental.id ? 'Enviando...' : 'Finalizar'}
                      </button>
                  )}
                  <Link
                      to={`/rentals/edit/${rental.id}`}
                      className={`${rental.status === 'ACTIVE' ? 'col-span-1' : 'col-span-2'} bg-gray-800 text-gray-300 border border-gray-700 rounded-lg py-2 flex items-center justify-center active:scale-95`}
                  >
                    <Edit2 size={16} />
                  </Link>
                  {rental.status === 'ACTIVE' && (
                      <Link
                          to={`/map?id=${rental.id}&lat=${rental.latitude}&lng=${rental.longitude}`}
                          className="col-span-1 bg-gray-800 text-amber-400 border border-gray-700 rounded-lg py-2 flex items-center justify-center active:scale-95"
                      >
                        <MapPin size={16} />
                      </Link>
                  )}
                </div>
              </div>
          ))}
        </div>

        {/* --- DESKTOP --- */}
        <div id="printable" className="hidden md:block bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden shadow-xl mb-6">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
            <tr className="bg-gray-800/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Cliente</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Equipamento</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 w-1/4">Endereço</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Datas</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 text-right no-print">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
            {rentals.map((rental) => (
                <tr key={rental.id} className="group hover:bg-white/2 transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-semibold text-gray-200">{rental.customer?.fullName}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{rental.customer?.document || '---'}</div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="text-sm text-gray-300 font-medium">{rental.equipment?.name || '---'}</div>
                    <div className="text-[10px] text-gray-500 uppercase mt-0.5">Número de Série: {rental.equipment?.serialNumber}</div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex gap-2">
                      <MapPin size={14} className="text-gray-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-400 leading-relaxed">{rental.fullAddress}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={12} className="text-blue-500" />
                        <span>{formatDate(rental.startDate)}</span>
                      </div>
                      {rental.endDate && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle size={12} className="text-gray-600" />
                            <span>{formatDate(rental.endDate)}</span>
                          </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-top pt-5">
                    {getStatusBadge(rental.status)}
                  </td>
                  <td className="p-4 align-top text-right no-print">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {rental.status === 'ACTIVE' && (
                          <button
                              onClick={() => handleReturn(rental.id)}
                              className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                              title="Finalizar"
                          >
                            <CheckCircle size={16} />
                          </button>
                      )}
                      <Link
                          to={`/rentals/edit/${rental.id}`}
                          className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                          title="Editar"
                      >
                        <Edit2 size={16} />
                      </Link>
                      {rental.status === 'ACTIVE' && (
                          <Link
                              to={`/map?id=${rental.id}&lat=${rental.latitude}&lng=${rental.longitude}`}
                              className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors border border-transparent hover:border-amber-500/20"
                              title="Localização"
                          >
                            <MapPin size={16} />
                          </Link>
                      )}
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && rentals.length === 0 && (
            <div className="py-20 text-center bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-600 mb-4">
                <Search size={32} />
              </div>
              <p className="text-gray-300 font-bold text-lg">Nenhum aluguel encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Tente alterar os filtros ou cadastrar uma nova locação.</p>
            </div>
        )}

        {/* PAGINAÇÃO */}
        {totalPages > 0 && (
            <div className="flex justify-between items-center py-4 no-print border-t border-gray-800 mt-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">
            Página <span className="text-white">{page + 1}</span> de {totalPages}
          </span>
              <div className="flex gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-gray-800 border border-gray-700 transition-all active:scale-95"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-gray-800 border border-gray-700 transition-all active:scale-95"
                >
                  Próxima <ChevronRight size={14} />
                </button>
              </div>
            </div>
        )}

        {/* LOADING OVERLAY (Ao trocar de página) */}
        {loading && rentals.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800/90 backdrop-blur-md border border-gray-700 text-gray-200 px-5 py-2.5 rounded-full shadow-2xl">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-xs font-bold tracking-wide">ATUALIZANDO...</span>
            </div>
        )}
      </div>
  );
};

export default RentalList;
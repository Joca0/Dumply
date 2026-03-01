import React, { useState, useEffect, useCallback } from 'react';
import {getInvoices, getInvoiceStats} from '../api';
import {
  Search,
  Plus,
  Download,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  Clock,
  CreditCard,
  Filter
} from 'lucide-react';
import { usePDFDownload } from "@/hooks/usePDFDownload.jsx";
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const { handleDownloadPDF: downloadPDF } = usePDFDownload();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({ totalFaturado: 0, totalPendente: 0, totalPago: 0, quantidadePendentes: 0 })


  const navigate = useNavigate();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm,
        month: selectedMonth,
        status: selectedStatus === 'all' ? '' : selectedStatus,
      };
      const res = await getInvoices(page, 10, filters);
      setInvoices(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      const statsRes = await getInvoiceStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error("Erro ao buscar faturas:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedMonth, selectedStatus]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedMonth, selectedStatus]);

  const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const getStatusBadge = (status) => {
    const configs = {
      PAID: { label: 'PAGO', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
      PENDING: { label: 'PENDENTE', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-500 animate-pulse' },
      CANCELLED: { label: 'CANCELADO', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-500' }
    };
    const config = configs[status] || configs.PENDING;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
          {config.label}
      </span>
    );
  };

  if (loading && invoices.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-8 max-w-400 mx-auto min-h-screen">

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="text-blue-500 hidden md:block" />
              Faturas e Relatórios
            </h2>
            <p className="text-gray-400 text-sm mt-1">Gestão de recebíveis e conciliação financeira.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3 no-print">
            <button
                onClick={() => navigate('/invoices/new')}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Plus size={20} />
              <span>Nova Fatura</span>
            </button>
          </div>
        </div>

        {/* STATS DASHBOARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 no-print">
          <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={48} className="text-white" />
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Faturado</p>
            <h3 className="text-2xl font-black mt-1 text-white font-mono italic">
              {formatCurrency(stats.totalFaturado)}
            </h3>
          </div>

          <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 border-l-amber-500/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock size={48} className="text-amber-500" />
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Aguardando Pagamento</p>
            <h3 className="text-2xl font-black mt-1 text-amber-500 font-mono italic">
              {formatCurrency(stats.totalPendente)}
            </h3>
            <p className="text-[10px] text-gray-600 mt-2 font-medium">
              {(stats.quantidadePendentes)} faturas pendentes de conciliação
            </p>
          </div>

          <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 border-l-emerald-500/50 sm:col-span-2 lg:col-span-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={48} className="text-emerald-500" />
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Recebido</p>
            <h3 className="text-2xl font-black mt-1 text-emerald-400 font-mono italic">
              {formatCurrency(stats.totalPago)}
            </h3>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl mb-6 backdrop-blur-sm no-print">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                <Calendar size={10} /> Mês da Emissão
              </label>
              <input
                  type="month"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                <Filter size={10} /> Situação
              </label>
              <select
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="PAID">Pago / Conciliado</option>
                <option value="PENDING">Pendente</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div className="md:col-span-6">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                <Search size={10} /> Pesquisar Fatura
              </label>
              <div className="relative">
                <input
                    type="text"
                    placeholder="Nome do cliente ou número da fatura..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-gray-600" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* --- MOBILE: VIEW EM CARDS --- */}
        <div className="md:hidden space-y-4 mb-8">
          {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg active:scale-[0.98] transition-transform" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                  #{invoice.id}
                </span>
                  {getStatusBadge(invoice.status)}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{invoice.customer?.fullName}</h3>
                <div className="flex justify-between items-end">
                  <div className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xl font-black text-white font-mono italic">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* --- DESKTOP: VIEW TABELA --- */}
        <div className="hidden md:block bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden shadow-xl mb-6">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
            <tr className="bg-gray-800/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Cód.</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Cliente</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Data de Emissão</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 text-right">Valor Total</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 text-right no-print">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
            {invoices.map((invoice) => (
                <tr key={invoice.id} className="group hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-blue-400">#{invoice.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-200">{invoice.customer?.fullName}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(invoice.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-white font-mono italic">{formatCurrency(invoice.totalAmount)}</span>
                  </td>
                  <td className="p-4 text-right no-print">
                    <button
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className="p-2 hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 rounded-lg transition-all border border-transparent hover:border-blue-500/20"
                        title="Detalhes da Fatura"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && invoices.length === 0 && (
            <div className="py-20 text-center bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-600 mb-4">
                <Receipt size={32} />
              </div>
              <p className="text-gray-300 font-bold text-lg">Nenhuma fatura encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou crie um novo faturamento para este período.</p>
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
        {loading && invoices.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800/90 backdrop-blur-md border border-gray-700 text-gray-200 px-5 py-2.5 rounded-full shadow-2xl">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-xs font-bold tracking-wide">ATUALIZANDO...</span>
            </div>
        )}
      </div>
  );
};

export default InvoiceList;
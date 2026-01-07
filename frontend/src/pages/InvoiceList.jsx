import React, { useState, useEffect } from 'react';
import { getInvoices } from '../api';
import {Search, FileText, Eye, Plus, Printer, Calendar, User, Download} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const res = await getInvoices();
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // --- FILTRAGEM ---
  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(i => {
    const invoiceDate = i.createdAt.substring(0, 7);
    const matchesMonth = !selectedMonth || invoiceDate === selectedMonth;
    const matchesCustomer = selectedCustomer === 'all' || i.customer.id.toString() === selectedCustomer;
    const matchesSearch = i.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toString().includes(searchTerm);
    return matchesMonth && matchesCustomer && matchesSearch;
  }) : [];

  // --- CÁLCULO DOS RELATÓRIOS ---
  const stats = filteredInvoices.reduce((acc, curr) => {
    if (curr.status !== 'CANCELED') acc.totalVendido += curr.totalAmount;
    if (curr.status === 'PENDING') acc.totalReceber += curr.totalAmount;
    if (curr.status === 'PAID') acc.totalConciliado += curr.totalAmount;
    return acc;
  }, { totalVendido: 0, totalReceber: 0, totalConciliado: 0 });

  if (loading && invoices.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="p-8">
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold no-print">Faturas e Relatórios</h2>
          <div className="flex gap-2 no-print">
            <button
                onClick={() => window.print()}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <Download size={18} className="mr-2" />
               Gerar PDF
            </button>
            <button
                onClick={() => navigate('/invoices/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nova Fatura
            </button>
          </div>
        </div>

        {/* FILTROS (no-print) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium ml-1">MÊS</label>
            <input
                type="month"
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium ml-1">CLIENTE</label>
            <select
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="all">Todos os Clientes</option>
              {[...new Map(invoices.map(i => [i.customer.id, i.customer])).values()].map(c => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium ml-1">BUSCA</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RELATÓRIOS (CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm font-medium">Total vendido</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalVendido)}</h3>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm font-medium">A receber</p>
            <h3 className="text-2xl font-bold mt-1 text-yellow-400">{formatCurrency(stats.totalReceber)}</h3>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm font-medium">Pagamento conciliatório</p>
            <h3 className="text-2xl font-bold mt-1 text-green-400">{formatCurrency(stats.totalConciliado)}</h3>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Data</th>
              <th className="p-4">Valor Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right no-print">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
            {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-blue-400">#{invoice.id}</td>
                  <td className="p-4">
                    <p className="font-medium">{invoice.customer.fullName}</p>
                    <p className="text-xs text-gray-500">{invoice.customer.document}</p>
                  </td>
                  <td className="p-4 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-bold">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'PAID' ? 'bg-green-600/20 text-green-400' :
                            invoice.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-red-600/20 text-red-400'
                    }`}>
                    {invoice.status === 'PAID' ? 'Pago' :
                        invoice.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                  </span>
                  </td>
                  <td className="p-4 text-right no-print">
                    <button onClick={() => navigate(`/invoices/${invoice.id}`)} className="text-blue-400 hover:text-blue-300 p-2">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
              <div className="p-8 text-center text-gray-500">Nenhuma fatura encontrada.</div>
          )}
        </div>
      </div>
  );
};

export default InvoiceList;
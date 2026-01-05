import React, { useState, useEffect } from 'react';
import { getInvoices } from '../api';
import { Search, FileText, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(i => {
    const matchesSearch = i.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.id.toString().includes(searchTerm);
    return matchesSearch;
  }) : [];

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faturas</h2>
        <button
          onClick={() => navigate('/invoices/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Fatura
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID da fatura..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Data</th>
              <th className="p-4">Valor Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="p-4 font-medium text-blue-400">
                  #{invoice.id}
                </td>
                <td className="p-4">
                  <p className="font-medium">{invoice.customer.fullName}</p>
                  <p className="text-xs text-gray-500">{invoice.customer.document}</p>
                </td>
                <td className="p-4 text-sm">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}
                </td>
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
                <td className="p-4 text-right">
                  <button 
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="text-blue-400 hover:text-blue-300 p-2"
                    title="Ver Detalhes"
                  >
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
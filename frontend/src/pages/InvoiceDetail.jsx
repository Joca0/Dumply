import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, updateInvoiceStatus } from '../api';
import { ArrowLeft, Printer, Download, Calendar, User, Package, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchInvoice = async () => {
    try {
      const res = await getInvoice(id);
      setInvoice(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar detalhes da fatura");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Deseja realmente alterar o status para ${newStatus}?`)) return;

    setUpdatingStatus(true);
    try {
      await updateInvoiceStatus(id, newStatus);
      await fetchInvoice();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status da fatura");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-gray-500">Fatura não encontrada.</div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-600/20 text-green-600 print:text-green-700';
      case 'PENDING': return 'bg-yellow-600/20 text-yellow-500 print:text-yellow-700';
      case 'CANCELLED': return 'bg-red-600/20 text-red-500 print:text-red-700';
      default: return 'bg-gray-600/20 text-gray-500 print:text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PAID': return 'PAGO';
      case 'PENDING': return 'PENDENTE';
      case 'CANCELLED': return 'CANCELADO';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="hidden sm:inline">Voltar para faturas</span>
          <span className="sm:hidden">Voltar</span>
        </button>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {invoice && invoice.status !== 'PAID' && (
            <button
              onClick={() => handleStatusChange('PAID')}
              disabled={updatingStatus}
              className="flex-1 md:flex-none flex items-center justify-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} className="mr-2" />
              <span className="whitespace-nowrap">Marcar Pago</span>
            </button>
          )}
          {invoice && invoice.status === 'PAID' && (
            <button
              onClick={() => handleStatusChange('PENDING')}
              disabled={updatingStatus}
              className="flex-1 md:flex-none flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Clock size={18} className="mr-2" />
              <span className="whitespace-nowrap">Marcar Pendente</span>
            </button>
          )}
          {invoice && invoice.status !== 'CANCELLED' && (
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={updatingStatus}
              className="flex-1 md:flex-none flex items-center justify-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <XCircle size={18} className="mr-2" />
              <span className="whitespace-nowrap">Cancelar</span>
            </button>
          )}
          <button
            onClick={window.print}
            className="flex-1 md:flex-none flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download size={18} className="mr-2" />
            <span className="whitespace-nowrap">PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 print:overflow-visible shadow-xl overflow-hidden print:bg-white print:text-gray-900 print:border-gray-200 print:shadow-none" id="printable-invoice">
        {/* Header da Fatura */}
        <div className="p-4 md:p-8 border-b border-gray-700 bg-gray-700/30 flex justify-between items-start print:bg-gray-50 print:border-gray-200">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-500 mb-2">Dumply.</h1>
            <p className="text-gray-400 text-xs print:text-gray-500">Fatura #{invoice.id}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-[10px] md:text-sm font-semibold ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
            <p className="mt-4 text-[10px] md:text-sm text-gray-400 print:text-gray-500">
              Emitido em: {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cliente */}
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center print:text-gray-500">
              <User size={14} className="mr-2" /> Cliente
            </h3>
            <p className="text-xl font-bold print:text-gray-900">{invoice.customer.companyName}</p>
            <p className="text-xl font-bold print:text-gray-900">{invoice.customer.fullName}</p>
            <p className="text-gray-400 print:text-gray-600">{invoice.customer.document}</p>
            <p className="text-gray-400 mt-2 print:text-gray-600">{invoice.customer.email}</p>
            <p className="text-gray-400 print:text-gray-600">{invoice.customer.phone}</p>
          </div>

          {/* Resumo */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center print:text-gray-500">
              <DollarSign size={14} className="mr-2" /> Resumo do Pagamento
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 print:text-gray-500">Subtotal</span>
                <span className="print:text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 print:text-gray-500">Total de itens</span>
                <span className="print:text-gray-900">{invoice.items.length}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-700 flex justify-between font-bold text-lg print:border-gray-200">
                <span className="print:text-gray-900">Total</span>
                <span className="text-blue-400 print:text-blue-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itens da Fatura */}
        <div className="p-8 border-t border-gray-700 print:border-gray-200">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center print:text-gray-500">
            <Package size={14} className="mr-2" /> Itens da Fatura
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700 print:text-gray-500 print:border-gray-200">
                  <th className="pb-4 font-normal">Equipamento</th>
                  <th className="pb-4 font-normal">Endereço</th>
                  <th className="pb-4 font-normal">Período</th>
                  <th className="pb-4 font-normal text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 print:divide-gray-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <p className="font-medium print:text-gray-900">{item.equipment.name}</p>
                      <p className="text-xs text-gray-500 print:text-gray-400">N/S: {item.equipment.serialNumber}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-300 print:text-gray-600">
                      <p className="font-medium">{item.fullAddress}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-300 print:text-gray-600">
                      {new Date(item.startDate).toLocaleDateString('pt-BR')} - {item.endDate ? new Date(item.endDate).toLocaleDateString('pt-BR') : 'Em aberto'}
                    </td>
                    <td className="py-4 text-right font-medium print:text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.charge)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-900/30 text-center border-t border-gray-700 print:bg-gray-50 print:border-gray-200">
          <p className="text-gray-500 text-sm italic print:text-gray-400">
            Obrigado pela preferência! Em caso de dúvidas, entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
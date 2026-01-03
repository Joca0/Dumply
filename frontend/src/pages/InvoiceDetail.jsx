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
      await fetchInvoice(); // Recarrega os dados
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
      case 'PAID': return 'bg-green-600/20 text-green-400';
      case 'PENDING': return 'bg-yellow-600/20 text-yellow-400';
      case 'CANCELLED': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Voltar para faturas
        </button>
        <div className="flex gap-2">
          {invoice && invoice.status !== 'PAID' && (
            <button 
              onClick={() => handleStatusChange('PAID')}
              disabled={updatingStatus}
              className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} className="mr-2" /> Marcar como Pago
            </button>
          )}
          {invoice && invoice.status === 'PAID' && (
            <button 
              onClick={() => handleStatusChange('PENDING')}
              disabled={updatingStatus}
              className="flex items-center bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Clock size={18} className="mr-2" /> Marcar como Pendente
            </button>
          )}
          {invoice && invoice.status !== 'CANCELLED' && (
            <button 
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={updatingStatus}
              className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <XCircle size={18} className="mr-2" /> Cancelar Fatura
            </button>
          )}
          <button 
            onClick={() => window.print()}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Printer size={18} className="mr-2" /> Imprimir
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl" id="printable-invoice">
        {/* Header da Fatura */}
        <div className="p-8 border-b border-gray-700 bg-gray-700/30 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-500 mb-2">DUMPLY</h1>
            <p className="text-gray-400 text-sm">Fatura #{invoice.id}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
            <p className="mt-4 text-sm text-gray-400">
              Emitido em: {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cliente */}
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center">
              <User size={14} className="mr-2" /> Cliente
            </h3>
            <p className="text-xl font-bold">{invoice.customer.fullName}</p>
            <p className="text-gray-400">{invoice.customer.document}</p>
            <p className="text-gray-400 mt-2">{invoice.customer.email}</p>
            <p className="text-gray-400">{invoice.customer.phone}</p>
          </div>

          {/* Resumo */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center">
              <DollarSign size={14} className="mr-2" /> Resumo do Pagamento
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Descontos</span>
                <span>R$ 0,00</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-700 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itens da Fatura */}
        <div className="p-8 border-t border-gray-700">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center">
            <Package size={14} className="mr-2" /> Itens da Fatura (Aluguéis)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-4 font-normal">Equipamento</th>
                  <th className="pb-4 font-normal">Período</th>
                  <th className="pb-4 font-normal text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="font-medium">{item.equipment.name}</p>
                      <p className="text-xs text-gray-500">S/N: {item.equipment.serialNumber}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-300">
                      {new Date(item.startDate).toLocaleDateString('pt-BR')} - {item.endDate ? new Date(item.endDate).toLocaleDateString('pt-BR') : 'Em aberto'}
                    </td>
                    <td className="py-4 text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.charge)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-900/30 text-center border-t border-gray-700">
          <p className="text-gray-500 text-sm italic">
            Obrigado pela preferência! Em caso de dúvidas, entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
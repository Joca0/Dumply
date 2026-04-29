import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, updateInvoiceStatus } from '../api';
import { ArrowLeft, Printer, User, Package, DollarSign, CheckCircle, Clock, XCircle, ChevronRight, Building2, MapPin } from 'lucide-react';
import { toast } from "sonner";
import { useAlert } from "@/components/ui/MainAlert.jsx";
import { usePDFDownload } from '../hooks/usePDFDownload.jsx';

const InvoiceDetail = () => {
  const { handleDownloadPDF: downloadPDF } = usePDFDownload();
  const { showConfirm } = useAlert();
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
      toast.error("Erro ao carregar detalhes da fatura");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleStatusChange = (newStatus) => {
    showConfirm(
      'Tem certeza?',
      'Você deseja alterar o status dessa fatura?',
      async () => {
        try {
          setUpdatingStatus(true);
          await updateInvoiceStatus(id, newStatus);
          await fetchInvoice();
          toast.success("Status atualizado!");
        } catch (err) {
          toast.error("Erro ao atualizar status");
        } finally {
          setUpdatingStatus(false);
        }
      }
    );
  };

  const handleDownloadPDF = () => {
    downloadPDF('printable-invoice', `fatura-${invoice.id}`);
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 font-medium animate-pulse">Carregando fatura...</p>
        </div>
    );
  }

  if (!invoice) return <div className="p-8 text-center text-gray-400">Fatura não encontrada.</div>;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
      <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-screen">
        {/* ACTIONS HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 no-print">
          <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
          >
            <div className="p-2 group-hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium">Voltar para faturas</span>
          </button>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex gap-2 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800">
              <button
                  onClick={() => handleStatusChange('PAID')}
                  disabled={updatingStatus || invoice.status === 'PAID'}
                  className={`p-2.5 rounded-xl transition-all ${invoice.status === 'PAID' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                  title="Marcar como Pago"
              >
                <CheckCircle size={20} />
              </button>
              <button
                  onClick={() => handleStatusChange('PENDING')}
                  disabled={updatingStatus || invoice.status === 'PENDING'}
                  className={`p-2.5 rounded-xl transition-all ${invoice.status === 'PENDING' ? 'bg-amber-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                  title="Marcar como Pendente"
              >
                <Clock size={20} />
              </button>
              <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  disabled={updatingStatus || invoice.status === 'CANCELLED'}
                  className={`p-2.5 rounded-xl transition-all ${invoice.status === 'CANCELLED' ? 'bg-rose-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                  title="Cancelar Fatura"
              >
                <XCircle size={20} />
              </button>
            </div>

            <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              <Printer size={20} />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* INVOICE CARD */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black print:rounded-none" id="printable-invoice">

          {/* TOP BANNER */}
          <div className="p-8 md:p-12 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start gap-8 bg-gray-900/20 print:bg-white print:border-b-2 print:border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl">D</div>
                <h1 className="text-3xl font-black tracking-tighter text-white print:text-black">DUMPLY</h1>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número da Fatura</p>
                <p className="text-xl font-mono text-blue-400 print:text-blue-600">#{invoice.id.toString().padStart(6, '0')}</p>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className={`px-4 py-2 rounded-xl border font-bold text-xs tracking-widest print:border-2 ${getStatusStyle(invoice.status)}`}>
                {invoice.status === 'PAID' ? 'PAGAMENTO CONFIRMADO' : invoice.status === 'CANCELLED' ? 'FATURA CANCELADA' : 'AGUARDANDO PAGAMENTO'}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase">Data de Emissão</p>
                <p className="text-sm font-medium text-gray-300 print:text-black">{new Date(invoice.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 print:gap-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <User size={14} /> Dados do Cliente
                </h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-white print:text-black">{invoice.customer.fullName}</p>
                  {invoice.customer.companyName && (
                      <p className="flex items-center gap-2 text-gray-400 print:text-gray-700 font-medium">
                        <Building2 size={14} /> {invoice.customer.companyName}
                      </p>
                  )}
                  <p className="text-sm font-mono text-gray-400 mt-2">{invoice.customer.document}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase">Telefone</p>
                  <p className="text-sm text-gray-300 print:text-black">{invoice.customer.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase">E-mail</p>
                  <p className="text-sm text-gray-300 print:text-black">{invoice.customer.email || '---'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-950/50 p-8 rounded-3xl border border-gray-800 print:bg-gray-50 print:border-gray-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-500" /> Resumo Financeiro
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Quantidade de Itens</span>
                  <span className="font-bold text-white print:text-black">{invoice.items.length} itens</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-bold text-white print:text-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-800 print:border-gray-300 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase">Total a Pagar</p>
                    <p className="text-3xl font-black text-white print:text-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="px-8 md:px-12 pb-12 print:px-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Package size={14} className="text-blue-500" /> Especificação dos Serviços
            </h3>
            <div className="overflow-hidden print:overflow-visible">
              <table className="w-full text-left border-separate border-spacing-y-2 print:border-collapse print:border-spacing-0">
                <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest">
                  <th className="pb-4 px-4 font-bold">Item / Equipamento</th>
                  <th className="pb-4 px-4 font-bold">Local de Operação</th>
                  <th className="pb-4 px-4 font-bold text-center">Período</th>
                  <th className="pb-4 px-4 font-bold text-right">Valor Bruto</th>
                </tr>
                </thead>
                <tbody className="print:divide-y print:divide-gray-200">
                {invoice.items.map((item) => (
                    <tr key={item.id} className="bg-gray-800/20 print:bg-transparent">
                      <td className="p-4 rounded-l-xl print:rounded-none">
                        <p className="font-bold text-white print:text-black text-sm">{item.equipment.name}</p>
                        <p className="text-xs font-mono text-gray-400">Número de série: {item.equipment.serialNumber}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-1.5 text-xs text-gray-400 print:text-gray-700">
                          <MapPin size={12} className="mt-0.5 shrink-0" />
                          <span>{item.fullAddress}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-gray-950 px-3 py-1 rounded-full border border-gray-800 text-xs text-gray-400 print:border-none print:text-black">
                          {new Date(item.startDate).toLocaleDateString('pt-BR')}
                          <ChevronRight size={10} />
                          {item.endDate ? new Date(item.endDate).toLocaleDateString('pt-BR') : 'Em curso'}
                        </div>
                      </td>
                      <td className="p-4 text-right rounded-r-xl print:rounded-none font-bold text-white print:text-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.charge)}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-12 bg-gray-950/50 border-t border-gray-800 text-center print:bg-white print:border-gray-100">
            <p className="text-xs text-gray-400 italic max-w-md mx-auto leading-relaxed print:text-black">
              Obrigado pela preferência! Em caso de dúvidas, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
        <style>{`
        @media print {
          #printable-invoice {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Forçar quebras de página corretas na tabela de itens */
          tr {
            page-break-inside: avoid !important;
          }
      `}</style>
      </div>
  );
};

export default InvoiceDetail;
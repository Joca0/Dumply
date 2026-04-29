import React, { useState, useEffect } from 'react';
import { getUninvoicedRentals, createInvoice, autocompleteCustomers, getCustomer } from '../api';
import { User, Search, Plus, Check, Loader2, Receipt, Calendar, Package, ChevronRight, Calculator, Wallet, Hash, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAlert} from "@/components/ui/MainAlert.jsx";

// --- CUSTOMER SEARCH COM ESTILO DE CAMPO DE BUSCA MODERNO ---
const CustomerSearch = ({ onSelect, selectedCustomerId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        const res = await autocompleteCustomers(searchTerm);
        setSuggestions(res.data);
        setIsOpen(true);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
      <div className="relative w-full">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
              type="text"
              className="w-full bg-gray-900/50 border border-gray-800 text-white text-lg rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
              placeholder="Pesquisar cliente por nome ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isOpen && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-3 bg-gray-900 border border-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl">
              {suggestions.map(c => (
                  <div
                      key={c.id}
                      className="p-4 hover:bg-blue-600/20 cursor-pointer border-b border-gray-800/50 last:border-0 transition-all flex items-center justify-between group"
                      onClick={() => {
                        onSelect(c.id.toString());
                        setSearchTerm(c.fullName);
                        setIsOpen(false);
                      }}
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400">{c.fullName}</div>
                      <div className="text-xs text-gray-400 font-mono">{c.document}</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-700 group-hover:text-blue-400" />
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

const InvoiceCreate = () => {
  const { showConfirm } = useAlert();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [rentals, setRentals] = useState([]);
  const [selectedRentalIds, setSelectedRentalIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRentals, setFetchingRentals] = useState(false);
  const navigate = useNavigate();

  const handleInvoiceClose = () => {
    showConfirm(
        'Tem certeza?',
        'Você deseja fechar a fatura? Está ação não poderá ser desfeita.',
        async () => {
          if (selectedRentalIds.length === 0) return toast.error("Selecione ao menos um item");
          setLoading(true);
          try {
            const res = await createInvoice({ customerId: parseInt(selectedCustomerId), rentalIds: selectedRentalIds });
            toast.success("Fatura gerada!");
            navigate(`/invoices/${res.data.id}`);
          } catch (e) { toast.error("Erro ao gerar fatura"); }
          finally { setLoading(false); }
        }
    )
  }

  const totalSelected = rentals
      .filter(r => selectedRentalIds.includes(r.id))
      .reduce((acc, curr) => acc + curr.charge, 0);

  useEffect(() => {
    if (selectedCustomerId) {
      setFetchingRentals(true);
      getUninvoicedRentals(selectedCustomerId)
          .then(res => setRentals(res.data))
          .finally(() => setFetchingRentals(false));
    }
  }, [selectedCustomerId]);

  const toggleRental = (id) => {
    setSelectedRentalIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        {/* HEADER FIXO */}
        <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-400 mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <Receipt size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Novo Faturamento</h1>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Preview de Cobrança</p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl w-full">
              <CustomerSearch onSelect={setSelectedCustomerId} selectedCustomerId={selectedCustomerId} />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-400 mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LADO ESQUERDO: LISTA DE ITENS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={16} className="text-blue-500" />
                Aluguéis para Faturar {rentals.length > 0 && `(${rentals.length})`}
              </h2>
              {rentals.length > 0 && (
                  <button
                      onClick={() => setSelectedRentalIds(rentals.map(r => r.id))}
                      className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase"
                  >
                    Selecionar Tudo
                  </button>
              )}
            </div>

            {fetchingRentals ? (
                <div className="h-96 flex flex-col items-center justify-center bg-gray-900/20 border border-gray-800 rounded-3xl border-dashed">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                  <p className="text-gray-400 font-medium">Buscando medições pendentes...</p>
                </div>
            ) : rentals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rentals.map((rental) => (
                      <div
                          key={rental.id}
                          onClick={() => toggleRental(rental.id)}
                          className={`relative group p-6 rounded-4xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                              selectedRentalIds.includes(rental.id)
                                  ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.1)]'
                                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-600 hover:bg-gray-900/60'
                          }`}
                      >
                        {/* SELECIONADOR VISUAL */}
                        <div className={`absolute top-6 right-6 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedRentalIds.includes(rental.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-700'
                        }`}>
                          {selectedRentalIds.includes(rental.id) && <Check size={14} className="text-white" />}
                        </div>

                        <div className="mb-6">
                          <p className="text-xs font-bold text-blue-500 uppercase mb-1 flex items-center gap-1">
                            <Hash size={10} /> ID {rental.id}
                          </p>
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{rental.equipment?.name}</h3>
                          <p className="text-xs text-gray-400 font-mono mt-1">Número de série: {rental.equipment?.serialNumber}</p>
                        </div>

                        <div className="space-y-3 mb-8">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={14} className="text-gray-600" />
                            <span>{new Date(rental.startDate).toLocaleString("pt-br")} — {new Date(rental.endDate).toLocaleString("pt-br")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin size={14} className="text-gray-600" />
                            <span className="truncate">{rental.fullAddress}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600 uppercase">Subtotal do Período</span>
                          <span className="text-2xl font-black text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rental.charge)}
                    </span>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center bg-gray-900/20 border border-gray-800 rounded-3xl border-dashed text-center px-10">
                  <div className="p-6 bg-gray-900 rounded-full mb-6">
                    <Search size={40} className="text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Aguardando Seleção de Cliente</h3>
                  <p className="text-gray-400 max-w-xs">Use a barra de busca acima para carregar as medições pendentes de um cliente específico.</p>
                </div>
            )}
          </div>

          {/* LADO DIREITO: RESUMO DO FATURAMENTO (STICKY) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Efeito de Brilho */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>

                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <Calculator size={14} className="text-blue-500" /> Checkout de Fatura
                </h2>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Medições Selecionadas</span>
                    <span className="font-bold text-white">{selectedRentalIds.length}</span>
                  </div>
                  <div className="pt-6 border-t border-gray-800">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-2">Total a Faturar</p>
                    <div className="text-5xl font-black text-white tracking-tighter">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSelected)}
                    </div>
                  </div>
                </div>

                <button
                    onClick={handleInvoiceClose}
                    disabled={loading || selectedRentalIds.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <Wallet size={20} className="group-hover:scale-110 transition-transform" />
                        Finalizar Cobrança
                      </>
                  )}
                </button>

                {selectedRentalIds.length > 0 && (
                    <button
                        onClick={() => setSelectedRentalIds([])}
                        className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-white transition-colors py-2"
                    >
                      Limpar Seleção
                    </button>
                )}
              </div>

              {/* CARD DE DICA / AJUDA */}
              <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl flex gap-4">
                <div className="p-2 bg-blue-500/20 rounded-xl h-fit">
                  <Receipt size={16} className="text-blue-400" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-blue-400 font-bold">Dica:</span> Você pode selecionar múltiplos aluguéis para gerar uma fatura única consolidada para o cliente.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default InvoiceCreate;
import React, { useState, useEffect } from 'react';
import { getCustomers, getUninvoicedRentals, createInvoice } from '../api';
import { Search, Plus, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceCreate = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [rentals, setRentals] = useState([]);
  const [selectedRentalIds, setSelectedRentalIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRentals, setFetchingRentals] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      const fetchRentals = async () => {
        setFetchingRentals(true);
        try {
          const res = await getUninvoicedRentals(selectedCustomerId);
          setRentals(res.data);
          setSelectedRentalIds([]);
        } catch (err) {
          console.error(err);
        } finally {
          setFetchingRentals(false);
        }
      };
      fetchRentals();
    } else {
      setRentals([]);
      setSelectedRentalIds([]);
    }
  }, [selectedCustomerId]);

  const toggleRentalSelection = (id) => {
    setSelectedRentalIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateInvoice = async () => {
    if (selectedRentalIds.length === 0) return;
    setLoading(true);
    try {
      const res = await createInvoice({
        customerId: parseInt(selectedCustomerId),
        rentalIds: selectedRentalIds
      });
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao criar fatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 mt-8 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold">Gerar Nova Fatura</h2>
        <p className="text-sm md:text-base text-gray-400">Selecione o cliente e os aluguéis que deseja cobrar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Cliente</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Selecione um cliente...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName} ({customer.document})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-700/50 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-base md:text-lg">Aluguéis Pendentes</h3>
              {selectedRentalIds.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] md:text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  {selectedRentalIds.length} selecionado(s)
                </span>
              )}
            </div>
            
            <div className="max-h-[500px] overflow-x-auto">
              {fetchingRentals ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={32} />
                  <p className="text-gray-400">Buscando aluguéis...</p>
                </div>
              ) : rentals.length > 0 ? (
                <table className="w-full text-left min-w-[500px]">
                  <thead className="text-gray-400 text-[10px] md:text-xs uppercase border-b border-gray-700">
                    <tr>
                      <th className="p-4 w-10"></th>
                      <th className="p-4">Equipamento</th>
                      <th className="p-4">Período</th>
                      <th className="p-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {rentals.map((rental) => (
                      <tr 
                        key={rental.id} 
                        className={`hover:bg-gray-700/30 cursor-pointer transition-colors ${selectedRentalIds.includes(rental.id) ? 'bg-blue-600/10' : ''}`}
                        onClick={() => toggleRentalSelection(rental.id)}
                      >
                        <td className="p-4">
                          <div className={`w-5 h-5 rounded border ${selectedRentalIds.includes(rental.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'} flex items-center justify-center`}>
                            {selectedRentalIds.includes(rental.id) && <Check size={14} className="text-white" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-sm">{rental.equipment.name}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{rental.fullAddress}</div>
                        </td>
                        <td className="p-4 text-[10px] md:text-sm">
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right font-bold text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rental.charge)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : selectedCustomerId ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  Nenhum aluguel pendente para este cliente.
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 text-sm">
                  Selecione um cliente para ver os aluguéis disponíveis.
                </div>
              )}
            </div>

            {selectedRentalIds.length > 0 && (
              <div className="p-4 bg-gray-900 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Selecionado</p>
                  <p className="text-xl font-bold text-blue-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      rentals.filter(r => selectedRentalIds.includes(r.id)).reduce((acc, curr) => acc + curr.charge, 0)
                    )}
                  </p>
                </div>
                <button
                  onClick={handleCreateInvoice}
                  disabled={loading}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 md:py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  Gerar Fatura
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreate;

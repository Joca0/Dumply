import React, { useState, useEffect } from 'react';
import { getRentals, returnRental, deleteRental } from '../api';
import { Search, CheckCircle, Trash2, Printer, Calendar, User, Clock, FileText } from 'lucide-react';

const RentalList = () => {
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    try {
      const res = await getRentals();
      setRentals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredRentals = Array.isArray(rentals) ? rentals.filter(r => {
    const rentalDate = r.startDate.substring(0, 7); // Filtra pela data de início
    const matchesMonth = !selectedMonth || rentalDate === selectedMonth;
    const matchesCustomer = selectedCustomer === 'all' || r.customer?.id.toString() === selectedCustomer;
    const matchesStatus = filter === 'ALL' || r.status === filter;
    const customerName = r.customer?.fullName || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMonth && matchesCustomer && matchesStatus && matchesSearch;
  }) : [];


  // Funções de ação
  const handleReturn = async (id) => {
    if (window.confirm("Deseja realmente encerrar este aluguel?")) {
      setLoading(true);
      try {
        await returnRental(id);
        fetchRentals();
      } catch (err) { console.error(err); setLoading(false); }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir o registro?")) {
      setLoading(true);
      try {
        await deleteRental(id);
        fetchRentals();
      } catch (err) { console.error(err); setLoading(false); }
    }
  };

  if (loading && rentals.length === 0) {
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
          <h2 className="text-2xl font-bold">Relatório de Aluguéis</h2>
          <button
              onClick={() => window.print()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors no-print"
          >
            <Printer size={20} />
            Imprimir PDF
          </button>
        </div>

        {/* FILTROS (no-print) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium ml-1 flex items-center gap-1"><Calendar size={12}/> MÊS</label>
            <input
                type="month"
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-blue-500 text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium ml-1">STATUS</label>
            <select
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-blue-500 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="FINISHED">Finalizados</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium ml-1">BUSCA</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                  type="text"
                  placeholder="Nome do cliente..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-700/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4 border-b border-gray-700 print:border-black">Cliente</th>
              <th className="p-4 border-b border-gray-700 print:border-black">Equipamento</th>
              <th className="p-4 border-b border-gray-700 print:border-black">Início</th>
              <th className="p-4 border-b border-gray-700 print:border-black">Encerramento</th>
              <th className="p-4 border-b border-gray-700 print:border-black">Status</th>
              <th className="p-4 border-b border-gray-700 text-right no-print">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
            {filteredRentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-700/30 transition-colors print:text-black">
                  <td className="p-4">
                    <p className="font-medium">{rental.customer?.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{rental.customer?.document || 'N/D'}</p>
                  </td>
                  <td className="p-4">
                    <p>{rental.equipment?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">SN: {rental.equipment?.serialNumber || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(rental.startDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Pendente'}
                  </td>
                  <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      rental.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {rental.status === 'ACTIVE' ? 'Ativo' : 'Finalizado'}
                  </span>
                  </td>
                  <td className="p-4 text-right no-print">
                    <div className="flex justify-end gap-2">
                      {rental.status === 'ACTIVE' && (
                          <button onClick={() => handleReturn(rental.id)} className="text-green-500 hover:text-green-400 p-2">
                            <CheckCircle size={20} />
                          </button>
                      )}
                      <button onClick={() => handleDelete(rental.id)} className="text-red-500 hover:text-red-400 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
          {filteredRentals.length === 0 && (
              <div className="p-8 text-center text-gray-500 italic">Nenhum aluguel encontrado no período.</div>
          )}
        </div>
      </div>
  );
};

export default RentalList;
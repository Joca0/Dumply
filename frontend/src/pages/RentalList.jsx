import React, { useState, useEffect } from 'react';
import { getRentals, returnRental, deleteRental } from '../api';
import { Search, CheckCircle, Trash2 } from 'lucide-react';

const RentalList = () => {
  const [rentals, setRentals] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleReturn = async (id) => {
    if (window.confirm("Deseja realmente encerrar este aluguel?")) {
      setLoading(true);
      try {
        await returnRental(id);
        alert("Aluguel encerrado com sucesso!");
        fetchRentals();
      } catch (err) {
        console.error(err);
        alert("Erro ao encerrar aluguel");
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir o registro deste aluguel?")) {
      setLoading(true);
      try {
        await deleteRental(id);
        alert("Registro de aluguel excluído com sucesso!");
        fetchRentals();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir aluguel");
        setLoading(false);
      }
    }
  };

  const filteredRentals = Array.isArray(rentals) ? rentals.filter(r => {
    const matchesStatus = filter === 'ALL' || r.status === filter;
    const matchesSearch = r.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) : [];

  if (loading && rentals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Consultas de Aluguéis</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">Todos os Status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="FINISHED">Finalizados</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Equipamento</th>
              <th className="p-4">Início</th>
              <th className="p-4">Encerramento</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredRentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="p-4">
                  <p className="font-medium">{rental.customer.fullName}</p>
                  <p className="text-xs text-gray-500">{rental.customer.document}</p>
                </td>
                <td className="p-4">
                  <p>{rental.equipment.name}</p>
                  <p className="text-xs text-gray-500">S/N: {rental.equipment.serialNumber}</p>
                </td>
                <td className="p-4 text-sm">
                  {new Date(rental.startDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm">
                  {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Prev: ' + (rental.status === 'ACTIVE' ? 'Pendente' : '-')}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    rental.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {rental.status === 'ACTIVE' ? 'Ativo' : 'Finalizado'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {rental.status === 'ACTIVE' && (
                      <button 
                        onClick={() => handleReturn(rental.id)}
                        className="text-green-500 hover:text-green-400 p-2"
                        title="Encerrar Aluguel"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(rental.id)}
                      className="text-red-500 hover:text-red-400 p-2"
                      title="Excluir Registro"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRentals.length === 0 && (
          <div className="p-8 text-center text-gray-500">Nenhum aluguel encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default RentalList;
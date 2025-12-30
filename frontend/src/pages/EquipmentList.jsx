import React, { useState, useEffect } from 'react';
import { getEquipments, deleteEquipment } from '../api';
import { Search, Box, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const EquipmentList = () => {
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const res = await getEquipments();
      setEquipments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este equipamento?')) {
      try {
        await deleteEquipment(id);
        alert('Equipamento excluído com sucesso!');
        fetchEquipments();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir equipamento. Verifique se ele não está alugado.');
      }
    }
  };

  const filteredEquipments = Array.isArray(equipments) ? equipments.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.serialNumber.includes(searchTerm)
  ) : [];

  if (loading && equipments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Consulta de Equipamentos</h2>
        <Link to="/equipments/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Novo Equipamento
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou S/N..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Equipamento</th>
              <th className="p-4">Número de Série</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredEquipments.map((eq) => (
              <tr key={eq.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="p-4 flex items-center">
                  <div className="bg-gray-700 p-2 rounded-full mr-3 text-gray-400">
                    <Box size={16} />
                  </div>
                  <span className="font-medium">{eq.name}</span>
                </td>
                <td className="p-4">{eq.serialNumber}</td>
                <td className="p-4">{eq.category || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    eq.status === 'AVAILABLE' ? 'bg-green-600/20 text-green-400' : 
                    eq.status === 'RENTED' ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {eq.status === 'AVAILABLE' ? 'Disponível' : 
                     eq.status === 'RENTED' ? 'Alugado' : 'Manutenção'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      to={`/equipments/edit/${eq.id}`}
                      className="text-blue-500 hover:text-blue-400 p-2"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(eq.id)}
                      className="text-red-500 hover:text-red-400 p-2"
                      title="Excluir"
                      disabled={eq.status === 'RENTED'}
                    >
                      <Trash2 size={18} className={eq.status === 'RENTED' ? 'opacity-30' : ''} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEquipments.length === 0 && (
          <div className="p-8 text-center text-gray-500">Nenhum equipamento encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default EquipmentList;

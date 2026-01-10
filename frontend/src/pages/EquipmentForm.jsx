import React, { useState, useEffect } from 'react';
import { createEquipment, getEquipment, updateEquipment } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const EquipmentForm = () => {
  const [formData, setFormData] = useState({ name: '', serialNumber: '', category: '', status: 'AVAILABLE' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchEquipmentData = async () => {
        setFetching(true);
        try {
          const res = await getEquipment(id);
          const { name, serialNumber, category, status } = res.data;
          setFormData({ 
            name: name || '', 
            serialNumber: serialNumber || '',
            category: category || '',
            status: status || 'AVAILABLE'
          });
        } catch (err) {
          console.error(err);
          alert('Erro ao carregar dados do equipamento.');
          navigate('/equipments');
        } finally {
          setFetching(false);
        }
      };
      fetchEquipmentData();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await updateEquipment(id, formData);
        alert('Equipamento atualizado com sucesso!');
      } else {
        await createEquipment(formData);
        alert('Equipamento cadastrado com sucesso!');
      }
      navigate('/equipments');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar equipamento.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Editar Equipamento' : 'Cadastrar Equipamento'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            required
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Número de Série</label>
          <input
            type="text"
            required
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoria (Opcional)</label>
          <input
            type="text"
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : id ? 'Atualizar Equipamento' : 'Salvar Equipamento'}
        </button>
      </form>
    </div>
  );
};

export default EquipmentForm;
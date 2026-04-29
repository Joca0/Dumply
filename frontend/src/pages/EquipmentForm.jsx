import React, { useState, useEffect } from 'react';
import { createEquipment, getEquipment, updateEquipment } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { Package, Hash, Tag, Save, ChevronLeft, Info } from 'lucide-react';

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
          toast.error('Erro ao carregar dados do equipamento.');
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
        toast.success('Equipamento atualizado com sucesso!');
      } else {
        await createEquipment(formData);
        toast.success('Equipamento cadastrado com sucesso!');
      }
      navigate('/equipments');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar equipamento.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 font-medium animate-pulse">Buscando equipamento...</p>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto p-4 md:p-10 min-h-screen">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {id ? 'Editar Equipamento' : 'Novo Cadastro'}
              </h2>
              <p className="text-gray-400 text-sm">Gerencie os detalhes técnicos do inventário.</p>
            </div>
          </div>

          <button
              onClick={() => navigate('/equipments')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} /> Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-900/40 border border-gray-800 p-6 md:p-8 rounded-3xl backdrop-blur-sm space-y-8 shadow-2xl">

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
              <Info size={14} className="text-blue-500" /> Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOME */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Tag size={12} className="text-blue-500" /> Nome do Equipamento
                </label>
                <div className="relative group">
                  <input
                      type="text"
                      required
                      disabled={loading}
                      placeholder="Ex: Miniescavadeira"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* SERIAL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Hash size={12} className="text-blue-500" /> Número de Série
                </label>
                <div className="relative group">
                  <input
                      type="text"
                      required
                      disabled={loading}
                      placeholder="00000000"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* CATEGORIA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Categoria (Opcional)</label>
              <input
                  type="text"
                  disabled={loading}
                  placeholder="Ex: Terraplanagem, Construção Civil..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          {/* BOTÃO DE AÇÃO */}
          <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-900/20 text-lg flex items-center justify-center gap-3 group"
          >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
                <>
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                  {id ? 'Atualizar Equipamento' : 'Confirmar Cadastro'}
                </>
            )}
          </button>
        </form>
      </div>
  );
};

export default EquipmentForm;
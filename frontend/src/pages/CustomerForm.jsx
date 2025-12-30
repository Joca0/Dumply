import React, { useState, useEffect } from 'react';
import { createCustomer, getCustomer, updateCustomer } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerForm = () => {
  const [formData, setFormData] = useState({ fullName: '', document: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchCustomerData = async () => {
        setFetching(true);
        try {
          const res = await getCustomer(id);
          const { fullName, document, phone, email } = res.data;
          setFormData({ 
            fullName: fullName || '', 
            document: document || '', 
            phone: phone|| '',
            email: email || '' 
          });
        } catch (err) {
          console.error(err);
          alert('Erro ao carregar dados do cliente.');
          navigate('/customers');
        } finally {
          setFetching(false);
        }
      };
      fetchCustomerData();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await updateCustomer(id, formData);
        alert('Cliente atualizado com sucesso!');
      } else {
        await createCustomer(formData);
        alert('Cliente cadastrado com sucesso!');
      }
      navigate('/customers');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente.');
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
      <h2 className="text-2xl font-bold mb-6">{id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            required
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Documento (CPF/CNPJ)</label>
          <input
            type="text"
            required
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.document}
            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contato</label>
          <input
            type="text"
            required
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail (Opcional)</label>
          <input
            type="email"
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          ) : id ? 'Atualizar Cliente' : 'Salvar Cliente'}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
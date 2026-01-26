import React, { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../api';
import { Search, User, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {toast} from "sonner";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este cliente?')) {
      try {
        await deleteCustomer(id);
        toast.success('Cliente excluído com sucesso!');
        fetchCustomers();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir cliente. Verifique se ele não possui aluguéis vinculados.');
      }
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  ) : [];

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold mt-8 md:mt-0">Consulta de Clientes</h2>
        <Link to="/customers/new" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center">
          Novo Cliente
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou documento..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
        <table className="w-full text-left min-w-[800px] md:min-w-full">
          <thead className="bg-gray-700/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Celular</th>
              <th className="p-4">Documento</th>
              <th className="p-4">E-mail</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="p-4 flex items-center">
                  <div className="bg-gray-700 p-2 rounded-full mr-3 text-gray-400">
                    <User size={16} />
                  </div>
                  <span className="font-medium">{customer.fullName}</span>
                </td>
                <td className="p-4">{customer.companyName || '-'}</td>
                <td className="p-4">{customer.phone || customer.contact}</td>
                <td className="p-4">{customer.document}</td>
                <td className="p-4 text-gray-400 text-sm">{customer.email || '-'}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      to={`/customers/edit/${customer.id}`}
                      className="text-blue-500 hover:text-blue-400 p-2"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-500 hover:text-red-400 p-2"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-gray-500">Nenhum cliente encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;

import React, { useState, useEffect } from 'react';
import { createCustomer, getCustomer, updateCustomer } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { User, Building2, Fingerprint, Phone, Mail, Save, ChevronLeft, Info } from 'lucide-react';
import { usePhoneMask } from "@/hooks/usePhoneMask.jsx";
import { useDocumentMask } from "@/hooks/useDocumentMask.jsx";

const CustomerForm = () => {
  const [formData, setFormData] = useState({ fullName: '', companyName: '', document: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const documentMask = useDocumentMask(
    formData.document,
    (val) => setFormData((prev) => ({ ...prev, document: val }))
  );

  const phoneMask = usePhoneMask(
    formData.phone,
    (val) => setFormData((prev) => ({ ...prev, phone: val }))
  );

  useEffect(() => {
    if (id) {
      const fetchCustomerData = async () => {
        setFetching(true);
        try {
          const res = await getCustomer(id);
          const { companyName, fullName, document, phone, email } = res.data;
          setFormData({
            fullName: fullName || '',
            companyName: companyName || '',
            document: document || '',
            phone: phone || '',
            email: email || ''
          });
        } catch (err) {
          console.error(err);
          toast.error('Erro ao carregar dados do cliente.');
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
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createCustomer(formData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      navigate('/customers');
    } catch (err) {
      toast.error("Ocorreu um erro ao processar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 font-medium animate-pulse">Buscando dados do cliente...</p>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto p-4 md:p-10 min-h-screen">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {id ? 'Editar Cadastro' : 'Novo Cliente'}
              </h2>
              <p className="text-gray-400 text-sm">Gerencie informações pessoais e de contato.</p>
            </div>
          </div>

          <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} /> Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CARD PRINCIPAL */}
          <div className="bg-gray-900/40 border border-gray-800 p-6 md:p-8 rounded-3xl backdrop-blur-sm space-y-8 shadow-2xl">

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Info size={14} className="text-blue-500" /> Identificação e Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOME COMPLETO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <User size={12} className="text-blue-500" /> Nome Completo
                </label>
                <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder="Ex: João Silva"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              {/* DOCUMENTO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Fingerprint size={12} className="text-blue-500" /> {documentMask.label}
                </label>
                <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder={documentMask.placeholder}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                    value={formData.document}
                    onChange={documentMask.handleChange}
                    maxLength={documentMask.maxLength}
                />
              </div>

              {/* EMPRESA */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Building2 size={12} className="text-blue-500" /> Nome da Empresa (Opcional)
                </label>
                <input
                    type="text"
                    disabled={loading}
                    placeholder="Empresa XYZ"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              {/* CELULAR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Phone size={12} className="text-blue-500" /> Celular / WhatsApp
                </label>
                <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    value={formData.phone}
                    onChange={phoneMask.handleChange}
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Mail size={12} className="text-blue-500" /> E-mail (Opcional)
                </label>
                <input
                    type="email"
                    disabled={loading}
                    placeholder="contato@empresa.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
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
                  {id ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </>
            )}
          </button>
        </form>
      </div>
  );
};

export default CustomerForm;
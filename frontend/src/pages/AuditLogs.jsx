import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs } from '../api';
import { toast } from "sonner";

import {
  Search,
  Shield,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  RefreshCcw,
  Info,
  User

} from 'lucide-react';

const AuditLogs = () => {
  const { user, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !['OWNER', 'ADMIN', 'MANAGER'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 15,
        search: searchTerm || undefined,
        eventType: eventType || undefined
      };
      const res = await getAuditLogs(params);
      console.log("[DEBUG] Audit logs response:", res.data);
      setLogs(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar logs de auditoria');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, eventType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(timeout);
  }, [fetchLogs]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('pt-BR');
    } catch (err) {
      return dateString;
    }
  };

  const getEventColor = (type) => {

    if (
        type?.includes('FAIL') ||
        type?.includes('LOCKED') ||
        type?.includes('DELETED') ||
        type?.includes('REVOKED')
    ) {
      return 'text-red-400 bg-red-400/10';
    }

    if (
        type?.includes('SUCCESS') ||
        type?.includes('GRANTED') ||
        type?.includes('ENABLED')
    ) {
      return 'text-emerald-400 bg-emerald-400/10';
    }

    if (
        type?.includes('UPDATE') ||
        type?.includes('CHANGED') ||
        type?.includes('REQUEST')
    ) {
      return 'text-amber-400 bg-amber-400/10';
    }
    return 'text-blue-400 bg-blue-400/10';

  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen text-white">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Shield size={24} />
            </div>
            Logs de Auditoria
          </h2>
          <p className="text-gray-400 text-sm mt-1">Rastreabilidade e conformidade LGPD.</p>
        </div>
        <button 
          onClick={() => fetchLogs(page)} 
          className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all active:scale-95"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por e-mail ou descrição..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="md:col-span-4 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos os Eventos</option>
            <option value="LOGIN_SUCCESS">Login Sucesso</option>
            <option value="LOGIN_FAIL">Falha de Login</option>
            <option value="ACCOUNT_LOCKED">Conta Bloqueada</option>
            <option value="CONSENT_GRANTED">Consentimento LGPD</option>
            <option value="DATA_EXPORTED">Exportação de Dados</option>
            <option value="ACCOUNT_DELETED">Exclusão de Dados</option>
            <option value="PASSWORD_CHANGED">Alteração de Senha</option>
          </select>
        </div>
      </div>

      {/* TABELA (DESKTOP) */}
      <div className="hidden md:block bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900/80 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">Buscando registros...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock size={14} className="text-gray-500" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-[10px] font-bold text-blue-400">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-medium">{log.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getEventColor(log.eventType)}`}>
                        {log.eventType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs xl:max-w-md">
                        <Info size={14} className="text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-400 leading-tight">{log.details}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-500">{log.ipAddress || '—'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERSÃO MOBILE (CARDS) */}
      <div className="md:hidden space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getEventColor(log.eventType)}`}>
                {log.eventType?.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">{log.ipAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-500" />
              <span className="text-sm font-bold truncate">{log.email}</span>
            </div>
            <p className="text-xs text-gray-400">{log.details}</p>
            <div className="pt-2 border-t border-gray-800 flex items-center gap-2 text-[10px] text-gray-500">
              <Clock size={12} />
              {formatDate(log.timestamp)}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINAÇÃO */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Página <span className="text-white font-bold">{page + 1}</span> de <span className="text-white font-bold">{totalPages || 1}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

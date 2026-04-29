import React, { useState, useEffect, useCallback } from 'react';
import { getAssignedRentals } from '../api';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Truck,
    Clock
} from 'lucide-react';
import { toast } from "sonner";

const AssignedList = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchRentals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAssignedRentals(page, 10);
            setRentals(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setLoading(false);
        } catch (err) {
            toast.error("Erro ao carregar atribuições.");
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchRentals();
    }, [fetchRentals]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && rentals.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
            {/* HEADER */}
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Truck className="text-blue-500" />
                    Minhas Atribuições (EM DESENVOLVIMENTO)
                </h2>
                <p className="text-gray-400 text-sm mt-1">Lista de locações atribuídas a você. (Essa seção se encontra em desenvolvimento)</p>
            </div>

            {/* LISTA DE CARDS */}
            <div className="space-y-4 mb-8">
                {rentals.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center">
                        <p className="text-gray-400">Nenhuma atribuição encontrada.</p>
                    </div>
                ) : (
                    rentals.map((rental) => (
                        <div key={rental.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            
                            <div className="mb-4">
                                <h3 className="text-white font-bold text-lg leading-tight">
                                    {rental.customer?.fullName || 'Cliente não identificado'}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Endereço</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{rental.fullAddress}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                                        <Clock size={16} className="text-blue-500" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Data/Hora</p>
                                            <p className="text-white text-sm font-bold">{formatDate(rental.startDate)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                                        <Truck size={16} className="text-emerald-500" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Equipamento</p>
                                            <p className="text-white text-sm font-bold">
                                                {rental.equipment ? `${rental.equipment.name} (${rental.equipment.serialNumber})` : 'Não definido'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* PAGINAÇÃO */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 p-4 rounded-2xl backdrop-blur-sm">
                    <button
                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        disabled={page === 0}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-20 hover:bg-gray-700 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-gray-400 text-sm font-medium">
                        Página <span className="text-white font-bold">{page + 1}</span> de <span className="text-white font-bold">{totalPages}</span>
                    </span>
                    <button
                        onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={page === totalPages - 1}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-20 hover:bg-gray-700 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssignedList;

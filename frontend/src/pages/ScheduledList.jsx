import React, { useState, useEffect, useCallback } from 'react';
import { getScheduledRentals, updateRental, activateRental, assignDriver, autocompleteEquipments, autocompleteDrivers } from '../api';
import {
    Search,
    Calendar,
    Edit2,
    Download,
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    CalendarClock,
    MapPin,
    User,
    UserPlus,
    Plus,
    X,
    Clock
} from 'lucide-react';
import { usePDFDownload } from "@/hooks/usePDFDownload.jsx";
import { useAlert } from "@/components/ui/MainAlert.jsx";
import { Link } from "react-router-dom";
import { toast } from "sonner";


const InternalDriverSearch = ({ onSelect, initialValue }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue ? `${initialValue.fullName} (${initialValue.document})` : '');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = React.useRef(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 1) {
                try {
                    const res = await autocompleteDrivers(searchTerm);
                    setSuggestions(res.data);
                    setIsOpen(true);
                } catch (err) { console.error(err); }
            } else setSuggestions([]);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative group">
                <input
                    type="text"
                    placeholder="Buscar motorista..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3 text-gray-600" />
            </div>
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-110 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {suggestions.map(d => (
                        <div
                            key={d.id}
                            className="p-3 hover:bg-emerald-500/10 cursor-pointer border-b border-gray-800/50 last:border-0 text-sm"
                            onClick={() => {
                                onSelect(d);
                                setSearchTerm(`${d.fullName} (${d.document})`);
                                setIsOpen(false);
                            }}
                        >
                            <div className="text-white font-bold">{d.fullName}</div>
                            <div className="text-xs text-gray-400">Documento: {d.document}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const InternalEquipmentSearch = ({ onSelect, initialValue }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue ? `${initialValue.name} (${initialValue.serialNumber})` : '');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = React.useRef(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 1) {
                try {
                    const res = await autocompleteEquipments(searchTerm);
                    setSuggestions(res.data);
                    setIsOpen(true);
                } catch (err) { console.error(err); }
            } else setSuggestions([]);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative group">
                <input
                    type="text"
                    placeholder="Buscar equipamento disponível..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3 text-gray-600" />
            </div>
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-110 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {suggestions.map(e => (
                        <div
                            key={e.id}
                            className="p-3 hover:bg-emerald-500/10 cursor-pointer border-b border-gray-800/50 last:border-0 text-sm"
                            onClick={() => {
                                onSelect(e);
                                setSearchTerm(`${e.name} (${e.serialNumber})`);
                                setIsOpen(false);
                            }}
                        >
                            <div className="text-white font-bold">{e.name}</div>
                            <div className="text-xs text-gray-400">Número de série: {e.serialNumber}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ScheduledRentals = () => {
    const { handleDownloadPDF: downloadPDF } = usePDFDownload();
    const [rentals, setRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRental, setSelectedRental] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Debounce na busca
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRentals();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedMonth, page]);

    const fetchRentals = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {
                search: searchTerm,
                month: selectedMonth,
            };
            const res = await getScheduledRentals(page, 10, filters);
            setRentals(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setLoading(false);
        } catch (err) {
            console.error("Erro ao buscar agendamentos:", err);
            toast.error("Erro ao carregar dados.");
            setLoading(false);
        }
    }, [page, searchTerm, selectedMonth]);

    const handleConfirmActivation = async () => {
        if (!selectedEquipment || !selectedRental) {
            toast.error("Selecione um equipamento primeiro");
            return;
        }

        try {
            const updatePayload = {
                items: [{
                    equipmentId: selectedEquipment.id,
                    charge: selectedRental.charge
                }],
                customerId: selectedRental.customer.id,
                startDate: selectedRental.startDate,
                endDate: selectedRental.endDate,
                fullAddress: selectedRental.fullAddress,
                latitude: selectedRental.latitude,
                longitude: selectedRental.longitude,
                driverId: selectedDriver?.id || selectedRental.driver?.id,
            };

            await updateRental(selectedRental.id, updatePayload);

            // 2. Ativa o aluguel
            await activateRental(selectedRental.id);

            toast.success("Equipamento atribuído e locação iniciada!");
            setIsModalOpen(false);
            fetchRentals(); // Recarrega a lista
        } catch (err) {
            toast.error("Erro ao processar ativação");
        }
    };

    const handleConfirmDriverAssignment = async () => {
        if (!selectedRental || !selectedDriver) {
            toast.error("Selecione um motorista primeiro");
            return;
        }

        try {
            await assignDriver(selectedRental.id, selectedDriver.id);
            toast.success("Motorista atribuído!");
            setIsDriverModalOpen(false);
            fetchRentals();
        } catch (err) {
            toast.error("Erro ao atribuir motorista");
        }
    };

    const handleRemoveDriver = async () => {
        if (!selectedRental) return;

        try {
            await assignDriver(selectedRental.id, null);
            toast.success("Motorista removido!");
            setIsDriverModalOpen(false);
            fetchRentals();
        } catch (err) {
            toast.error("Erro ao remover motorista");
        }
    };

    const handleDownloadPDF = () => {
        downloadPDF('printable', 'agendamentos')
    };

    const getStatusBadge = () => {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
        </span>
        AGENDADO
      </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    if (loading && rentals.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-400 mx-auto min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CalendarClock className="text-amber-500 hidden md:block" />
                        Agendamentos
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Gerencie saídas futuras e ative locações pendentes.</p>
                </div>
                <div className="flex w-full md:w-auto gap-3 no-print">
                    <button
                        onClick={() => handleDownloadPDF()}
                        className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-gray-700 transition-all"
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">Relatório PDF</span>
                    </button>
                    <Link
                        to="/rentals/new"
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        <span className="text-lg leading-none mb-0.5">+</span> Novo Agendamento
                    </Link>
                </div>
            </div>

            {/* FILTROS */}
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl mb-6 backdrop-blur-sm no-print">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Busca */}
                    <div className="md:col-span-8 relative">
                        <label className="text-xs text-gray-400 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                            <Search size={10} /> Buscar
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nome do cliente ou documento..."
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3 text-gray-600" size={16} />
                        </div>
                    </div>

                    {/* Mês */}
                    <div className="md:col-span-4">
                        <label className="text-xs text-gray-400 font-bold uppercase ml-1 mb-1.5 flex items-center gap-1">
                            <Calendar size={10} /> Previsão de Saída
                        </label>
                        <input
                            type="month"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- MOBILE: VIEW EM CARDS --- */}
            <div className="md:hidden space-y-4 mb-8">
                {rentals.map((rental) => (
                    <div key={rental.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">{rental.customer?.fullName}</h3>
                                <p className="text-gray-400 text-xs font-mono mt-0.5">{rental.customer?.document || 'Sem documento'}</p>
                            </div>
                            {getStatusBadge()}
                        </div>

                        <div className="pl-2 space-y-3 mb-4">
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{rental.fullAddress}</p>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-800">
                                <Clock size={14} className="text-amber-500" />
                                <span className="text-gray-300 text-xs font-medium">
                  Saída prevista: <span className="text-white font-bold">{formatDate(rental.startDate)}</span>
                </span>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-800">
                                <User size={14} className="text-blue-500" />
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-gray-300 text-xs font-medium">
                                        Motorista: <span className="text-white font-bold">{rental.driver?.fullName || 'Não atribuído'}</span>
                                    </span>
                                    <button
                                        onClick={() => {
                                            setSelectedRental(rental);
                                            setSelectedDriver(rental.driver);
                                            setIsDriverModalOpen(true);
                                        }}
                                        className="text-emerald-500 hover:text-emerald-400"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ações Mobile */}
                        <div className="grid grid-cols-4 gap-2 pl-2">
                            <button
                                onClick={() => {
                                    setSelectedRental(rental);
                                    setSelectedDriver(rental.driver);
                                    setSelectedEquipment(null);
                                    setIsModalOpen(true);
                                }}
                                className="col-span-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <PlayCircle size={16} /> INICIAR LOCAÇÃO
                            </button>
                            <Link
                                to={`/rentals/edit/${rental.id}`}
                                className="col-span-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg py-2 flex items-center justify-center active:scale-95"
                            >
                                <Edit2 size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DESKTOP --- */}
            <div id="printable" className="hidden md:block bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden shadow-xl mb-6">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                    <tr className="bg-gray-800/50">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Cliente</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Motorista (BETA)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Local de Entrega</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">Data Agendada</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 text-right no-print">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {rentals.map((rental) => (
                        <tr key={rental.id} className="group hover:bg-white/2 transition-colors">
                            <td className="p-4 align-middle">
                                <div className="font-semibold text-gray-200">{rental.customer?.fullName}</div>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">{rental.customer?.document || '---'}</div>
                            </td>
                            <td className="p-4 align-middle">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400 font-medium">
                                                {rental.driver?.fullName || 'Motorista não atribuído'}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setSelectedRental(rental);
                                                    setSelectedDriver(rental.driver);
                                                    setIsDriverModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-emerald-500/10 text-emerald-500 rounded transition-colors"
                                                title="Designar Motorista"
                                            >
                                                {rental.driver ? <Edit2 size={12} /> : <Plus size={14} />}
                                            </button>
                                            {rental.driver && (
                                                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 rounded uppercase font-bold tracking-wide">Beta</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600 font-mono">
                                            {rental.driver?.document ? `CNH: ${rental.driver.document}` : '---'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 align-top">
                                <div className="flex gap-2">
                                    <MapPin size={14} className="text-gray-600 shrink-0 mt-0.5" />
                                    <span className="text-xs text-gray-400 leading-relaxed">{rental.fullAddress}</span>
                                </div>
                            </td>
                            <td className="p-4 align-middle">
                                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                                    <Calendar size={14} className="text-amber-500" />
                                    {formatDate(rental.startDate)}
                                </div>
                            </td>
                            <td className="p-4 align-middle text-right no-print">
                                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setSelectedRental(rental);
                                            setSelectedDriver(rental.driver);
                                            setSelectedEquipment(null);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                                        title="Atribuir Equipamento e Iniciar"
                                    >
                                        <PlayCircle size={18} />
                                    </button>
                                    <Link
                                        to={`/rentals/edit/${rental.id}`}
                                        className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* EMPTY STATE */}
            {!loading && rentals.length === 0 && (
                <div className="py-20 text-center bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-600 mb-4">
                        <CalendarClock size={32} />
                    </div>
                    <p className="text-gray-300 font-bold text-lg">Nenhum agendamento encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">Tente alterar os filtros ou cadastrar uma nova reserva.</p>
                </div>
            )}

            {/* PAGINAÇÃO */}
            {totalPages > 0 && (
                <div className="flex justify-between items-center py-4 no-print border-t border-gray-800 mt-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">
            Página <span className="text-white">{page + 1}</span> de {totalPages}
          </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-gray-800 border border-gray-700 transition-all active:scale-95"
                        >
                            <ChevronLeft size={14} /> Anterior
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-gray-300 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-gray-800 border border-gray-700 transition-all active:scale-95"
                        >
                            Próxima <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Iniciar Locação</h3>
                                <p className="text-gray-400 text-xs mt-1">Atribua um equipamento para {selectedRental?.customer?.fullName}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block ml-1">Equipamento</label>
                                <InternalEquipmentSearch onSelect={setSelectedEquipment} initialValue={selectedEquipment} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block ml-1">Motorista</label>
                                <InternalDriverSearch onSelect={setSelectedDriver} initialValue={selectedDriver} />
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                                <div className="text-xs text-blue-400 font-bold uppercase mb-2">Resumo do Agendamento</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase">Valor</div>
                                        <div className="text-sm font-mono text-white">R$ {selectedRental?.charge?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase">Início</div>
                                        <div className="text-sm text-white">{formatDate(selectedRental?.startDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-800/30 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-800 text-gray-400 font-bold text-sm hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmActivation}
                                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                            >
                                Confirmar e Ativar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDriverModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Designar Motorista</h3>
                                <p className="text-gray-400 text-xs mt-1">Selecione o motorista para {selectedRental?.customer?.fullName}</p>
                            </div>
                            <button onClick={() => setIsDriverModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block ml-1">Motorista</label>
                                <InternalDriverSearch onSelect={setSelectedDriver} initialValue={selectedDriver} />
                            </div>
                        </div>

                        <div className="p-6 bg-gray-800/30 flex flex-col md:flex-row gap-3">
                            {selectedRental?.driver && (
                                <button
                                    onClick={handleRemoveDriver}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-colors border border-red-500/20 order-3 md:order-1"
                                >
                                    Remover
                                </button>
                            )}
                            <button
                                onClick={() => setIsDriverModalOpen(false)}
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-800 text-gray-400 font-bold text-sm hover:bg-gray-700 transition-colors order-2"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDriverAssignment}
                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95 order-1 md:order-3"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduledRentals;
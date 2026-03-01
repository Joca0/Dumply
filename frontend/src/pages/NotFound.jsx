import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-lg w-full text-center relative z-10">
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 animate-pulse"></div>
                    <h1 className="text-[120px] font-black text-white leading-none tracking-tighter relative">
                        404
                    </h1>
                    <div className="absolute -right-4 -top-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl rotate-12">
                        <Search className="text-blue-500" size={32} />
                    </div>
                </div>

                {/* Mensagem */}
                <div className="space-y-4 mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Caminho sem saída.</h2>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                        A página que você está procurando não existe ou foi movida para um novo endereço no sistema.
                    </p>
                </div>

                {/* Card de Ações Rápidas */}
                <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-[2.5rem] backdrop-blur-sm shadow-2xl space-y-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 group"
                    >
                        <Home size={20} className="group-hover:scale-110 transition-transform" />
                        Voltar para luz
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-xl text-xs font-bold border border-gray-700 transition-all"
                        >
                            <ArrowLeft size={16} /> Voltar
                        </button>
                    </div>
                </div>
                <p className="mt-12 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    Dumply Gestão de Equipamentos
                </p>
            </div>
        </div>
    );
};

export default NotFound;
import React, { useState } from 'react';
import { Rocket, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const WelcomeStep = ({ onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [consent, setConsent] = useState(false);

    const handleStart = async () => {
        if (!consent) {
            toast.error("Você precisa aceitar os termos da Política de Privacidade para continuar.");
            return;
        }

        setLoading(true);
        try {
            if (onComplete) await onComplete({
                consentGiven: true,
                consentVersion: "v1.0"
            });
            toast.success("Tudo pronto! Bem-vindo ao Dumply.");
        } catch (error) {
            toast.error("Erro ao processar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Container Principal do Modal - Mais estreito (max-w-lg) e com overflow-hidden para conter os glows */
        <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden">

            {/* Elementos Decorativos de Fundo (Glows Menores) */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Área de Conteúdo */}
            <div className="relative z-10 p-6 md:p-8">

                {/* Ícone de Destaque no Topo */}
                <div className="flex justify-center mb-6">
                    <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-400/30">
                        <Rocket size={32} className="text-white" />
                    </div>
                </div>

                {/* Textos Principais */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Acesso Exclusivo</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                        Bem-vindo ao Teste fechado
                    </h2>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        Sua empresa foi selecionada para validar o <span className="text-white font-bold">Dumply</span>.
                        Este é um teste fechado e a plataforma ainda está em evolução, você pode encontrar
                        ajustes visuais, melhorias em andamento e novas funcionalidades sendo liberadas.
                        Sua experiência e feedback são fundamentais antes do lançamento oficial.
                        Seu ambiente já está configurado e pronto para uso.
                    </p>
                </div>

                {/* Grid de Benefícios / Informações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50 flex flex-col gap-1.5">
                        <ShieldCheck className="text-emerald-400" size={20} />
                        <h4 className="text-white font-bold text-xs tracking-wide mt-1">Ambiente Seguro</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Dados isolados com criptografia de ponta a ponta.
                        </p>
                    </div>
                    <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50 flex flex-col gap-1.5">
                        <CheckCircle2 className="text-blue-400" size={20} />
                        <h4 className="text-white font-bold text-xs tracking-wide mt-1">Feedback Direto</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Canal prioritário com os desenvolvedores.
                        </p>
                    </div>
                </div>

                {/* LGPD Consent */}
                <div className="mb-8 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                            <input
                                type="checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-700 bg-gray-950 checked:bg-blue-600 checked:border-blue-600 transition-all"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                            />
                            <CheckCircle2 size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                                Aceito os termos da Política de Privacidade
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                Ao prosseguir, você confirma que leu e concorda com o tratamento de seus dados pessoais conforme a LGPD para fins de prestação de serviço.
                            </p>
                        </div>
                    </label>
                </div>

                {/* Ação Principal */}
                <div className="pt-2">
                    <button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Começar a usar
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeStep;